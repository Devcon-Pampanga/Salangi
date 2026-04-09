import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import locBtnSelected from '@assets/icons/map-btn-active.svg';
import locBtn from '@assets/icons/map-btn-default.svg';
import verifiedIcon from '@assets/icons/verified-btn.svg';
import heartInactive from '@assets/icons/save-btn-inactive.svg';
import heartActive from '@assets/icons/save-btn-active.svg';
import timeIcon from '@assets/icons/time-btn.svg';
import callIcon from '@assets/icons/phone-icon.svg';
import emailIcon from '@assets/icons/emain-icon.svg';
import facebookIcon from '@assets/icons/fb-icon.svg';
import websiteIcon from '@assets/icons/web-icon.svg';
import starIcon from '@assets/icons/star-icon.svg';
import commentIcon from '@assets/icons/review-btn-default.svg';

import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';

interface Review {
  id: number;
  user: string;
  initials: string;
  date: string;
  rating: number;
  comment: string;
  profilePic?: string;
}

interface DetailedBusinessCardProps {
  listingId: number;
  title: string;
  location: string;
  hours: string;
  description: string;
  images: string[];
  phone?: string;
  email?: string;
  facebook?: string;
  website?: string;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  reviewsLoading?: boolean;
  isVerified?: boolean;
  initialSaved?: boolean;
  lat?: number;
  lng?: number;
  onToggleSave?: (id: number) => void;
  onReviewAdded?: () => void;
}

// ── Hours formatter ───────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatHours(hours: string): string {
  if (!hours) return '';

  // Extract time part (e.g. "11:11 AM – 2:22 PM") from the end of the string
  const timeMatch = hours.match(/,?\s*(\d{1,2}:\d{2}\s*(?:AM|PM)\s*[–—-]\s*\d{1,2}:\d{2}\s*(?:AM|PM))\s*$/i);
  const timePart = timeMatch ? timeMatch[1].trim() : '';
  const daysPart = timeMatch ? hours.slice(0, timeMatch.index) : hours;

  // Find which days from our ordered list are present in the string
  const activeDays = DAYS.filter(d => daysPart.includes(d));

  if (activeDays.length === 0) return hours;

  // Collapse consecutive days into ranges e.g. Mon–Wed
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

  const dayString = ranges.join(', ');
  return timePart ? `${dayString}, ${timePart}` : dayString;
}

// ─────────────────────────────────────────────────────────────────────────────

