import { useState, useEffect } from 'react';
import starIcon from '@assets/icons/star-icon.svg';
import { supabase } from '@/lib/supabase';

const COOLDOWN_DAYS = 3;

function getTimeRemaining(lastDate: string): string {
  const last = new Date(lastDate).getTime();
  const remaining = last + COOLDOWN_DAYS * 24 * 60 * 60 * 1000 - Date.now();
  if (remaining <= 0) return '';
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
  submitting?: boolean;
}

function ReviewForm({ onSubmit, onCancel, submitting = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkCooldown = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecking(false); return; }

      const cutoff = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('reviews')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const remaining = getTimeRemaining(data.created_at);
        if (remaining) setCooldownRemaining(remaining);
      }
      setChecking(false);
    };
    checkCooldown();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { alert('Please select a star rating.'); return; }
    if (!comment.trim()) { alert('Please enter a comment.'); return; }
    onSubmit(rating, comment);
  };

  if (checking) {
    return (
      <div className="mt-8 p-6 bg-[#2D2D2D] rounded-xl border border-zinc-700 shadow-xl animate-in fade-in duration-300">
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-zinc-600 border-t-[#FFE2A0] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (cooldownRemaining) {
    return (
      <div className="mt-8 p-6 bg-[#2D2D2D] rounded-xl border border-zinc-700 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFE2A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#FBFAF8]">You've already left a review</p>
          <p className="text-xs text-zinc-400">
            You can submit another review in{' '}
            <span className="text-[#FFE2A0] font-medium">{cooldownRemaining}</span>
          </p>
          <button
            onClick={onCancel}
            className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-[#2D2D2D] rounded-xl border border-zinc-700 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
      <h3 className="text-md font-bold mb-4 text-[#FBFAF8]">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-400">Rate your experience</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-125 focus:outline-none">
                <img src={starIcon} width="24" alt={`${star} star`}
                  className={`transition-opacity duration-200 ${(hoverRating || rating) >= star ? 'opacity-100' : 'opacity-20'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review here..."
            className="w-full h-32 p-4 bg-[#1A1A1A] text-[#FBFAF8] rounded-lg border border-zinc-700 focus:border-[#FFE2A0] outline-none resize-none transition-colors text-sm" />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={submitting}
            className="px-5 py-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={rating === 0 || submitting}
            className="bg-[#FFE2A0] font-bold text-[#373737] px-6 py-2 rounded-lg text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;