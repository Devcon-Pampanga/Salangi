import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, LogOut, MapPin, Clock, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

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

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors">
        <X size={28} />
      </button>
      <img
        src={src}
        alt="preview"
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
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
      <img
        src={images[current]}
        alt="listing"
        className="w-full h-full object-cover cursor-zoom-in"
        onClick={() => onImageClick(images[current])}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
        <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent(p => (p - 1 + images.length) % images.length); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent(p => (p + 1) % images.length); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === current ? 'bg-white' : 'bg-white/40'}`} />
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
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-24 h-20 rounded-lg overflow-hidden border border-gray-700 cursor-zoom-in relative group"
        onClick={() => isPdf ? window.open(src, '_blank') : onImageClick(src)}
      >
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

// ── Main ──────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (!auth) { navigate('/admin'); return; }
    fetchUnverified();
  }, []);

  const fetchUnverified = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('verified', false)
      .order('created_at', { ascending: false });

    if (!error && data) setListings(data);
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    const { error } = await supabase.from('listings').update({ verified: true }).eq('id', id);
    if (error) { showToast('Failed to approve listing.', 'error'); }
    else { showToast('Listing approved!', 'success'); setListings(prev => prev.filter(l => l.id !== id)); }
    setActionLoading(null);
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) { showToast('Failed to reject listing.', 'error'); }
    else { showToast('Listing rejected and removed.', 'success'); setListings(prev => prev.filter(l => l.id !== id)); }
    setActionLoading(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#FFE2A0]">Salangi Admin</h1>
          <p className="text-gray-400 text-sm">Listing Approval Dashboard</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Pending Listings
            <span className="ml-3 bg-[#FFE2A0] text-[#222] text-sm font-bold px-2 py-0.5 rounded-full">
              {listings.length}
            </span>
          </h2>
          <button onClick={fetchUnverified} className="text-sm text-gray-400 hover:text-white transition-colors">
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <CheckCircle size={48} className="mb-4 text-green-500 opacity-50" />
            <p className="text-lg">All listings are verified!</p>
            <p className="text-sm mt-1">No pending approvals at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {listings.map(listing => (
              <div key={listing.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 flex flex-col gap-4">

                {/* Top row: image + info + actions */}
                <div className="flex items-start gap-6">
                  <ImageCarousel images={listing.images} onImageClick={setLightbox} />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{listing.name}</h3>
                      <span className="text-xs bg-[#2E2E2E] text-gray-300 px-2 py-0.5 rounded-full">{listing.category}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                      <MapPin size={13} /> {listing.location}
                    </div>
                    {listing.hours && (
                      <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                        <Clock size={13} /> {listing.hours}
                      </div>
                    )}
                    {listing.phone && <p className="text-gray-500 text-xs mb-1">📞 {listing.phone}</p>}
                    {listing.facebook && <p className="text-gray-500 text-xs mb-1">🌐 {listing.facebook}</p>}
                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">{listing.description}</p>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[130px]">
                    <button
                      onClick={() => handleApprove(listing.id)}
                      disabled={actionLoading === listing.id}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      <CheckCircle size={15} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(listing.id)}
                      disabled={actionLoading === listing.id}
                      className="flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>

                {/* Documents row */}
                {(listing.business_permit || listing.government_id || listing.selfie_verification) && (
                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Verification Documents</p>
                    <div className="flex gap-4">
                      {listing.business_permit && (
                        <DocThumb src={listing.business_permit} label="Business Permit" onImageClick={setLightbox} />
                      )}
                      {listing.government_id && (
                        <DocThumb src={listing.government_id} label="Government ID" onImageClick={setLightbox} />
                      )}
                      {listing.selfie_verification && (
                        <DocThumb src={listing.selfie_verification} label="Selfie" onImageClick={setLightbox} />
                      )}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;