import { useState, useEffect } from "react";
import type { Listing } from "../../Data/Listings";
import { X } from "lucide-react";
import phoneIcon from '@assets/icons/phone-icon.svg';
import emailIcon from '@assets/icons/emain-icon.svg';
import fbIcon from '@assets/icons/fb-icon.svg';
import webIcon from '@assets/icons/web-icon.svg';

const OPERATING_DAYS = ['Daily', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const parseTimeOutput = (timeStr: string) => {
  if (!timeStr) return '';
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '';
  let [_, h, m, ampm] = match;
  let hour = parseInt(h);
  if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
  if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${m}`;
};

const formatTimeInput = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

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
    operatingDays: [] as string[],
    openingTime: "",
    closingTime: "",
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
        operatingDays: [],
        openingTime: "",
        closingTime: "",
      });

      // Parse existing hours string
      if (listing.hours) {
        const parts = listing.hours.split(', ');
        const timePart = parts.pop() || '';
        const days = parts;
        const [start, end] = timePart.split(' – ');
        
        setForm(prev => ({
          ...prev,
          operatingDays: days,
          openingTime: parseTimeOutput(start),
          closingTime: parseTimeOutput(end),
        }));
      }
    }
  }, [listing, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format hours string from parts
    const formattedHours = `${form.operatingDays.join(', ')}, ${formatTimeInput(form.openingTime)} – ${formatTimeInput(form.closingTime)}`;
    
    onSave({
      ...listing,
      ...form,
      hours: formattedHours,
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
                  <option value="Food & Drinks">Food & Drinks</option>
                  <option value="Shops">Shops</option>
                  <option value="Activities">Activities</option>
                  <option value="Services">Services</option>
                  <option value="Stay">Stay</option>
                  <option value="Community & Essentials">Community & Essentials</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className={inputBaseLine} placeholder="Angeles City, Pampanga" required />
              </div>

              {/* Operating Days */}
              <div className="space-y-3 md:col-span-2">
                <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Operating Days</label>
                <div className="flex flex-wrap gap-2">
                  {OPERATING_DAYS.map((day) => {
                    const isActive = day === 'Daily' 
                      ? form.operatingDays.includes('Daily')
                      : form.operatingDays.includes(day) && !form.operatingDays.includes('Daily');
                    
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (day === 'Daily') {
                            setForm(prev => ({ ...prev, operatingDays: prev.operatingDays.includes('Daily') ? [] : ['Daily'] }));
                          } else {
                            const without = form.operatingDays.filter(d => d !== 'Daily');
                            const toggled = without.includes(day)
                              ? without.filter(d => d !== day)
                              : [...without, day];
                            setForm(prev => ({ ...prev, operatingDays: toggled }));
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                          isActive 
                            ? 'bg-[#FFE2A0] text-[#1A1A1A] border-[#FFE2A0]' 
                            : 'bg-[#2D2D2D] text-[#FBFAF8]/70 border-transparent hover:border-[#FFE2A0]/40'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Opening & Closing Times */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Opening Time</label>
                <input 
                  type="time" 
                  name="openingTime" 
                  value={form.openingTime} 
                  onChange={handleChange} 
                  className={inputBaseLine} 
                  required 
                />
              </div>
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Closing Time</label>
                <input 
                  type="time" 
                  name="closingTime" 
                  value={form.closingTime} 
                  onChange={handleChange} 
                  className={inputBaseLine} 
                  required 
                />
              </div>              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#FFE2A0] uppercase tracking-wider">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${inputBaseLine} resize-none`} placeholder="Tell people about your business..." required />
              </div>
            </div>

            {/* Contact & Social Section */}
            <div className="pt-6 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-[#FFE2A0] mb-6 uppercase tracking-wider">Contact & Social (optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Phone */}
                <div className="flex items-center gap-3 group">
                  <div className="w-8 flex justify-center shrink-0">
                    <img src={phoneIcon} alt="phone" className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 flex items-center bg-[#2a2a2a] rounded-lg border border-[#333333] focus-within:border-[#FFE2A0] transition-all overflow-hidden h-[42px]">
                    <span className="px-3 text-sm font-bold text-zinc-500 border-r border-zinc-800 py-3 select-none tracking-widest">+63</span>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone.replace('+63', '')}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setForm(prev => ({ ...prev, phone: digits }));
                      }}
                      placeholder="912 345 6789"
                      className="flex-1 bg-transparent text-[#e0e0e0] text-sm px-3 outline-none placeholder-zinc-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 group">
                  <div className="w-8 flex justify-center shrink-0">
                    <img src={emailIcon} alt="email" className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    <input name="email" value={form.email} onChange={handleChange} className={inputBaseLine} placeholder="contact@business.com" />
                  </div>
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-3 group">
                  <div className="w-8 flex justify-center shrink-0">
                    <img src={fbIcon} alt="facebook" className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    <input name="facebook" value={form.facebook} onChange={handleChange} className={inputBaseLine} placeholder="facebook.com/yourbusiness" />
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center gap-3 group">
                  <div className="w-8 flex justify-center shrink-0">
                    <img src={webIcon} alt="website" className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    <input name="website" value={form.website} onChange={handleChange} className={inputBaseLine} placeholder="www.yourbusiness.com" />
                  </div>
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