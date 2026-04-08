import { useState, useEffect } from "react";
import type { Listing } from "../../Data/Listings";
import { X } from "lucide-react";

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (listing: Partial<Listing>) => void;
  listing: Listing | null;
}

export default function EditListingModal({ isOpen, onClose, onSave, listing }: EditListingModalProps) {
  const [form, setForm] = useState({
    name: "",
    category: "Resto",
    location: "",
    hours: "",
    description: "",
    phone: "",
    email: "",
    facebook: "",
    website: "",
  });

  useEffect(() => {
    if (listing) {
      setForm({
        name: listing.name,
        category: listing.category,
        location: listing.location,
        hours: listing.hours,
        description: listing.description,
        phone: listing.phone || "",
        email: listing.email || "",
        facebook: listing.facebook || "",
        website: listing.website || "",
      });
    }
  }, [listing, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ← removed onClose() here; MyBusiness.handleSaveListing closes the modal
    //   after the Supabase update succeeds, preventing a race condition
    onSave({
      ...listing,
      ...form,
    } as Listing);
  };

  if (!isOpen) return null;

  const inputBaseLine = "w-full bg-[#2a2a2a] border border-[#333333] text-[#e0e0e0] rounded-lg px-4 py-2.5 text-sm focus:border-[#FFE2A0] focus:ring-1 focus:ring-[#FFE2A0]/20 outline-none transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-2xl bg-[#222222] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col max-h-[90vh]">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-[#FFE2A0]" />

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-['Playfair_Display'] font-bold text-[#FFE2A0]">Edit Listing</h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Update your professional profile</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide">
          <form id="edit-listing-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Business Name</label>
                <input name="name" value={form.name} onChange={handleChange} className={inputBaseLine} placeholder="The Grand Bistro" required />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputBaseLine}>
                  <option value="Resto">Restaurant</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Activities">Activities</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className={inputBaseLine} placeholder="Angeles City, Pampanga" required />
              </div>

              {/* Hours */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Business Hours</label>
                <input name="hours" value={form.hours} onChange={handleChange} className={inputBaseLine} placeholder="10:00 AM - 10:00 PM" required />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputBaseLine} placeholder="+63 900 000 0000" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${inputBaseLine} resize-none`} placeholder="Tell people about your business..." required />
            </div>

            {/* Social Links Section */}
            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-bold text-[#FBFAF8] mb-4">Online Presence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Address</label>
                  <input name="email" value={form.email} onChange={handleChange} className={inputBaseLine} placeholder="contact@business.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Facebook Page</label>
                  <input name="facebook" value={form.facebook} onChange={handleChange} className={inputBaseLine} placeholder="facebook.com/business" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Website URL</label>
                  <input name="website" value={form.website} onChange={handleChange} className={inputBaseLine} placeholder="www.business.com" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-zinc-800 flex justify-end gap-3 bg-[#1e1e1e]/50">
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl hover:bg-zinc-700 transition-all active:scale-95">
            Cancel
          </button>
          <button form="edit-listing-form" type="submit" className="px-8 py-2.5 bg-[#FFE2A0] text-[#222222] text-xs font-bold rounded-xl hover:bg-[#ffe8b5] transition-all hover:shadow-lg hover:shadow-[#FFE2A0]/10 active:scale-95">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}