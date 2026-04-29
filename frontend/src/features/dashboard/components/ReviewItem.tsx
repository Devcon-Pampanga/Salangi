import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import starIcon from '@assets/icons/star-icon.svg';
import { supabase } from '@/lib/supabase';

interface ReviewItemProps {
  user: string;
  initials: string;
  date: string;
  rating: number;
  comment: string;
  reviewId: number;
  helpfulCount: number;
  ownerReply?: string | null;
  isOwner?: boolean;
  profilePic?: string;
  images?: string[];
  onVote?: () => void;
  onReplyAdded?: () => void;
}

function ReviewItem({ user, initials, date, rating, comment, reviewId, helpfulCount, ownerReply, isOwner = false, profilePic, images = [], onVote, onReplyAdded }: ReviewItemProps) {
  const [voted, setVoted] = useState(false);
  const [count, setCount] = useState(helpfulCount ?? 0);
  const [loading, setLoading] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState(ownerReply ?? '');
  const [currentReply, setCurrentReply] = useState(ownerReply ?? '');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrentReply(ownerReply ?? '');
    setReplyText(ownerReply ?? '');
  }, [ownerReply]);

  useEffect(() => {
    const checkVote = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase
        .from('review_helpful_votes')
        .select('id')
        .match({ review_id: reviewId, user_id: authUser.id })
        .maybeSingle();
      setVoted(!!data);
    };
    checkVote();
  }, [reviewId]);

  // Close lightbox on Escape key
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null && i < images.length - 1 ? i + 1 : i);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, images.length]);

  const handleVote = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser || loading) return;
    setLoading(true);
    if (voted) {
      const { error } = await supabase
        .from('review_helpful_votes')
        .delete()
        .match({ review_id: reviewId, user_id: authUser.id });
      if (!error) { setCount(c => Math.max(0, c - 1)); setVoted(false); onVote?.(); }
    } else {
      const { error } = await supabase
        .from('review_helpful_votes')
        .insert({ review_id: reviewId, user_id: authUser.id });
      if (!error) { setCount(c => c + 1); setVoted(true); onVote?.(); }
    }
    setLoading(false);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    const { error, data } = await supabase
      .from('reviews')
      .update({
        owner_reply: replyText.trim(),
        owner_replied_at: new Date().toISOString(),
      })
      .eq('id', Number(reviewId))
      .select();

    console.log('Reply result:', data, error);

    if (!error) {
      setCurrentReply(replyText.trim());
      setShowReplyBox(false);
      onReplyAdded?.();
    } else {
      console.error('Reply failed:', error);
    }
    setSubmittingReply(false);
  };

  const handleDeleteReply = async () => {
    const { error } = await supabase
      .from('reviews')
      .update({ owner_reply: null, owner_replied_at: null })
      .eq('id', Number(reviewId));
    if (!error) {
      setCurrentReply('');
      setReplyText('');
      onReplyAdded?.();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2E2E2E] flex items-center justify-center text-[10px] font-bold overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt={user} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#FBFAF8]">{user}</span>
              <span className="text-xs text-zinc-400">{date}</span>
            </div>
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <img key={i} src={starIcon} width="9" alt="review star"
                className={i < rating ? 'opacity-100' : 'opacity-30'} />
            ))}
          </div>
        </div>

        {/* Comment */}
        <p className="text-sm text-[#FBFAF8]/70 leading-relaxed pr-4">{comment}</p>

        {/* Image grid */}
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-1">
            {images.map((url, idx) => (
              <button
                key={url}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-700 hover:border-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFE2A0]/50 cursor-pointer"
              >
                <img
                  src={url}
                  alt={`Review image ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        )}

        {/* Helpful vote */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-zinc-500">Helpful?</span>
          <button
            onClick={handleVote}
            disabled={loading}
            className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all cursor-pointer disabled:opacity-50
              ${voted
                ? 'border-[#FFE2A0]/50 text-[#FFE2A0] bg-[#FFE2A0]/10'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 14H11.5C12.05 14 12.52 13.66 12.7 13.14L14.7 7.14C14.73 7.07 14.75 6.98 14.75 6.9C14.75 6.48 14.41 6.15 14 6.15H9.25L10 2.4C10.03 2.28 10.01 2.15 9.96 2.05C9.81 1.81 9.58 1.62 9.33 1.52L9 1.38L5.88 4.5C5.67 4.71 5.5 5.01 5.5 5.33V13.25C5.5 13.66 5.39 14 5 14Z"/>
              <path d="M3.5 6.15H1.75C1.34 6.15 1 6.48 1 6.9V13.25C1 13.66 1.34 14 1.75 14H3.5V6.15Z" opacity="0.5"/>
            </svg>
            <span>{count}</span>
          </button>

          {isOwner && !currentReply && (
            <button
              onClick={() => setShowReplyBox(v => !v)}
              className="ml-auto text-xs px-3 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all cursor-pointer"
            >
              {showReplyBox ? 'Cancel' : 'Reply'}
            </button>
          )}
        </div>

        {/* Owner reply box */}
        {showReplyBox && isOwner && (
          <div className="ml-4 mt-1 flex flex-col gap-2">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write your response as the business owner..."
              className="w-full h-24 p-3 bg-[#1A1A1A] text-[#FBFAF8] rounded-lg border border-zinc-700 focus:border-[#FFE2A0] outline-none resize-none text-sm transition-colors"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReplyBox(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer px-3 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={submittingReply || !replyText.trim()}
                className="text-xs bg-[#FFE2A0] text-[#373737] font-bold px-4 py-1.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submittingReply ? 'Posting...' : 'Post reply'}
              </button>
            </div>
          </div>
        )}

        {/* Existing owner reply display */}
        {currentReply && (
          <div className="ml-4 mt-1 p-3 bg-[#1A1A1A] rounded-lg border-l-2 border-[#FFE2A0]/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#FFE2A0]">Owner response</span>
              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setReplyText(currentReply); setShowReplyBox(true); }}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteReply}
                    className="text-[10px] text-red-500/70 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-[#FBFAF8]/70 leading-relaxed">{currentReply}</p>
          </div>
        )}
      </div>

      {/* Lightbox — rendered in a portal so it escapes sidebar overflow:hidden */}
      {lightboxIndex !== null && images.length > 0 && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Prev arrow */}
          {lightboxIndex > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i ?? 0) - 1); }}
              className="absolute left-4 text-white/70 hover:text-white transition-colors cursor-pointer z-10 p-2"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}

          {/* Image */}
          <img
            src={images[lightboxIndex]}
            alt={`Image ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Next arrow */}
          {lightboxIndex < images.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i ?? 0) + 1); }}
              className="absolute right-4 text-white/70 hover:text-white transition-colors cursor-pointer z-10 p-2"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}

          {/* Dots indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-4 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === lightboxIndex ? 'bg-[#FFE2A0] scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

export default ReviewItem;