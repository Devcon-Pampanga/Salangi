import { useState, useEffect } from 'react';
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
  profilePic?: string;
  onVote?: () => void;
}

function ReviewItem({ user, initials, date, rating, comment, reviewId, helpfulCount, profilePic, onVote }: ReviewItemProps) {
  const [voted, setVoted] = useState(false);
  const [count, setCount] = useState(helpfulCount ?? 0);
  const [loading, setLoading] = useState(false);

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

  const handleVote = async () => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser || loading) return;
  setLoading(true);

  if (voted) {
    const { error } = await supabase
      .from('review_helpful_votes')
      .delete()
      .match({ review_id: reviewId, user_id: authUser.id });
    if (!error) {
      setCount(c => Math.max(0, c - 1));
      setVoted(false);
      onVote?.(); // re-fetch reviews
    }
  } else {
    const { error } = await supabase
      .from('review_helpful_votes')
      .insert({ review_id: reviewId, user_id: authUser.id });
    if (!error) {
      setCount(c => c + 1);
      setVoted(true);
      onVote?.(); // re-fetch reviews
    }
  }
  setLoading(false);
};

  return (
    <div className="flex flex-col gap-3">
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
            <img
              key={i}
              src={starIcon}
              width="9"
              alt="review star"
              className={i < rating ? 'opacity-100' : 'opacity-30'}
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-[#FBFAF8]/70 leading-relaxed pr-4">{comment}</p>

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
      </div>
    </div>
  );
}

export default ReviewItem;