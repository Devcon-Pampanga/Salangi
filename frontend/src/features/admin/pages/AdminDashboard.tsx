import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, LogOut, MapPin, Clock, ChevronLeft, ChevronRight, X, ZoomIn, CalendarDays } from 'lucide-react';
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
      <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"><X size={28} /></button>
      <img src={src} alt="preview" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

// ── Image Carousel ────────────────────────────────────────────────────────────

function ImageCarousel({ images, onImageClick }: { images: string[]; onImageClick: (src: string) => void }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-48 h-32 rounded-lg bg-[#2E2E2E] flex items-center justify-center text-gray-500 text-xs shrink-0">
        No photos
      </div>
    );
  }

  return (
    <div className="relative w-48 h-32 rounded-lg overflow-hidden shrink-0 group">
      <img src={images[current]} alt="listing" className="w-full h-full object-cover cursor-zoom-in" onClick={() => onImageClick(images[current])} />
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
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === current ? 'bg-white' : 'bg-white/40'}`} />)}
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
    <div className="flex flex-col items-center gap-1">
      <div className="w-24 h-20 rounded-lg overflow-hidden border border-gray-700 cursor-zoom-in relative group"
        onClick={() => isPdf ? window.open(src, '_blank') : onImageClick(src)}>
        {isPdf ? (
          <div className="w-full h-full bg-[#2E2E2E] flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">📄</span>
            <span className="text-xs text-gray-400">PDF</span>
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
      <p className="text-xs text-gray-500">{label}</p>
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
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 flex items-start gap-6">
      {/* Event image */}
      {event.image_url ? (
        <div className="relative w-40 h-28 rounded-lg overflow-hidden shrink-0 group cursor-zoom-in" onClick={() => onImageClick(event.image_url!)}>
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ) : (
        <div className="w-40 h-28 rounded-lg bg-[#2E2E2E] flex items-center justify-center text-gray-600 shrink-0">
          <CalendarDays size={28} />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-base font-semibold text-white truncate">{event.title}</h3>
          <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
            Pending
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1 text-gray-400 text-sm mb-1">
            <MapPin size={13} /> {event.location}
          </div>
        )}
        {event.time && (
          <div className="flex items-center gap-1 text-gray-400 text-sm mb-1">
            <Clock size={13} /> {event.time}
          </div>
        )}
        {event.date_range && (
          <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
            <CalendarDays size={13} /> {event.date_range}
          </div>
        )}
        {event.description && (
          <p className="text-gray-500 text-sm line-clamp-2">{event.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 min-w-[130px]">
        <button onClick={() => onApprove(event.id)} disabled={actionLoading === event.id}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <CheckCircle size={15} /> Approve
        </button>
        <button onClick={() => onReject(event.id)} disabled={actionLoading === event.id}
          className="flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <XCircle size={15} /> Reject
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

  // ── Listing actions ───────────────────────────────────────────────────────

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

  // ── Event actions ─────────────────────────────────────────────────────────

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

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#FFE2A0]">Salangi Admin</h1>
          <p className="text-gray-400 text-sm">Listing & Event Approval Dashboard</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="px-8 pt-6">
        <div className="flex gap-1 bg-[#1a1a1a] border border-gray-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'listings' ? 'bg-[#FFE2A0] text-[#1a1a1a]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Listings
            {listings.length > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'listings' ? 'bg-[#1a1a1a]/20 text-[#1a1a1a]' : 'bg-[#FFE2A0]/20 text-[#FFE2A0]'}`}>
                {listings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'events' ? 'bg-[#FFE2A0] text-[#1a1a1a]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Events
            {events.length > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'events' ? 'bg-[#1a1a1a]/20 text-[#1a1a1a]' : 'bg-[#FFE2A0]/20 text-[#FFE2A0]'}`}>
                {events.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {activeTab === 'listings' ? 'Pending Listings' : 'Pending Events'}
            <span className="ml-3 bg-[#FFE2A0] text-[#222] text-sm font-bold px-2 py-0.5 rounded-full">
              {activeTab === 'listings' ? listings.length : events.length}
            </span>
          </h2>
          <button onClick={fetchAll} className="text-sm text-gray-400 hover:text-white transition-colors">↻ Refresh</button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">Loading...</div>
        ) : activeTab === 'listings' ? (
          listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <CheckCircle size={48} className="mb-4 text-green-500 opacity-50" />
              <p className="text-lg">All listings are verified!</p>
              <p className="text-sm mt-1">No pending listing approvals.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {listings.map(listing => (
                <div key={listing.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
                  <div className="flex items-start gap-6">
                    <ImageCarousel images={listing.images} onImageClick={setLightbox} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold">{listing.name}</h3>
                        <span className="text-xs bg-[#2E2E2E] text-gray-300 px-2 py-0.5 rounded-full">{listing.category}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-sm mb-2"><MapPin size={13} /> {listing.location}</div>
                      {listing.hours && <div className="flex items-center gap-1 text-gray-400 text-sm mb-2"><Clock size={13} /> {listing.hours}</div>}
                      {listing.phone && <p className="text-gray-500 text-xs mb-1">📞 {listing.phone}</p>}
                      {listing.facebook && <p className="text-gray-500 text-xs mb-1">🌐 {listing.facebook}</p>}
                      <p className="text-gray-400 text-sm line-clamp-2 mt-1">{listing.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[130px]">
                      <button onClick={() => handleApproveListing(listing.id)} disabled={actionLoading === listing.id}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        <CheckCircle size={15} /> Approve
                      </button>
                      <button onClick={() => handleRejectListing(listing.id)} disabled={actionLoading === listing.id}
                        className="flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  </div>
                  {(listing.business_permit || listing.government_id || listing.selfie_verification) && (
                    <div className="border-t border-gray-800 pt-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Verification Documents</p>
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
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <CalendarDays size={48} className="mb-4 text-green-500 opacity-50" />
              <p className="text-lg">No pending events!</p>
              <p className="text-sm mt-1">All submitted events have been reviewed.</p>
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

      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;