import { useState } from 'react';
import starIcon from '@assets/icons/star-icon.svg';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
  submitting?: boolean;
}

function ReviewForm({ onSubmit, onCancel, submitting = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { alert('Please select a star rating.'); return; }
    if (!comment.trim()) { alert('Please enter a comment.'); return; }
    onSubmit(rating, comment);
  };

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