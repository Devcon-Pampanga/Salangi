import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import type { Event } from "../../Data/Events";
import { LOCATIONS, CITY_COORDS } from "../../../constant/location";
import { X, Plus, ChevronLeft, ChevronRight, Link2, ExternalLink } from "lucide-react";
import { FaFacebook, FaInstagram, FaClipboardList, FaTicketAlt, FaGlobe, FaYoutube, FaTwitter } from "react-icons/fa";
import { FaLink } from "react-icons/fa6";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventLink {
  label: string;
  url: string;
  isPrimary?: boolean;
}

interface EventPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: any) => void;
  editEvent?: Event | null;
  userListings?: { id: number; name: string; location: string }[];
}

// ─── Link type metadata ───────────────────────────────────────────────────────

const LINK_PRESETS: { label: string; placeholder: string; icon: React.ReactNode; isPrimary?: boolean }[] = [
  { label: "Registration Form", placeholder: "https://forms.google.com/...", icon: <FaClipboardList className="text-zinc-400" />, isPrimary: true },
  { label: "Facebook Event",    placeholder: "https://facebook.com/events/...", icon: <FaFacebook className="text-zinc-400" /> },
  { label: "Website",           placeholder: "https://yourwebsite.com", icon: <FaGlobe className="text-zinc-400" /> },
  { label: "Tickets",           placeholder: "https://tickets.com/...", icon: <FaTicketAlt className="text-zinc-400" />, isPrimary: true },
  { label: "Instagram",         placeholder: "https://instagram.com/...", icon: <FaInstagram className="text-zinc-400" /> },
];

function getLinkIcon(label: string): React.ReactNode {
  const lower = label.toLowerCase();
  const iconClass = "text-[#FBFAF8]/60 group-hover:text-[#FFE2A0] transition-colors shrink-0";
  
  if (lower.includes("facebook") || lower.includes("fb")) return <FaFacebook className={iconClass} />;
  if (lower.includes("instagram") || lower.includes("ig"))  return <FaInstagram className={iconClass} />;
  if (lower.includes("register") || lower.includes("form")) return <FaClipboardList className={iconClass} />;
  if (lower.includes("ticket"))                              return <FaTicketAlt className={iconClass} />;
  if (lower.includes("website") || lower.includes("web"))   return <FaGlobe className={iconClass} />;
  if (lower.includes("youtube") || lower.includes("video")) return <FaYoutube className={iconClass} />;
  if (lower.includes("twitter") || lower.includes("x.com")) return <FaTwitter className={iconClass} />;
  return <FaLink className={iconClass} />;
}

