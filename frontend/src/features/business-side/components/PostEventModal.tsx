import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import type { Event } from "../../Data/Events";
import { LOCATIONS, CITY_COORDS } from "../../../constant/location";
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

interface EventPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: any) => void;
  editEvent?: Event | null;
  userListings?: { id: number; name: string; location: string }[];
}

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

export default function PostEventModal({ isOpen, onClose, onAddEvent, editEvent }: EventPostModalProps) {
  const [form, setForm] = useState({ title: "", dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", city: "", barangay: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const geocodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (editEvent) {
      const parts = editEvent.location?.split(", ") || [];
      setForm({ title: editEvent.title, dateFrom: "", dateTo: "", timeFrom: editEvent.time?.split(" - ")[0] || "", timeTo: editEvent.time?.split(" - ")[1] || "", city: parts[1] || parts[0] || "", barangay: parts[0] || "", description: editEvent.description });
      setImagePreview(editEvent.image_url || null);
      setImageFile(null);
    } else {
      setForm({ title: "", dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", city: "", barangay: "", description: "" });
      setImageFile(null); setImagePreview(null); setLat(null); setLng(null);
    }
  }, [editEvent, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!form.title || (!editEvent && !form.dateFrom)) return;
    setSubmitting(true); setSubmitError("");
    try {
      let uploadedImageUrl = editEvent?.image_url || "";
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("events-image").upload(fileName, imageFile, { upsert: true });
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from("events-image").getPublicUrl(uploadData.path);
          uploadedImageUrl = publicUrlData.publicUrl;
        }
      }

      const effectiveDateFrom = form.dateFrom || (editEvent ? "2026-05-02" : "");
      const dateObj = new Date(effectiveDateFrom);
      const month = dateObj.toLocaleString("en-US", { month: "short" });
      const day = dateObj.getDate().toString();
      const timeDisplay = `${form.timeFrom || ""}${form.timeFrom && form.timeTo ? " - " : ""}${form.timeTo || ""}`;
      const dateRange = form.dateTo && form.dateTo !== form.dateFrom ? `${effectiveDateFrom} to ${form.dateTo}` : effectiveDateFrom;
      const locationDisplay = [form.barangay, form.city].filter(Boolean).join(", ");
      const { data: { user } } = await supabase.auth.getUser();

      if (editEvent?.id) {
        const { error } = await supabase.from("events").update({
          title: form.title, description: form.description, location: locationDisplay,
          time: timeDisplay, date_range: dateRange, month: effectiveDateFrom ? month : "",
          day: effectiveDateFrom ? day : "", image_url: uploadedImageUrl,
          lat: lat ?? undefined, lng: lng ?? undefined,
          verified: false, // back to pending on edit
        }).eq("id", editEvent.id);
        if (error) throw error;
        onAddEvent({ id: editEvent.id, month, day, title: form.title, location: locationDisplay, time: timeDisplay, dateRange, description: form.description, image_url: uploadedImageUrl, pending: true });
      } else {
        // ── Insert with verified: false — awaits admin approval ──
        const { data: inserted, error } = await supabase.from("events").insert({
          title: form.title, description: form.description, location: locationDisplay,
          time: timeDisplay, date_range: dateRange,
          month: effectiveDateFrom ? month : "", day: effectiveDateFrom ? day : "",
          image_url: uploadedImageUrl, lat: lat ?? null, lng: lng ?? null,
          verified: false,
          user_id: user?.id ?? null,
        }).select().single();
        if (error) throw error;
        onAddEvent({ ...inserted, pending: true });
      }
      handleClose();
    } catch (err: any) {
      console.error("Submit error:", err);
      setSubmitError("Failed to submit event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
    if (!editEvent) {
      setForm({ title: "", dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", city: "", barangay: "", description: "" });
      setImageFile(null); setImagePreview(null); setLat(null); setLng(null);
    }
  };

  if (!isOpen) return null;

  const inputBase: React.CSSProperties = { backgroundColor: "#2a2a2a", border: "1px solid #444444", color: "#e8e8e8" };
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#FFE2A0"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,226,160,0.1)"; e.currentTarget.style.outline = "none";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#444444"; e.currentTarget.style.boxShadow = "none";
  };

  return (
    <>
      <style>{`.event-modal-select option { background-color: #2a2a2a; color: #e8e8e8; } .event-modal-select option:checked { background-color: #3a3a3a; color: #FFE2A0; }`}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}>
        <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl text-left max-h-[90vh] flex flex-col"
          style={{ backgroundColor: "#222222", border: "1px solid #333333" }}>
          <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: "#FFE2A0" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold tracking-wide" style={{ color: "#FFE2A0" }}>
                {editEvent ? "Edit Event" : "Post New Event"}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
                {editEvent ? "Changes will be re-reviewed before going live" : "Your event will be reviewed before it appears publicly"}
              </p>
            </div>
            <button onClick={handleClose} disabled={submitting}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: "#2e2e2e", color: "#888888" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3a3a3a"; e.currentTarget.style.color = "#FFE2A0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2e2e2e"; e.currentTarget.style.color = "#888888"; }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>

          <div className="mx-6 h-px flex-shrink-0" style={{ backgroundColor: "#2e2e2e" }} />

          {/* Approval notice */}
          <div className="mx-6 mt-4 flex-shrink-0 rounded-lg px-4 py-3 flex items-start gap-3"
            style={{ backgroundColor: "#2a2a2a", border: "1px solid #444" }}>
            <span className="text-base mt-0.5">⏳</span>
            <p className="text-xs leading-relaxed" style={{ color: "#aaaaaa" }}>
              Events require admin approval before appearing publicly. Your event will show as{" "}
              <span style={{ color: "#FFE2A0" }}>Pending Review</span> until approved.
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

            {/* Image */}
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>Event Image</label>
              {imagePreview ? (
                <div className="relative w-full rounded-lg overflow-hidden" style={{ height: "160px" }}>
                  <img src={imagePreview} alt="Event preview" className="w-full h-full object-cover" />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full cursor-pointer"
                    style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#e0e0e0", border: "1px solid #555" }}>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg flex flex-col items-center justify-center gap-2 py-6 transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: "#2a2a2a", border: "1px dashed #444444", color: "#888888" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FFE2A0"; e.currentTarget.style.color = "#FFE2A0"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#444444"; e.currentTarget.style.color = "#888888"; }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="text-sm">Click to upload event image</span>
                  <span className="text-xs" style={{ color: "#555" }}>PNG, JPG, WEBP up to 5MB</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageChange} />
            </div>

            {/* Title */}
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>Event Title</label>
              <input name="title" value={form.title} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                placeholder="e.g. Sisig Festival Promo Night"
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200" style={inputBase} />
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

            {/* Location + map */}
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>Location</label>
              <select value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value, barangay: "" }))}
                onFocus={handleFocus} onBlur={handleBlur}
                className="event-modal-select w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 appearance-none mb-3"
                style={{ ...inputBase, color: form.city ? "#e8e8e8" : "#666666" }}>
                <option value="" disabled style={{ color: "#666666" }}>Select city / municipality</option>
                {Object.keys(LOCATIONS).map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              {form.city && (
                <select value={form.barangay} onChange={(e) => setForm((prev) => ({ ...prev, barangay: e.target.value }))}
                  onFocus={handleFocus} onBlur={handleBlur}
                  className="event-modal-select w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 appearance-none mb-3"
                  style={{ ...inputBase, color: form.barangay ? "#e8e8e8" : "#666666" }}>
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
              <textarea name="description" value={form.description} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
                rows={3} placeholder="Describe your event..."
                className="w-full rounded-lg px-4 py-2.5 text-sm resize-none transition-all duration-200" style={inputBase} />
            </div>

            {submitError && <p className="text-red-400 text-sm text-center">{submitError}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid #2e2e2e" }}>
            <button onClick={handleClose} disabled={submitting}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: "#2a2a2a", color: "#999999", border: "1px solid #444444" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#e0e0e0"; e.currentTarget.style.borderColor = "#666666"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#999999"; e.currentTarget.style.borderColor = "#444444"; }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting || !form.title || (!editEvent && !form.dateFrom)}
              className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "#FFE2A0", color: "#1a1a1a" }}
              onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.backgroundColor = "#f5d47a"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,226,160,0.25)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFE2A0"; e.currentTarget.style.boxShadow = "none"; }}>
              {submitting ? (editEvent ? "Saving..." : "Submitting...") : (editEvent ? "Save Changes" : "Submit for Review")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}