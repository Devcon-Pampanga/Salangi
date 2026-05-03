import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getSurpriseListing } from '../../Data/Listings';
import type { Listing } from '../../Data/Listings';
import { ROUTES } from '../../../routes/paths';

import locBtnSelected from '@assets/icons/map-btn-active.svg';
import verifiedIcon from '@assets/icons/verified-btn.svg';
import timeIcon from '@assets/icons/time-btn.svg';
import saveInactive from '@assets/icons/save-btn-inactive.svg';
import saveActive from '@assets/icons/save-btn-active.svg';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatHours(hours: string): string {
  if (!hours) return '';
  const timeMatch = hours.match(/,?\s*(\d{1,2}:\d{2}\s*(?:AM|PM)\s*[–—-]\s*\d{1,2}:\d{2}\s*(?:AM|PM))\s*$/i);
  const timePart = timeMatch ? timeMatch[1].trim() : '';
  const daysPart = timeMatch ? hours.slice(0, timeMatch.index) : hours;
  const activeDays = DAYS.filter(d => daysPart.includes(d));
  // If no named days found (e.g. "Daily"), just return the original string as-is
  if (activeDays.length === 0) return hours;
  const ranges: string[] = [];
  let rangeStart = activeDays[0];
  let rangePrev = activeDays[0];
  for (let i = 1; i <= activeDays.length; i++) {
    const curr = activeDays[i];
    const prevIdx = DAYS.indexOf(rangePrev);
    const currIdx = curr ? DAYS.indexOf(curr) : -1;
    if (curr && currIdx === prevIdx + 1) {
      rangePrev = curr;
    } else {
      ranges.push(rangeStart === rangePrev ? rangeStart : `${rangeStart} – ${rangePrev}`);
      rangeStart = curr!;
      rangePrev = curr!;
    }
  }
  return timePart ? `${ranges.join(', ')}, ${timePart}` : ranges.join(', ');
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface SurpriseMeProps {
  userId: string | null;
  savedIds: number[];
  onClose: () => void;
  onToggleSave: (id: number) => void;
}

// ── Loading state ─────────────────────────────────────────────────────────────

function LoadingReveal() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 px-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#FFE2A0]/10" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFE2A0] animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-[#FFE2A0] font-semibold text-lg tracking-wide">
          Finding your hidden gem...
        </p>
        <p className="text-[#FBFAF8]/40 text-sm">Somewhere in Pampanga</p>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-8 text-center">
      <p className="text-4xl">💎</p>
      <p className="text-[#FBFAF8] font-semibold text-lg">You've found them all!</p>
      <p className="text-[#FBFAF8]/50 text-sm leading-relaxed">
        You've already saved every listing. Check back as new businesses join Salangi.
      </p>
      <button
        onClick={onClose}
        className="mt-2 px-6 py-3 bg-[#FFE2A0] text-[#1A1A1A] rounded-xl font-bold text-sm active:scale-95 transition-all cursor-pointer"
      >
        Back to explore
      </button>
    </div>
  );
}

// ── Gem card ──────────────────────────────────────────────────────────────────

interface GemCardProps {
  listing: Listing;
  rating: number;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
  onTakeMeThere: () => void;
  onAnotherOne: () => void;
  isLoadingNext: boolean;
}

function GemCard({
  listing,
  rating,
  isSaved,
  onToggleSave,
  onTakeMeThere,
  onAnotherOne,
  isLoadingNext,
}: GemCardProps) {
  const [images, setImages] = useState<string[]>(listing.images ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
  setCurrentIndex(0);
  setImages(listing.images ?? []); // reset to new listing's images first

  const fetchGallery = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('url')
      .eq('listing_id', listing.id)
      .order('added_date', { ascending: false });
    const galleryUrls = data?.map((r: any) => r.url) ?? [];
    const merged = [...new Set([...(listing.images ?? []), ...galleryUrls].filter(Boolean))];
    setImages(merged);
  };
  fetchGallery();
}, [listing.id, listing.images]);

  const hasImages = images.length > 0;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(i => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(i => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="w-full">

      {/* Hidden gem badge */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#FFE2A0]/10 border border-[#FFE2A0]/30 rounded-full">
          <span className="text-sm">💎</span>
          <span className="text-[#FFE2A0] text-xs font-bold uppercase tracking-widest">
            Hidden Gem
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full bg-[#333333] rounded-xl overflow-hidden border border-zinc-800/50">

        {/* Image */}
        <div className="relative w-full h-64 bg-zinc-800 group">

          <button
            onClick={() => onToggleSave(listing.id)}
            className="absolute top-4 left-4 z-20 flex items-center justify-center w-10 h-10 bg-[#222222]/80 backdrop-blur-sm rounded-full cursor-pointer hover:scale-110 active:scale-95 shadow-lg border border-white/10"
          >
            <img src={isSaved ? saveActive : saveInactive} width="20" alt="save" />
          </button>

          {hasImages ? (
            <>
              <img
                src={images[currentIndex]}
                alt={listing.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 rounded-full border border-white/5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                  >
                    <ChevronLeft size={16} className="text-white" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 rounded-full border border-white/5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                  >
                    <ChevronRight size={16} className="text-white" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentIndex === idx ? 'bg-[#FFE2A0] w-4' : 'bg-white/40 w-1.5'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#FBFAF8]/20">
              <ImageIcon size={48} strokeWidth={1} />
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold">No Photos Yet</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-[#FBFAF8] font-['Playfair_Display'] font-bold text-2xl tracking-tight leading-tight">
              {listing.name}
            </h3>
            {listing.verified && (
              <img src={verifiedIcon} width="16" height="16" alt="verified" className="mt-1" />
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="px-2 py-1 rounded border border-[#FFE2A0]/20 bg-[#FFE2A0]/5">
              <span className="text-[#FFE2A0] text-[9px] font-bold uppercase tracking-widest leading-none">
                {listing.category}
              </span>
            </div>
            {rating > 0 && (
              <span className="text-[#FFE2A0] text-xs font-bold">★ {rating.toFixed(1)}</span>
            )}
          </div>

          <p className="text-sm text-[#FBFAF8]/70 leading-relaxed line-clamp-2 mb-4">
            {listing.description}
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
            <div className="flex items-center gap-2">
              <img src={locBtnSelected} width="13" alt="location" className="opacity-60" />
              <span className="text-[#FBFAF8]/50 text-xs">{listing.location}</span>
            </div>
            {listing.hours && (
              <div className="flex items-center gap-2">
                <img src={timeIcon} width="13" alt="hours" className="opacity-60" />
                <span className="text-[#FBFAF8]/50 text-xs">{formatHours(listing.hours)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onAnotherOne}
              disabled={isLoadingNext}
              className="flex-1 py-3.5 bg-[#454545] text-[#FBFAF8] text-xs font-bold rounded-xl hover:bg-[#525252] transition-all active:scale-95 cursor-pointer border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingNext ? 'Finding...' : 'Another one'}
            </button>
            <button
              onClick={onTakeMeThere}
              className="flex-1 py-3.5 bg-[#FFE2A0] text-[#1A1A1A] text-xs font-bold rounded-xl hover:bg-[#ffe8b5] transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              Take me there
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function SurpriseMe({ userId, savedIds, onClose, onToggleSave }: SurpriseMeProps) {
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [localSavedIds, setLocalSavedIds] = useState<number[]>(savedIds);

  useEffect(() => {
    setLocalSavedIds(savedIds);
  }, [savedIds]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    fetchGem(true);
  }, []);

  const fetchGem = async (initial = false) => {
    if (initial) setIsLoading(true);
    else setIsLoadingNext(true);

    try {
      const gem = await getSurpriseListing(userId);
      if (!gem) {
        setIsEmpty(true);
        return;
      }
      setListing(gem);
      setIsEmpty(false);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('listing_id', gem.id);

      if (reviewsData && reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsData.length;
        setRating(avg);
      } else {
        setRating(0);
      }
    } catch (err) {
      console.warn('SurpriseMe fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingNext(false);
    }
  };

  const handleToggleSave = (id: number) => {
    onToggleSave(id);
    setLocalSavedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleTakeMeThere = () => {
    if (!listing) return;
    supabase.from('listing_interactions').insert({
      listing_id: listing.id,
      type: 'directions',
    });
    onClose();
    navigate(ROUTES.LOCATION, { state: { listing } });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-md bg-[#1A1A1A] rounded-t-2xl md:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            width: '300px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,226,160,0.9) 0%, transparent 70%)',
          }}
        />

        <div className="relative flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-[#FFE2A0] font-['Playfair_Display'] text-xl font-bold">
              Surprise me
            </h2>
            <p className="text-[#FBFAF8]/40 text-xs mt-0.5">
              Discover a hidden gem in Pampanga
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center bg-[#2a2a2a] hover:bg-[#333333] rounded-full border border-white/10 transition-colors cursor-pointer"
          >
            <X size={16} className="text-[#FBFAF8]/60" />
          </button>
        </div>

        <div className="px-5 pb-8">
          {isLoading ? (
            <LoadingReveal />
          ) : isEmpty ? (
            <EmptyState onClose={onClose} />
          ) : listing ? (
            <GemCard
              listing={listing}
              rating={rating}
              isSaved={localSavedIds.includes(listing.id)}
              onToggleSave={handleToggleSave}
              onTakeMeThere={handleTakeMeThere}
              onAnotherOne={() => fetchGem(false)}
              isLoadingNext={isLoadingNext}
            />
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SurpriseMe;