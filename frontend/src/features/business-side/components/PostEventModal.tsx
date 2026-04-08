import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
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
    dateFrom: "",
    dateTo: "",
    timeFrom: "",
    timeTo: "",
    location: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editEvent) {
      setForm({
        title: editEvent.title,
        dateFrom: "",
        dateTo: "",
        timeFrom: editEvent.time?.split(" - ")[0] || "",
        timeTo: editEvent.time?.split(" - ")[1] || "",
        location: editEvent.location?.split(", ")[0] || editEvent.location,
        description: editEvent.description,
      });
      setImagePreview(editEvent.image_url || null);
      setImageFile(null);
    } else {
      setForm({ title: "", dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", location: "", description: "" });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [editEvent, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!form.title || (!editEvent && !form.dateFrom)) return;

    setSubmitting(true);

    try {
      let uploadedImageUrl = editEvent?.image_url || "";

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("events-image")
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) {
          console.error("Image upload error:", uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("events-image")
            .getPublicUrl(uploadData.path);

          uploadedImageUrl = publicUrlData.publicUrl;
        }
      }

      const effectiveDateFrom = form.dateFrom || (editEvent ? "2026-05-02" : "");
      const dateObj = new Date(effectiveDateFrom);
      const month = dateObj.toLocaleString("en-US", { month: "short" });
      const day = dateObj.getDate().toString();

      const timeDisplay = `${form.timeFrom || ""}${form.timeFrom && form.timeTo ? " - " : ""}${form.timeTo || ""}`;
      const dateRange =
        form.dateTo && form.dateTo !== form.dateFrom
          ? `${effectiveDateFrom} to ${form.dateTo}`
          : effectiveDateFrom;

      onAddEvent({
        id: editEvent?.id,
        month: effectiveDateFrom ? month : "",
        day: effectiveDateFrom ? day : "",
        title: form.title,
        location: form.location,
        time: timeDisplay,
        dateRange,
        description: form.description,
        image_url: uploadedImageUrl,
      });

      handleClose();
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
    if (!editEvent) {
      setForm({ title: "", dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", location: "", description: "" });
      setImageFile(null);
      setImagePreview(null);
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
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl text-left max-h-[90vh] flex flex-col"
        style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: "#FFE2A0" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold tracking-wide" style={{ color: "#FFE2A0" }}>
              {editEvent ? "Edit Event" : "Post New Event"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
              {editEvent
                ? "Update your event details"
                : "Fill in the details to publish your event listing"}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
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
        <div className="mx-6 h-px flex-shrink-0" style={{ backgroundColor: "#2e2e2e" }} />

        {/* Scrollable Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {/* Event Image Upload */}
          <div>
            <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
              Event Image
            </label>
            {imagePreview ? (
              <div className="relative w-full rounded-lg overflow-hidden" style={{ height: "160px" }}>
                <img src={imagePreview} alt="Event preview" className="w-full h-full object-cover" />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#e0e0e0", border: "1px solid #555" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FFE2A0"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#e0e0e0"; }}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-lg flex flex-col items-center justify-center gap-2 py-6 transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: "#2a2a2a", border: "1px dashed #444444", color: "#888888" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FFE2A0";
                  e.currentTarget.style.color = "#FFE2A0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#444444";
                  e.currentTarget.style.color = "#888888";
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-sm">Click to upload event image</span>
                <span className="text-xs" style={{ color: "#555" }}>PNG, JPG, WEBP up to 5MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
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

          {/* Date From / Date To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
                Date From
              </label>
              <input
                type="date"
                name="dateFrom"
                value={form.dateFrom}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                style={{ ...inputBase, colorScheme: "dark", color: form.dateFrom ? "#e0e0e0" : "#555555" }}
              />
            </div>
            <div>
              <label className="block font-normal mb-1.5 text-md tracking-wide" style={{ color: "#FFE2A0" }}>
                Date To
              </label>
              <input
                type="date"
                name="dateTo"
                value={form.dateTo}
                min={form.dateFrom || undefined}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                style={{ ...inputBase, colorScheme: "dark", color: form.dateTo ? "#e0e0e0" : "#555555" }}
              />
            </div>
          </div>

          {/* Location */}
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
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid #2e2e2e" }}
        >
          <button
            onClick={handleClose}
            disabled={submitting}
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
            disabled={submitting}
            className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "#FFE2A0", color: "#1a1a1a" }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = "#f5d47a";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,226,160,0.25)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFE2A0";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {submitting
              ? editEvent ? "Saving..." : "Posting..."
              : editEvent ? "Save Changes" : "Post Event"}
          </button>
        </div>
      </div>
    </div>
  );
}