function DetailedBusinessCard({
  listingId,
  title,
  location,
  hours,
  description,
  images,
  phone,
  email,
  facebook,
  website,
  rating,
  reviewsCount,
  reviews,
  reviewsLoading = false,
  isVerified = false,
  initialSaved = false,
  lat,
  lng,
  onToggleSave,
  onReviewAdded,
}: DetailedBusinessCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('listing_interactions').insert({
      listing_id: listingId,
      type: 'view',
    });
  }, [listingId]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(listingId);
      setIsSaved(prev => !prev);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (isSaved) {
        await supabase.from('saves').delete().eq('user_id', user.id).eq('listing_id', listingId);
      } else {
        await supabase.from('saves').insert({ user_id: user.id, listing_id: listingId });
      }
      setIsSaved(prev => !prev);
    }
  };

  const handleGetDirections = async () => {
    await supabase.from('listing_interactions').insert({
      listing_id: listingId,
      type: 'directions',
    });
    const query = lat && lng
      ? `${lat},${lng}`
      : encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleAddReview = async (rating: number, comment: string) => {
    setSubmitting(true);
    setReviewError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setReviewError('You must be logged in to leave a review.');
        setSubmitting(false);
        return;
      }
      const { error } = await supabase.from('reviews').insert({
        listing_id: listingId,
        user_id: user.id,
        rating,
        comment,
      });
      if (error) throw error;
      setIsAddingReview(false);
      onReviewAdded?.();
    } catch (err: any) {
      setReviewError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <div className="w-full max-w-120 bg-[#333333] rounded-xl overflow-hidden shrink-0 mb-10 shadow-2xl border border-zinc-800/50 mx-auto">
      <div className="relative flex flex-col">
        {/* Heart Icon */}
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={handleToggleSave}
            className="flex items-center justify-center w-10 h-10 bg-[#222222]/80 backdrop-blur-sm rounded-full z-20 cursor-pointer hover:scale-110 active:scale-95 shadow-lg border border-white/10"
          >
            <img src={isSaved ? heartActive : heartInactive} width="20" alt="heart" />
          </button>
        </div>

        {/* Image Carousel */}
        <div className="relative w-full h-72 overflow-hidden bg-zinc-800 group">
          <img
            src={images[currentIndex]}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            alt={`${title} - ${currentIndex + 1}`}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 backdrop-blur-sm rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 backdrop-blur-sm rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
              >
                <ChevronRight size={16} className="text-white" />
              </button>
            </>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'bg-[#FFE2A0] w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-[#222222]/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-20">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[#FBFAF8] font-['Playfair_Display'] font-bold text-2xl tracking-tight leading-tight">
                {title}
              </h3>
              {isVerified && (
                <img src={verifiedIcon} width="16" height="16" alt="verified" className="mt-1" />
              )}
            </div>
          </div>

          <p className="text-sm text-[#FBFAF8]/70 leading-relaxed mb-2 pb-6">
            {description}
          </p>

          {/* Info Row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 pb-6 border-b border-zinc-600/50">
            <div className="flex items-center gap-2">
              <img src={locBtnSelected} width="14" alt="location" className="opacity-70" />
              <span className="text-[#FBFAF8]/50 text-xs font-medium">{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={timeIcon} width="14" alt="hours" className="opacity-70" />
              {/* ✅ formatHours applied here */}
              <span className="text-[#FBFAF8]/50 text-xs font-medium">{formatHours(hours)}</span>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-1 pb-6 border-b border-zinc-600/50">
            {phone && (
              <div onClick={() => handleCopy(phone, 'phone')}
                className="relative flex items-center gap-4 text-sm text-[#FBFAF8]/80 hover:text-[#FBFAF8] px-3 py-2.5 rounded-xl border border-transparent hover:border-[#FFE2A0] hover:bg-[#FFE2A0]/5 transition-all duration-300 cursor-pointer group">
                <img src={callIcon} width="16" className="opacity-70 group-hover:opacity-100" alt="call" />
                <span>{phone}</span>
                {copyFeedback === 'phone' && <span className="absolute right-4 text-[10px] text-[#FFE2A0] font-bold">Copied!</span>}
              </div>
            )}
            {email && (
              <div onClick={() => handleCopy(email, 'email')}
                className="relative flex items-center gap-4 text-sm text-[#FBFAF8]/80 hover:text-[#FBFAF8] px-3 py-2.5 rounded-xl border border-transparent hover:border-[#FFE2A0] hover:bg-[#FFE2A0]/5 transition-all duration-300 cursor-pointer group">
                <img src={emailIcon} width="16" className="opacity-70 group-hover:opacity-100" alt="email" />
                <span>{email}</span>
                {copyFeedback === 'email' && <span className="absolute right-4 text-[10px] text-[#FFE2A0] font-bold">Copied!</span>}
              </div>
            )}
            {facebook && (
              <div onClick={() => window.open(facebook.startsWith('http') ? facebook : `https://${facebook}`, '_blank')}
                className="relative flex items-center gap-4 text-sm text-[#FBFAF8]/80 hover:text-[#FBFAF8] px-3 py-2.5 rounded-xl border border-transparent hover:border-[#FFE2A0] hover:bg-[#FFE2A0]/5 transition-all duration-300 cursor-pointer group">
                <img src={facebookIcon} width="16" className="opacity-70 group-hover:opacity-100" alt="fb" />
                <span>{facebook}</span>
              </div>
            )}
            {website && (
              <div onClick={() => window.open(website.startsWith('http') ? website : `https://${website}`, '_blank')}
                className="relative flex items-center gap-4 text-sm text-[#FBFAF8]/80 hover:text-[#FBFAF8] px-3 py-2.5 rounded-xl border border-transparent hover:border-[#FFE2A0] hover:bg-[#FFE2A0]/5 transition-all duration-300 cursor-pointer group">
                <img src={websiteIcon} width="16" className="opacity-70 group-hover:opacity-100" alt="web" />
                <span>{website}</span>
              </div>
            )}
            <button
              onClick={handleGetDirections}
              className="mt-2 flex items-center gap-3 text-sm text-[#FBFAF8]/80 hover:text-[#FBFAF8] px-3 py-2.5 rounded-xl border border-transparent hover:border-[#FFE2A0] hover:bg-[#FFE2A0]/5 transition-all duration-300 cursor-pointer group w-full text-left"
            >
              <img src={locBtn} width="16" className="opacity-70 group-hover:opacity-100" alt="directions" />
              <span>Get Directions</span>
            </button>
          </div>

          {/* Ratings Summary */}
          <div className="py-6">
            <p className="text-xs text-zinc-400 mb-1">Customer Reviews ({reviewsCount})</p>
            <div className="flex flex-col">
              <span className="text-5xl font-serif text-[#FBFAF8]">
                {reviewsCount > 0 ? rating.toFixed(1) : '—'}
              </span>
              <div className="flex gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={starIcon} width="9" alt="star"
                    className={i < Math.floor(rating) ? 'opacity-100' : 'opacity-30'} />
                ))}
              </div>
            </div>
          </div>

          {/* Review List */}
          {reviewsLoading ? (
            <p className="text-sm text-zinc-500 animate-pulse">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-zinc-500">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-12 mt-4">
              {reviews.map((review) => (
                <ReviewItem key={review.id} {...review} />
              ))}
            </div>
          )}

          {/* Review Form / Button */}
          <div className="mt-8">
            {reviewError && <p className="text-red-400 text-sm mb-3">{reviewError}</p>}
            {isAddingReview ? (
              <ReviewForm
                onSubmit={handleAddReview}
                onCancel={() => { setIsAddingReview(false); setReviewError(null); }}
                submitting={submitting}
              />
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsAddingReview(true)}
                  className="flex items-center gap-2 bg-[#FFE2A0] text-[#373737] px-4 py-2 rounded-lg text-xs hover:brightness-110 transition-all active:scale-95 shadow-lg cursor-pointer"
                >
                  <span><img src={commentIcon} alt="comment" /></span> Leave a review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailedBusinessCard;