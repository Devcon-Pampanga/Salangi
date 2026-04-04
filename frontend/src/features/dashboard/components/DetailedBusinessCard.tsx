import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import locBtnSelected from '@assets/icons/map-btn-active.svg';
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
  onReviewAdded?: () => void;
}

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
  onReviewAdded,
}: DetailedBusinessCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
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
    }  finally {
    setSubmitting(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <div className="w-full h-auto bg-[#373737] rounded-xl overflow-hidden shrink-0 mb-10 pb-6 shadow-2xl">
      <div className="relative flex flex-col">
        {/* Heart Icon */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="flex items-center justify-center w-10 h-10 bg-[#222222]/80 backdrop-blur-sm rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <img src={isSaved ? heartActive : heartInactive} width="20" alt="heart" />
          </button>
        </div>

        {/* Image Carousel */}
        <div className="relative group w-full h-72 overflow-hidden bg-zinc-800">
          <img
            src={images[currentIndex]}
            className="w-full h-full object-cover transition-opacity duration-300"
            alt={`${title} - ${currentIndex + 1}`}
          />
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <ChevronRight size={20} />
              </button>
            </>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {images.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-white w-3' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <img src={locBtnSelected} width="13" alt="loc" />
            <p className="text-[#FBFAF8]/50 text-sm">{location}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <img src={timeIcon} width="13" alt="time" />
            <p className="text-[#FBFAF8]/50 text-sm">{hours}</p>
          </div>
          <div className="flex items-center gap-2 my-2">
            {isVerified && <img src={verifiedIcon} width="15" alt="verified" />}
            <p className="text-[#FBFAF8] font-bold text-lg">{title}</p>
          </div>
          <p className="text-base leading-relaxed text-zinc-300 mt-3 border-b border-zinc-600/50 pb-6">
            {description}
          </p>

          {/* Contact */}
          <div className="flex flex-col gap-1 py-4 border-b border-zinc-600/50">
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