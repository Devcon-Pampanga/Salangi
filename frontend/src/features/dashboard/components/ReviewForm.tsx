import { useState, useEffect, useRef } from 'react';
import starIcon from '@assets/icons/star-icon.svg';
import { supabase } from '@/lib/supabase';

const COOLDOWN_DAYS = 3;
const MAX_IMAGES = 3;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const BUCKET = 'review-images';

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

interface PreviewFile {
  id: string;
  file: File;
  objectUrl: string;
}

interface ReviewFormProps {
  businessId: string | number;
  onSubmit: (rating: number, comment: string, images: string[]) => void;
  onCancel: () => void;
  submitting?: boolean;
}

function ReviewForm({ businessId, onSubmit, onCancel, submitting = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkCooldown = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecking(false); return; }

      const cutoff = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('reviews')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('listing_id', Number(businessId))  // ← FIXED: was 'business_id', now 'listing_id'
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) console.error('Cooldown check error:', error);

      if (data) {
        const remaining = getTimeRemaining(data.created_at);
        if (remaining) setCooldownRemaining(remaining);
      }
      setChecking(false);
    };
    checkCooldown();
  }, [businessId]);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.objectUrl));
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selected = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - previews.length;

    if (selected.length === 0) return;

    if (remaining <= 0) {
      setFileError(`You can only attach up to ${MAX_IMAGES} images.`);
      e.target.value = '';
      return;
    }

    const toAdd = selected.slice(0, remaining);
    const rejected: string[] = [];

    const valid: PreviewFile[] = [];
    for (const file of toAdd) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        rejected.push(`"${file.name}" is not a JPG or PNG.`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        rejected.push(`"${file.name}" exceeds ${MAX_SIZE_MB}MB.`);
        continue;
      }
      valid.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        objectUrl: URL.createObjectURL(file),
      });
    }

    if (rejected.length) setFileError(rejected.join(' '));
    if (valid.length) setPreviews(prev => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setPreviews(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.objectUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const uploadImages = async (userId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const preview of previews) {
      const path = `${userId}/${Date.now()}-${preview.file.name}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, preview.file, { upsert: false });
      if (error) throw new Error(`Upload failed for ${preview.file.name}: ${error.message}`);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { alert('Please select a star rating.'); return; }
    if (!comment.trim()) { alert('Please enter a comment.'); return; }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const imageUrls = previews.length > 0 ? await uploadImages(user.id) : [];
      onSubmit(rating, comment, imageUrls);
    } catch (err: any) {
      alert(err.message ?? 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const isSubmitting = submitting || uploading;

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

        {/* Star rating */}
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

        {/* Comment */}
        <div className="flex flex-col gap-2">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review here..."
            className="w-full h-32 p-4 bg-[#1A1A1A] text-[#FBFAF8] rounded-lg border border-zinc-700 focus:border-[#FFE2A0] outline-none resize-none transition-colors text-sm" />
        </div>

        {/* Image upload */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              Photos{' '}
              <span className="text-zinc-600 text-xs">({previews.length}/{MAX_IMAGES}, JPG/PNG, max {MAX_SIZE_MB}MB each)</span>
            </p>
            {previews.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-[#FFE2A0]/50 hover:text-[#FFE2A0] transition-all cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Add photo
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {fileError && (
            <p className="text-xs text-red-400">{fileError}</p>
          )}

          {previews.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {previews.map((preview) => (
                <div key={preview.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-zinc-700">
                  <img
                    src={preview.objectUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(preview.id)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={isSubmitting}
            className="px-5 py-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={rating === 0 || isSubmitting}
            className="bg-[#FFE2A0] font-bold text-[#373737] px-6 py-2 rounded-lg text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;