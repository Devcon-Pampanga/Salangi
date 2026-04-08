import { useState, useEffect } from "react";
import type { Event } from "../../Data/Events";

interface EventPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: any) => void;
  editEvent?: Event | null;
  userListings?: { id: number; name: string; location: string }[];
}

export default function PostEventModal({ isOpen, onClose, onAddEvent, editEvent, userListings }: EventPostModalProps) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    timeFrom: "",
    timeTo: "",
    location: "",
    description: "",
  });
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [useBusinessLocation, setUseBusinessLocation] = useState(false);

  useEffect(() => {
    if (editEvent) {
      const eventLocation = editEvent.location.split(", ")[0] || editEvent.location;
      
      setForm({
        title: editEvent.title,
        date: "", 
        timeFrom: editEvent.time.split(" - ")[0] || "",
        timeTo: editEvent.time.split(" - ")[1] || "",
        location: eventLocation,
        description: editEvent.description,
      });

      const listingIdStr = (editEvent as any).listing_id?.toString();
      if (listingIdStr) {
        setSelectedListingId(listingIdStr);
        const listing = userListings?.find(l => l.id.toString() === listingIdStr);
        // If the event's location matches the listing's full location or the derived eventLocation, toggle it on
        if (listing && (listing.location === editEvent.location || listing.location === eventLocation || editEvent.location.includes(listing.location))) {
          setUseBusinessLocation(true);
        } else {
          setUseBusinessLocation(false);
        }
      } else {
        setSelectedListingId("");
        setUseBusinessLocation(false);
      }
    } else {
      setForm({ title: "", date: "", timeFrom: "", timeTo: "", location: "", description: "" });
      setSelectedListingId("");
      setUseBusinessLocation(false);
    }
  }, [editEvent, isOpen]);

  useEffect(() => {
    if (useBusinessLocation && selectedListingId) {
      const listing = userListings?.find(l => l.id.toString() === selectedListingId);
      if (listing) {
        setForm(prev => ({ ...prev, location: listing.location }));
      }
    }
  }, [useBusinessLocation, selectedListingId, userListings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!form.title || (!editEvent && !form.date)) return;

    // Use current date if editing and date is empty (to avoid regression)
    const effectiveDate = form.date || (editEvent ? "2026-05-02" : ""); 
    
    // Format date for the high-end display (e.g., "Apr 5")
    const dateObj = new Date(effectiveDate);
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const day = dateObj.getDate().toString();

    // Format time and location display
    const timeDisplay = `${form.timeFrom || ''}${form.timeFrom && form.timeTo ? ' - ' : ''}${form.timeTo || ''}`;
    const locationDisplay = `${form.location}${timeDisplay ? ` ${timeDisplay}` : ''}`;

    onAddEvent({
      id: editEvent?.id,
      month: effectiveDate ? month : "",
      day: effectiveDate ? day : "",
      title: form.title,
      location: locationDisplay,
      listing_id: selectedListingId ? parseInt(selectedListingId) : undefined,
      description: form.description,
      image_url: (editEvent as any)?.image_url || ""
    });
    
    handleClose();
  };

  const handleClose = () => {
    onClose();
    if (!editEvent) {
      setForm({ title: "", date: "", timeFrom: "", timeTo: "", location: "", description: "" });
    }
  };

  if (!isOpen) return null;

  const inputBase: React.CSSProperties = {
    backgroundColor: "#2a2a2a",
    border: "1px solid #333333",
    color: "#e0e0e0",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#FFE2A0";
    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,226,160,0.1)";
    e.currentTarget.style.outline = "none";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#333333";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl text-left"
        style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: "#FFE2A0" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h2
              className="text-lg font-semibold tracking-wide"
              style={{ color: "#FFE2A0"}}
            >
              {editEvent ? "Edit Event" : "Post New Event"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
              {editEvent ? "Update your event details" : "Fill in the details to publish your event listing"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: "#2e2e2e", color: "#888888" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#3a3a3a";
              e.currentTarget.style.color = "#FFE2A0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2e2e2e";
              e.currentTarget.style.color = "#888888";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ backgroundColor: "#2e2e2e" }} />

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Business Selection */}
          <div>
            <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
              For Business
            </label>
            <div className="relative">
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 outline-none appearance-none cursor-pointer"
                style={inputBase}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="">Select a business</option>
                {userListings?.map(l => (
                  <option key={l.id} value={l.id.toString()}>{l.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#a0a0a0]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
              Event Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="e.g. Sisig Festival Promo Night"
              className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
              style={inputBase}
            />
          </div>

          {/* Date + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                style={{ ...inputBase, colorScheme: "dark", color: form.date ? "#e0e0e0" : "#555555" }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-normal text-md tracking-wide" style={{ color: "#FFE2A0" }}>
                  Location
                </label>
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setUseBusinessLocation(!useBusinessLocation)}>
                  <span className="text-[10px] uppercase font-bold tracking-tighter" style={{ color: useBusinessLocation ? "#FFE2A0" : "#555555" }}>Business Loc</span>
                  <div 
                    className={`w-7 h-4 rounded-full relative transition-all duration-200 ${useBusinessLocation ? "bg-[#FFE2A0]" : "bg-[#333333]"}`}
                    style={{ border: "1px solid #444444" }}
                  >
                    <div 
                      className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all duration-200 ${useBusinessLocation ? "left-3.5 bg-[#1a1a1a]" : "left-0.5 bg-[#666666]"}`}
                    />
                  </div>
                </div>
              </div>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={useBusinessLocation}
                placeholder={useBusinessLocation ? "Using business location..." : "e.g. Angeles City"}
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                style={{ ...inputBase, opacity: useBusinessLocation ? 0.6 : 1 }}
              />
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
                Start Time
              </label>
              <input
                type="time"
                name="timeFrom"
                value={form.timeFrom}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                style={{ ...inputBase, colorScheme: "dark", color: form.timeFrom ? "#e0e0e0" : "#555555" }}
              />
            </div>
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
                End Time
              </label>
              <input
                type="time"
                name="timeTo"
                value={form.timeTo}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                style={{ ...inputBase, colorScheme: "dark", color: form.timeTo ? "#e0e0e0" : "#555555" }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              rows={3}
              placeholder="Describe your event..."
              className="w-full rounded-lg px-4 py-2.5 text-sm resize-none transition-all duration-200"
              style={inputBase}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #2e2e2e" }}>
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: "#2a2a2a", color: "#888888", border: "1px solid #333333" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#e0e0e0";
              e.currentTarget.style.borderColor = "#555555";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#888888";
              e.currentTarget.style.borderColor = "#333333";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: "#FFE2A0", color: "#1a1a1a" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5d47a";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,226,160,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFE2A0";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {editEvent ? "Save Changes" : "Post Event"}
          </button>
        </div>
      </div>
    </div>
  );
}