function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ─── Geocoding ────────────────────────────────────────────────────────────────

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encoded = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=ph`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ─── Draggable Map ────────────────────────────────────────────────────────────

function DraggableMap({ lat, lng, onPinMove }: { lat: number; lng: number; onPinMove: (lat: number, lng: number) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([lat, lng], 17);
      mapInstanceRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current = marker;
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onPinMove(pos.lat, pos.lng);
      });
    }
    return () => { mapInstanceRef.current?.remove(); mapInstanceRef.current = null; markerRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    mapInstanceRef.current.flyTo([lat, lng], 17, { animate: true, duration: 1 });
  }, [lat, lng]);

  return (
    <div className="flex flex-col gap-2">
      <div ref={mapRef} style={{ height: "200px", width: "100%", borderRadius: "10px", overflow: "hidden" }} />
      <p className="text-xs text-center" style={{ color: "#666666" }}>📍 Drag the pin to set the exact location of your event</p>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function PostEventModal({ isOpen, onClose, onAddEvent, editEvent, userListings = [] }: EventPostModalProps) {
  const [form, setForm] = useState({
    title: "",
    dateFrom: "",
    dateTo: "",
    timeFrom: "",
    timeTo: "",
    city: "",
    barangay: "",
    description: "",
    listingId: "" as string | number,
  });

  const [images, setImages]       = useState<{ file?: File; preview: string; existing?: string }[]>([]);
  const [links, setLinks]         = useState<EventLink[]>([]);
  const [linkErrors, setLinkErrors] = useState<Record<number, string>>({});
  // Track which link row is currently being edited (expanded)
  const [editingLinkIdx, setEditingLinkIdx] = useState<number | null>(null);

  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lat, setLat]                 = useState<number | null>(null);
  const [lng, setLng]                 = useState<number | null>(null);
  const [geocoding, setGeocoding]     = useState(false);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const geocodeTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Geocode effect ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!form.city) { setLat(null); setLng(null); return; }
    if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
    geocodeTimeout.current = setTimeout(async () => {
      setGeocoding(true);
      const attempts = [
        form.barangay ? `${form.barangay}, ${form.city}, Pampanga, Philippines` : null,
        `${form.city}, Pampanga, Philippines`,
      ].filter(Boolean) as string[];
      let coords: { lat: number; lng: number } | null = null;
      for (const a of attempts) { coords = await geocodeAddress(a); if (coords) break; }
      if (!coords) coords = CITY_COORDS[form.city] ?? { lat: 15.145, lng: 120.5887 };
      setLat(coords.lat); setLng(coords.lng); setGeocoding(false);
    }, 800);
    return () => { if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current); };
  }, [form.city, form.barangay]);

  // ── Populate form on edit ───────────────────────────────────────────────────
  useEffect(() => {
    if (editEvent) {
      const parts = editEvent.location?.split(", ") || [];
      setForm({
        title:       editEvent.title,
        dateFrom:    "",
        dateTo:      "",
        timeFrom:    editEvent.time?.split(" - ")[0] || "",
        timeTo:      editEvent.time?.split(" - ")[1] || "",
        city:        parts[1] || parts[0] || "",
        barangay:    parts[0] || "",
        description: editEvent.description,
        listingId:   (editEvent as any).listing_id ?? "",
      });

      // Images
      const existingImages: { preview: string; existing: string }[] = [];
      const existingArr: string[] = (editEvent as any).images ?? [];
      if (existingArr.length > 0) {
        existingArr.forEach((url: string) => existingImages.push({ preview: url, existing: url }));
      } else if ((editEvent as any).image_url) {
        existingImages.push({ preview: (editEvent as any).image_url, existing: (editEvent as any).image_url });
      }
      setImages(existingImages);

      // Links
      const existingLinks: EventLink[] = (editEvent as any).links ?? [];
      setLinks(existingLinks);
    } else {
      setForm({
        title: "", dateFrom: "", dateTo: "", timeFrom: "", timeTo: "",
        city: "", barangay: "", description: "",
        listingId: userListings.length === 1 ? userListings[0].id : "",
      });
      setImages([]);
      setLinks([]);
      setLat(null);
      setLng(null);
    }
    setLinkErrors({});
    setEditingLinkIdx(null);
  }, [editEvent, isOpen, userListings]);

  // ── Form change ─────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Image handlers ──────────────────────────────────────────────────────────
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newImages = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...newImages].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageRemove = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  // ── Link handlers ───────────────────────────────────────────────────────────
  const MAX_LINKS = 5;

  const addBlankLink = () => {
    if (links.length >= MAX_LINKS) return;
    setLinks((prev) => [...prev, { label: "", url: "" }]);
    setEditingLinkIdx(links.length); // open the new row immediately
  };

  const addPresetLink = (preset: typeof LINK_PRESETS[number]) => {
    if (links.length >= MAX_LINKS) return;
    // Don't duplicate same label
    if (links.some((l) => l.label === preset.label)) return;
    setLinks((prev) => [...prev, { label: preset.label, url: "", isPrimary: preset.isPrimary }]);
    setEditingLinkIdx(links.length);
  };

  const updateLink = (idx: number, field: keyof EventLink, value: string | boolean) => {
    setLinks((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
    if (field === "url") {
      setLinkErrors((prev) => {
        const next = { ...prev };
        if (!value || isValidUrl(value as string)) delete next[idx];
        else next[idx] = "URL must start with http:// or https://";
        return next;
      });
    }
  };

  const removeLink = (idx: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
    setLinkErrors((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki !== idx) next[ki > idx ? ki - 1 : ki] = v;
      });
      return next;
    });
    if (editingLinkIdx === idx) setEditingLinkIdx(null);
    else if (editingLinkIdx !== null && editingLinkIdx > idx) setEditingLinkIdx(editingLinkIdx - 1);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!form.title || (!editEvent && !form.dateFrom)) return;

    // Validate all link URLs before submit
    const newErrors: Record<number, string> = {};
    links.forEach((l, i) => {
      if (l.url && !isValidUrl(l.url)) newErrors[i] = "URL must start with http:// or https://";
    });
    if (Object.keys(newErrors).length) { setLinkErrors(newErrors); return; }

    setSubmitting(true);
    setSubmitError("");

    try {
      // Upload images
      const uploadedUrls: string[] = [];
      for (const img of images) {
        if (img.file) {
          const fileExt = img.file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("events-image")
            .upload(fileName, img.file, { upsert: true });
          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from("events-image").getPublicUrl(uploadData.path);
            uploadedUrls.push(publicUrlData.publicUrl);
          }
        } else if (img.existing) {
          uploadedUrls.push(img.existing);
        }
      }

      const primaryImageUrl = uploadedUrls[0] ?? "";
      const effectiveDateFrom = form.dateFrom || (editEvent ? (editEvent as any).date_range?.split(" to ")[0] || "2026-05-02" : "");
      const dateObj     = new Date(effectiveDateFrom);
      const month       = dateObj.toLocaleString("en-US", { month: "short" });
      const day         = dateObj.getDate().toString();
      const timeDisplay = `${form.timeFrom || ""}${form.timeFrom && form.timeTo ? " - " : ""}${form.timeTo || ""}`;
      const dateRange   = form.dateTo && form.dateTo !== form.dateFrom ? `${effectiveDateFrom} to ${form.dateTo}` : effectiveDateFrom;
      const locationDisplay = [form.barangay, form.city].filter(Boolean).join(", ");
      const { data: { user } } = await supabase.auth.getUser();
      const listingIdValue = form.listingId !== "" ? Number(form.listingId) : null;

      // Filter out empty links
      const cleanedLinks = links.filter((l) => l.label.trim() && l.url.trim());

      const payload = {
        title:       form.title,
        description: form.description,
        location:    locationDisplay,
        time:        timeDisplay,
        date:        effectiveDateFrom,
        date_range:  dateRange,
        month:       effectiveDateFrom ? month : "",
        day:         effectiveDateFrom ? day : "",
        image_url:   primaryImageUrl,
        images:      uploadedUrls,
        links:       cleanedLinks,
        lat:         lat ?? undefined,
        lng:         lng ?? undefined,
        listing_id:  listingIdValue,
        verified:    false,
      };

      if ((editEvent as any)?.id) {
        const { error } = await supabase.from("events").update(payload).eq("id", (editEvent as any).id);
        if (error) throw error;
        onAddEvent({ id: (editEvent as any).id, ...payload, pending: true });
      } else {
        const { data: inserted, error } = await supabase
          .from("events")
          .insert({ ...payload, user_id: user?.id ?? null })
          .select()
          .single();
        if (error) throw error;
        onAddEvent({ ...inserted, pending: true });
      }
      handleClose();
    } catch (err: any) {
      console.error("Submit error:", err);
      setSubmitError(err?.message || "Failed to submit event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
    if (!editEvent) {
      setForm({ title: "", dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", city: "", barangay: "", description: "", listingId: "" });
      setImages([]);
      setLinks([]);
      setLat(null);
      setLng(null);
    }
    setLinkErrors({});
    setEditingLinkIdx(null);
  };

  if (!isOpen) return null;

  // ── Shared style helpers ────────────────────────────────────────────────────
  const inputBase: React.CSSProperties = { backgroundColor: "#2a2a2a", border: "1px solid #444444", color: "#e8e8e8" };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#FFE2A0";
    e.currentTarget.style.boxShadow   = "0 0 0 2px rgba(255,226,160,0.1)";
    e.currentTarget.style.outline     = "none";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#444444";
    e.currentTarget.style.boxShadow   = "none";
  };

  const canSubmit = !!form.title && (!!(editEvent) || !!form.dateFrom);

  // Presets not yet added
  const availablePresets = LINK_PRESETS.filter((p) => !links.some((l) => l.label === p.label));

  return (
    <>
      <style>{`
        .event-modal-select option { background-color: #2a2a2a; color: #e8e8e8; }
        .event-modal-select option:checked { background-color: #3a3a3a; color: #FFE2A0; }
        .link-input-field::placeholder { color: #555; }
        .link-row-enter { animation: linkRowIn 0.18s ease; }
        @keyframes linkRowIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div
          className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl text-left max-h-[90vh] flex flex-col"
          style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
        >
          {/* Gold top bar */}
          <div className="h-1 w-full shrink-0" style={{ backgroundColor: "#FFE2A0" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
            <div>
              <h2 className="text-lg font-semibold tracking-wide" style={{ color: "#FFE2A0" }}>
                {editEvent ? "Edit Event" : "Post New Event"}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
                {editEvent
                  ? "Changes will be re-reviewed before going live"
                  : "Your event will be reviewed before it appears publicly"}
              </p>
            </div>
            <button
              onClick={handleClose} disabled={submitting}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: "#2e2e2e", color: "#888888" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3a3a3a"; e.currentTarget.style.color = "#FFE2A0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2e2e2e"; e.currentTarget.style.color = "#888888"; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mx-6 h-px shrink-0" style={{ backgroundColor: "#2e2e2e" }} />

          {/* Approval notice */}
          <div className="mx-6 mt-4 shrink-0 rounded-lg px-4 py-3 flex items-start gap-3"
            style={{ backgroundColor: "#2a2a2a", border: "1px solid #444" }}>
            <span className="text-base mt-0.5">⏳</span>
            <p className="text-xs leading-relaxed" style={{ color: "#aaaaaa" }}>
              Events require admin approval before appearing publicly. Your event will show as{" "}
              <span style={{ color: "#FFE2A0" }}>Pending Review</span> until approved.
            </p>
          </div>

          {/* ── Scrollable body ─────────────────────────────────────────────── */}
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

            {/* Listing selector */}
            {userListings.length > 1 && (
              <div>
                <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
                  Link to Listing <span style={{ color: "#f97316" }}>*</span>
                </label>
                <select
                  value={form.listingId}
                  onChange={(e) => setForm((prev) => ({ ...prev, listingId: e.target.value }))}
                  onFocus={handleFocus} onBlur={handleBlur}
                  className="event-modal-select w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 appearance-none"
                  style={{ ...inputBase, color: form.listingId ? "#e8e8e8" : "#666666" }}
                >
                  <option value="" disabled style={{ color: "#666666" }}>Select which business this event is for</option>
                  {userListings.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}

            {userListings.length === 1 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: "#FFE2A0]/10", border: "1px solid rgba(255,226,160,0.2)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0" style={{ color: "#FFE2A0" }}>
                  <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5h-.75V3.75a.75.75 0 0 0 0-1.5h-15Z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium" style={{ color: "#FFE2A0" }}>
                  This event will be linked to: <span className="font-bold">{userListings[0].name}</span>
                </span>
              </div>
            )}

            {/* Images */}
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
                Event Images <span className="text-xs font-normal" style={{ color: "#666" }}>(up to 5)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#444]">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleImageRemove(idx)}
                      className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgba(0,0,0,0.75)", color: "#fff" }}
                    >
                      <X size={10} />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold py-0.5"
                        style={{ backgroundColor: "rgba(255,226,160,0.85)", color: "#222" }}>
                        COVER
                      </div>
                    )}
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer border"
                    style={{ backgroundColor: "#2a2a2a", borderColor: "#444444", borderStyle: "dashed", color: "#888888" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FFE2A0"; e.currentTarget.style.color = "#FFE2A0"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#444444"; e.currentTarget.style.color = "#888888"; }}
                  >
                    <Plus size={20} />
                    <span className="text-[10px]">Add photo</span>
                  </button>
                )}
              </div>
              <p className="text-xs mt-1.5" style={{ color: "#555" }}>First image is used as the cover. PNG, JPG, WEBP up to 5MB each.</p>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handleImageAdd} />
            </div>

            {/* Title */}
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>Event Title</label>
              <input
                name="title" value={form.title} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                placeholder="e.g. Sisig Festival Promo Night"
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                style={inputBase}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>Date From</label>
                <input type="date" name="dateFrom" value={form.dateFrom} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                  className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                  style={{ ...inputBase, colorScheme: "dark", color: form.dateFrom ? "#e8e8e8" : "#666666" }} />
              </div>
              <div>
                <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>Date To</label>
                <input type="date" name="dateTo" value={form.dateTo} min={form.dateFrom || undefined} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                  className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                  style={{ ...inputBase, colorScheme: "dark", color: form.dateTo ? "#e8e8e8" : "#666666" }} />
              </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>Start Time</label>
                <input type="time" name="timeFrom" value={form.timeFrom} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                  className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                  style={{ ...inputBase, colorScheme: "dark", color: form.timeFrom ? "#e8e8e8" : "#666666" }} />
              </div>
              <div>
                <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>End Time</label>
                <input type="time" name="timeTo" value={form.timeTo} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                  className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                  style={{ ...inputBase, colorScheme: "dark", color: form.timeTo ? "#e8e8e8" : "#666666" }} />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>Location</label>
              <select
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value, barangay: "" }))}
                onFocus={handleFocus} onBlur={handleBlur}
                className="event-modal-select w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 appearance-none mb-3"
                style={{ ...inputBase, color: form.city ? "#e8e8e8" : "#666666" }}
              >
                <option value="" disabled style={{ color: "#666666" }}>Select city / municipality</option>
                {Object.keys(LOCATIONS).map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              {form.city && (
                <select
                  value={form.barangay}
                  onChange={(e) => setForm((prev) => ({ ...prev, barangay: e.target.value }))}
                  onFocus={handleFocus} onBlur={handleBlur}
                  className="event-modal-select w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 appearance-none mb-3"
                  style={{ ...inputBase, color: form.barangay ? "#e8e8e8" : "#666666" }}
                >
                  <option value="" style={{ color: "#666666" }}>Select barangay (optional)</option>
                  {LOCATIONS[form.city]?.map((brgy: string) => <option key={brgy} value={brgy}>{brgy}</option>)}
                </select>
              )}
              {lat !== null && lng !== null && (
                <div className="mt-1">
                  {geocoding && <p className="text-xs mb-2 animate-pulse" style={{ color: "rgba(255,226,160,0.7)" }}>📡 Finding location…</p>}
                  <DraggableMap lat={lat} lng={lng} onPinMove={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                rows={3} placeholder="Describe your event..."
                className="w-full rounded-lg px-4 py-2.5 text-sm resize-none transition-all duration-200"
                style={inputBase}
              />
            </div>

            {/* ── EVENT LINKS & PROMOTION ──────────────────────────────────── */}
            <div>
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Link2 size={15} style={{ color: "#FFE2A0" }} />
                  <label className="font-normal text-md tracking-wide" style={{ color: "#FFE2A0" }}>
                    Event Links &amp; Promotion
                  </label>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#2e2e2e", color: "#666" }}>
                    {links.length}/{MAX_LINKS}
                  </span>
                </div>
                {links.length < MAX_LINKS && (
                  <button
                    onClick={addBlankLink}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "#2a2a2a", color: "#888", border: "1px solid #444" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FFE2A0"; e.currentTarget.style.color = "#FFE2A0"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#888"; }}
                  >
                    <Plus size={12} /> Add custom
                  </button>
                )}
              </div>

              {/* Quick-add preset buttons */}
              {links.length < MAX_LINKS && availablePresets.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {availablePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => addPresetLink(preset)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundColor: preset.isPrimary ? "rgba(255,226,160,0.08)" : "#2a2a2a",
                        border: preset.isPrimary ? "1px solid rgba(255,226,160,0.3)" : "1px solid #3a3a3a",
                        color: preset.isPrimary ? "#FFE2A0" : "#888",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#FFE2A0";
                        e.currentTarget.style.color = "#FFE2A0";
                        e.currentTarget.style.backgroundColor = "rgba(255,226,160,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = preset.isPrimary ? "rgba(255,226,160,0.3)" : "#3a3a3a";
                        e.currentTarget.style.color = preset.isPrimary ? "#FFE2A0" : "#888";
                        e.currentTarget.style.backgroundColor = preset.isPrimary ? "rgba(255,226,160,0.08)" : "#2a2a2a";
                      }}
                    >
                      <span>{preset.icon}</span>
                      <span>+ {preset.label}</span>
                      {preset.isPrimary && (
                        <span className="text-[9px] px-1 py-0.5 rounded font-bold"
                          style={{ backgroundColor: "rgba(255,226,160,0.2)", color: "#FFE2A0" }}>
                          KEY
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Link rows */}
              {links.length === 0 ? (
                <div className="rounded-lg px-4 py-5 text-center" style={{ backgroundColor: "#252525", border: "1px dashed #383838" }}>
                  <div className="flex justify-center mb-2">
                    <FaLink size={20} className="text-zinc-500" />
                  </div>
                  <p className="text-xs" style={{ color: "#555" }}>No links added yet. Use the presets above or add a custom link.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {links.map((link, idx) => {
                    const icon      = getLinkIcon(link.label);
                    const isEditing = editingLinkIdx === idx;
                    const hasError  = !!linkErrors[idx];

                    return (
                      <div
                        key={idx}
                        className="link-row-enter rounded-xl overflow-hidden transition-all duration-200"
                        style={{
                          backgroundColor: "#252525",
                          border: hasError
                            ? "1px solid rgba(239,68,68,0.5)"
                            : isEditing
                              ? "1px solid rgba(255,226,160,0.3)"
                              : "1px solid #333",
                        }}
                      >
                        {/* Row summary / collapsed view */}
                        {!isEditing ? (
                          <div
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer group"
                            onClick={() => setEditingLinkIdx(idx)}
                          >
                            <span className="text-base shrink-0">{icon}</span>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate" style={{ color: link.label ? "#e8e8e8" : "#555" }}>
                                  {link.label || <em style={{ color: "#555" }}>Untitled link</em>}
                                </span>
                                {link.isPrimary && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0"
                                    style={{ backgroundColor: "rgba(255,226,160,0.15)", color: "#FFE2A0" }}>
                                    PRIMARY
                                  </span>
                                )}
                              </div>
                              <p className="text-xs truncate mt-0.5" style={{ color: link.url ? "#555" : "#444" }}>
                                {link.url || "No URL set — tap to edit"}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {link.url && isValidUrl(link.url) && (
                                <a
                                  href={link.url} target="_blank" rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center justify-center w-6 h-6 rounded transition-all duration-150"
                                  style={{ color: "#555" }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = "#FFE2A0"}
                                  onMouseLeave={(e) => e.currentTarget.style.color = "#555"}
                                  title="Open link"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); removeLink(idx); }}
                                className="flex items-center justify-center w-6 h-6 rounded transition-all duration-150"
                                style={{ color: "#555" }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "#555"}
                                title="Remove link"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Expanded / editing view */
                          <div className="p-3 space-y-2">
                            {/* Label + primary toggle row */}
                            <div className="flex items-center gap-2">
                              <span className="text-base">{icon}</span>
                              <input
                                className="link-input-field flex-1 rounded-lg px-3 py-1.5 text-sm transition-all duration-200"
                                style={{ ...inputBase, fontSize: "13px" }}
                                placeholder="Label (e.g. Registration Form)"
                                value={link.label}
                                onChange={(e) => updateLink(idx, "label", e.target.value)}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                              />
                              {/* Primary toggle */}
                              <button
                                onClick={() => updateLink(idx, "isPrimary", !link.isPrimary)}
                                title={link.isPrimary ? "Remove primary highlight" : "Mark as primary link"}
                                className="shrink-0 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer"
                                style={{
                                  backgroundColor: link.isPrimary ? "rgba(255,226,160,0.15)" : "#2a2a2a",
                                  border: link.isPrimary ? "1px solid rgba(255,226,160,0.4)" : "1px solid #444",
                                  color: link.isPrimary ? "#FFE2A0" : "#555",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FFE2A0"; e.currentTarget.style.color = "#FFE2A0"; }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = link.isPrimary ? "rgba(255,226,160,0.4)" : "#444";
                                  e.currentTarget.style.color = link.isPrimary ? "#FFE2A0" : "#555";
                                }}
                              >
                                {link.isPrimary ? "⭐ KEY" : "☆ KEY"}
                              </button>
                              {/* Remove */}
                              <button
                                onClick={() => removeLink(idx)}
                                className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 cursor-pointer"
                                style={{ backgroundColor: "#2a2a2a", color: "#666", border: "1px solid #444" }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2a2a2a"; e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#444"; }}
                              >
                                <X size={13} />
                              </button>
                            </div>

                            {/* URL input */}
                            <div>
                              <div className="relative">
                                <input
                                  className="link-input-field w-full rounded-lg px-3 py-1.5 text-sm transition-all duration-200 pr-8"
                                  style={{
                                    ...inputBase,
                                    fontSize: "13px",
                                    borderColor: hasError ? "rgba(239,68,68,0.6)" : "#444444",
                                  }}
                                  placeholder={
                                    LINK_PRESETS.find((p) => p.label === link.label)?.placeholder ||
                                    "https://example.com"
                                  }
                                  value={link.url}
                                  onChange={(e) => updateLink(idx, "url", e.target.value)}
                                  onFocus={(e) => {
                                    e.currentTarget.style.borderColor = hasError ? "#ef4444" : "#FFE2A0";
                                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,226,160,0.1)";
                                    e.currentTarget.style.outline = "none";
                                  }}
                                  onBlur={(e) => {
                                    e.currentTarget.style.borderColor = hasError ? "rgba(239,68,68,0.6)" : "#444444";
                                    e.currentTarget.style.boxShadow = "none";
                                  }}
                                />
                                {link.url && isValidUrl(link.url) && (
                                  <a
                                    href={link.url} target="_blank" rel="noopener noreferrer"
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    style={{ color: "#FFE2A0" }}
                                    title="Open link"
                                  >
                                    <ExternalLink size={13} />
                                  </a>
                                )}
                              </div>
                              {hasError && (
                                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
                                  <span>⚠</span> {linkErrors[idx]}
                                </p>
                              )}
                            </div>

                            {/* Done button */}
                            <div className="flex justify-end">
                              <button
                                onClick={() => setEditingLinkIdx(null)}
                                className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                                style={{ backgroundColor: "rgba(255,226,160,0.1)", color: "#FFE2A0", border: "1px solid rgba(255,226,160,0.25)" }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,226,160,0.18)"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,226,160,0.1)"}
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {links.length >= MAX_LINKS && (
                <p className="text-xs mt-2 text-center" style={{ color: "#555" }}>Maximum of {MAX_LINKS} links reached.</p>
              )}
            </div>
            {/* ── END LINKS SECTION ─────────────────────────────────────────── */}

            {submitError && <p className="text-red-400 text-sm text-center">{submitError}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 shrink-0" style={{ borderTop: "1px solid #2e2e2e" }}>
            <button
              onClick={handleClose} disabled={submitting}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: "#2a2a2a", color: "#999999", border: "1px solid #444444" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#e0e0e0"; e.currentTarget.style.borderColor = "#666666"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#999999"; e.currentTarget.style.borderColor = "#444444"; }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "#FFE2A0", color: "#1a1a1a" }}
              onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.backgroundColor = "#f5d47a"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,226,160,0.25)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFE2A0"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {submitting
                ? (editEvent ? "Saving..." : "Submitting...")
                : (editEvent ? "Save Changes" : "Submit for Review")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}