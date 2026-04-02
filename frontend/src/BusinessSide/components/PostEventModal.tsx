import { useState } from "react";

interface EventPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostEventModal({ isOpen, onClose }: EventPostModalProps) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    timeFrom: "",
    timeTo: "",
    location: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Event submitted:", form);
    onClose();
  };

  const handleClose = () => {
    setForm({ title: "", date: "", timeFrom: "", timeTo: "", location: "", description: "" });
    onClose();
  };

  if (!isOpen) return null;

  const inputBase: React.CSSProperties = {
    backgroundColor: "#2a2a2a",
    border: "1px solid #333333",
    color: "#e0e0e0",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "#FFE2A0";
    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,226,160,0.1)";
    e.currentTarget.style.outline = "none";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
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
              Post New Event
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
              Fill in the details to publish your event listing
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
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="e.g. Angeles City"
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                style={inputBase}
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
            Post Event
          </button>
        </div>
      </div>
    </div>
  );
}