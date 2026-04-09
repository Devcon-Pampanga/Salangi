import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle, XCircle, LogOut, MapPin, Clock,
  ChevronLeft, ChevronRight, X, ZoomIn, CalendarDays,
} from 'lucide-react';
import { ROUTES } from '../../../routes/paths';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Listing {
  id: number;
  name: string;
  category: string;
  location: string;
  description: string;
  hours: string;
  verified: boolean;
  images: string[];
  business_permit: string | null;
  government_id: string | null;
  selfie_verification: string | null;
  phone?: string;
  email?: string;
  facebook?: string;
  website?: string;
}

interface PendingEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  time: string;
  date_range: string;
  month: string;
  day: string;
  image_url: string | null;
  verified: boolean;
  created_at: string;
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-6" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white hover:text-[#FFE2A0] transition-colors">
        <X size={28} />
      </button>
      <img src={src} alt="preview" className="max-w-full max-h-full object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

// ── Image Carousel ────────────────────────────────────────────────────────────

function ImageCarousel({ images, onImageClick }: { images: string[]; onImageClick: (src: string) => void }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-48 h-32 rounded-xl bg-[#2D2D2D] flex items-center justify-center text-[#FBFAF8]/20 text-xs shrink-0 border border-zinc-800">
        No photos
      </div>
    );
  }

  return (
    <div className="relative w-48 h-32 rounded-xl overflow-hidden shrink-0 group border border-zinc-800">
      <img
        src={images[current]}
        alt="listing"
        className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
        onClick={() => onImageClick(images[current])}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
        <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setCurrent(p => (p - 1 + images.length) % images.length); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setCurrent(p => (p + 1) % images.length); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors">
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-[#FFE2A0] w-4' : 'bg-white/40 w-1.5'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Document Thumbnail ────────────────────────────────────────────────────────

function DocThumb({ src, label, onImageClick }: { src: string; label: string; onImageClick: (src: string) => void }) {
  const isPdf = src.toLowerCase().includes('.pdf');
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-24 h-20 rounded-xl overflow-hidden border border-zinc-700 cursor-zoom-in relative group hover:border-[#FFE2A0]/40 transition-colors"
        onClick={() => isPdf ? window.open(src, '_blank') : onImageClick(src)}
      >
        {isPdf ? (
          <div className="w-full h-full bg-[#2D2D2D] flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">📄</span>
            <span className="text-xs text-[#FBFAF8]/40">PDF</span>
          </div>
        ) : (
          <>
            <img src={src} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <ZoomIn size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        )}
      </div>
      <p className="text-xs text-[#FBFAF8]/40">{label}</p>
    </div>
  );
}

// ── Pending Event Card ────────────────────────────────────────────────────────

function PendingEventCard({
  event,
  onApprove,
  onReject,
  actionLoading,
  onImageClick,
}: {
  event: PendingEvent;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  actionLoading: number | null;
  onImageClick: (src: string) => void;
}) {
  return (
    <div className="bg-[#333333] border border-zinc-800/50 rounded-xl p-6 flex items-start gap-6 hover:border-[#FFE2A0]/20 transition-colors">
      {event.image_url ? (
        <div className="relative w-40 h-28 rounded-xl overflow-hidden shrink-0 group cursor-zoom-in border border-zinc-800" onClick={() => onImageClick(event.image_url!)}>
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ) : (
        <div className="w-40 h-28 rounded-xl bg-[#2D2D2D] border border-zinc-800 flex items-center justify-center text-[#FBFAF8]/20 shrink-0">
          <CalendarDays size={28} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-base font-semibold text-[#FBFAF8] font-['Playfair_Display'] truncate">{event.title}</h3>
          <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0 font-medium">
            Pending Review
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1.5 text-[#FBFAF8]/50 text-xs mb-1">
            <MapPin size={12} /> {event.location}
          </div>
        )}
        {event.time && (
          <div className="flex items-center gap-1.5 text-[#FBFAF8]/50 text-xs mb-1">
            <Clock size={12} /> {event.time}
          </div>
        )}
        {event.date_range && (
          <div className="flex items-center gap-1.5 text-[#FBFAF8]/50 text-xs mb-2">
            <CalendarDays size={12} /> {event.date_range}
          </div>
        )}
        {event.description && (
          <p className="text-[#FBFAF8]/40 text-sm line-clamp-2 leading-relaxed">{event.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 min-w-[130px]">
        <button
          onClick={() => onApprove(event.id)}
          disabled={actionLoading === event.id}
          className="flex items-center justify-center gap-2 bg-green-600/80 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 border border-green-500/30"
        >
          <CheckCircle size={14} /> Approve
        </button>
        <button
          onClick={() => onReject(event.id)}
          disabled={actionLoading === event.id}
          className="flex items-center justify-center gap-2 bg-red-700/80 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 border border-red-600/30"
        >
          <XCircle size={14} /> Reject
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'listings' | 'events'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (!auth) { navigate(ROUTES.ADMIN); return; }
    fetchAll();
  }, [navigate]);

  const fetchAll = async () => {
    setLoading(true);
    const [listingsRes, eventsRes] = await Promise.all([
      supabase.from('listings').select('*').eq('verified', false).order('created_at', { ascending: false }),
      supabase.from('events').select('*').eq('verified', false).order('created_at', { ascending: false }),
    ]);
    if (!listingsRes.error && listingsRes.data) setListings(listingsRes.data);
    if (!eventsRes.error && eventsRes.data) setEvents(eventsRes.data);
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApproveListing = async (id: number) => {
    setActionLoading(id);
    const { error } = await supabase.from('listings').update({ verified: true }).eq('id', id);
    if (error) showToast('Failed to approve listing.', 'error');
    else { showToast('Listing approved!', 'success'); setListings(prev => prev.filter(l => l.id !== id)); }
    setActionLoading(null);
  };

  const handleRejectListing = async (id: number) => {
    setActionLoading(id);
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) showToast('Failed to reject listing.', 'error');
    else { showToast('Listing rejected and removed.', 'success'); setListings(prev => prev.filter(l => l.id !== id)); }
    setActionLoading(null);
  };

  const handleApproveEvent = async (id: number) => {
    setActionLoading(id);
    const { error } = await supabase.from('events').update({ verified: true }).eq('id', id);
    if (error) showToast('Failed to approve event.', 'error');
    else { showToast('Event approved and published!', 'success'); setEvents(prev => prev.filter(e => e.id !== id)); }
    setActionLoading(null);
  };

  const handleRejectEvent = async (id: number) => {
    setActionLoading(id);
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) showToast('Failed to reject event.', 'error');
    else { showToast('Event rejected and removed.', 'success'); setEvents(prev => prev.filter(e => e.id !== id)); }
    setActionLoading(null);
  };

  const handleLogout = () => { sessionStorage.removeItem('admin_auth'); navigate(ROUTES.ADMIN); };

  const activeCount = activeTab === 'listings' ? listings.length : events.length;

  return (
    <div className="min-h-screen bg-[#2a2a2a] text-[#FBFAF8]">
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

      {/* Header */}
      <div className="bg-[#333333] border-b border-zinc-800/50 px-6 md:px-10 py-5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#FFE2A0] tracking-wide">
            Salangi Admin
          </h1>
          <p className="text-[#FBFAF8]/40 text-xs mt-0.5">Listing & Event Approval Dashboard</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[#FBFAF8]/50 hover:text-[#FFE2A0] transition-colors text-sm font-medium group"
        >
          <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
          Logout
        </button>
      </div>

      <div className="px-6 md:px-10 py-8">

        {/* Summary stat pills */}
        <div className="flex gap-3 mb-8">
          <div className="flex items-center gap-2 bg-[#333333] border border-zinc-800/50 rounded-xl px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[#FBFAF8]/60 text-xs">Pending Listings</span>
            <span className="text-[#FFE2A0] text-sm font-bold ml-1">{listings.length}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#333333] border border-zinc-800/50 rounded-xl px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[#FBFAF8]/60 text-xs">Pending Events</span>
            <span className="text-[#FFE2A0] text-sm font-bold ml-1">{events.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl p-2 w-fit mb-8">
          {(['listings', 'events'] as const).map((tab) => {
            const count = tab === 'listings' ? listings.length : events.length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                  isActive
                    ? 'bg-[#FFE2A0] text-[#1a1a1a] shadow-md scale-[1.02]'
                    : 'text-[#FBFAF8]/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
                {count > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-[#1a1a1a]/20 text-[#1a1a1a]' : 'bg-[#FFE2A0]/20 text-[#FFE2A0]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-['Playfair_Display'] text-white text-xl font-semibold">
              {activeTab === 'listings' ? 'Pending' : 'Pending'}{' '}
              <span className="text-[#FFE2A0]">{activeTab === 'listings' ? 'Listings' : 'Events'}</span>
            </h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              {activeCount} pending
            </span>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 text-xs text-[#FBFAF8]/40 hover:text-[#FFE2A0] transition-colors font-medium"
          >
            <span className="text-base leading-none">↻</span> Refresh
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-[#FBFAF8]/40">
            <svg className="animate-spin h-6 w-6 text-[#FFE2A0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading...
          </div>
        ) : activeTab === 'listings' ? (
          listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="bg-[#474133] p-5 rounded-full border border-[#5a5241] shadow-inner">
                <CheckCircle size={36} className="text-[#FFE2A0] opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="text-white text-lg font-semibold font-['Playfair_Display'] tracking-wide">All listings are verified!</h3>
                <p className="text-[#FBFAF8]/40 text-sm">No pending listing approvals.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              {listings.map(listing => (
                <div key={listing.id} className="bg-[#333333] border border-zinc-800/50 rounded-xl p-6 flex flex-col gap-5 hover:border-[#FFE2A0]/20 transition-colors">
                  <div className="flex items-start gap-6">
                    <ImageCarousel images={listing.images} onImageClick={setLightbox} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#FBFAF8] font-['Playfair_Display'] truncate">{listing.name}</h3>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#FFE2A0] border border-[#FFE2A0]/20 bg-[#FFE2A0]/5 px-2 py-0.5 rounded shrink-0">
                          {listing.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#FBFAF8]/50 text-xs mb-1">
                        <MapPin size={12} /> {listing.location}
                      </div>
                      {listing.hours && (
                        <div className="flex items-center gap-1.5 text-[#FBFAF8]/50 text-xs mb-2">
                          <Clock size={12} /> {listing.hours}
                        </div>
                      )}
                      {listing.phone && <p className="text-[#FBFAF8]/30 text-xs mb-1">📞 {listing.phone}</p>}
                      {listing.facebook && <p className="text-[#FBFAF8]/30 text-xs mb-1">🌐 {listing.facebook}</p>}
                      <p className="text-[#FBFAF8]/50 text-sm line-clamp-2 mt-2 leading-relaxed">{listing.description}</p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[130px]">
                      <button
                        onClick={() => handleApproveListing(listing.id)}
                        disabled={actionLoading === listing.id}
                        className="flex items-center justify-center gap-2 bg-green-600/80 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 border border-green-500/30 shadow-lg"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectListing(listing.id)}
                        disabled={actionLoading === listing.id}
                        className="flex items-center justify-center gap-2 bg-red-700/80 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 border border-red-600/30 shadow-lg"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>

                  {(listing.business_permit || listing.government_id || listing.selfie_verification) && (
                    <div className="border-t border-zinc-800 pt-5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#FBFAF8]/30 mb-3">
                        Verification Documents
                      </p>
                      <div className="flex gap-4">
                        {listing.business_permit && <DocThumb src={listing.business_permit} label="Business Permit" onImageClick={setLightbox} />}
                        {listing.government_id && <DocThumb src={listing.government_id} label="Government ID" onImageClick={setLightbox} />}
                        {listing.selfie_verification && <DocThumb src={listing.selfie_verification} label="Selfie" onImageClick={setLightbox} />}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="bg-[#474133] p-5 rounded-full border border-[#5a5241] shadow-inner">
                <CalendarDays size={36} className="text-[#FFE2A0] opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="text-white text-lg font-semibold font-['Playfair_Display'] tracking-wide">No pending events!</h3>
                <p className="text-[#FBFAF8]/40 text-sm">All submitted events have been reviewed.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map(event => (
                <PendingEventCard
                  key={event.id}
                  event={event}
                  onApprove={handleApproveEvent}
                  onReject={handleRejectEvent}
                  actionLoading={actionLoading}
                  onImageClick={setLightbox}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold shadow-2xl border transition-all ${
          toast.type === 'success'
            ? 'bg-[#333333] border-green-500/30 text-green-400'
            : 'bg-[#333333] border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;