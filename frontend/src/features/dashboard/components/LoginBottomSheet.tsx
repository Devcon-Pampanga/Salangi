// src/features/dashboard/components/LoginBottomSheet.tsx

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, UserPlus } from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import type { AuthGuardSheetProps } from '@/hooks/useAuthGuard';

export default function LoginBottomSheet({ isOpen, copy, onClose }: AuthGuardSheetProps) {
  const navigate   = useNavigate();
  const sheetRef   = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        style={{ animation: 'lbs-fadeIn 180ms ease forwards' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-sheet-title"
        className="fixed bottom-0 left-0 right-0 z-[9999] mx-auto max-w-lg"
        style={{ animation: 'lbs-slideUp 240ms cubic-bezier(0.32, 0.72, 0, 1) forwards' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#FBFAF8]/20" />
        </div>

        <div
          className="relative rounded-t-3xl px-6 pb-10 pt-5 flex flex-col gap-6"
          style={{ backgroundColor: '#242424', boxShadow: '0 -8px 40px rgba(0,0,0,0.6)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Dismiss"
            className="absolute top-5 right-5 p-1.5 rounded-full text-[#FBFAF8]/40 hover:text-[#FBFAF8] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Copy */}
          <div className="pr-8">
            <h2
              id="login-sheet-title"
              className="font-['Playfair_Display'] text-2xl text-[#FFE2A0] leading-snug mb-2"
            >
              {copy.title}
            </h2>
            <p className="text-[#FBFAF8]/60 text-sm leading-relaxed">{copy.body}</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { onClose(); navigate(ROUTES.SIGN_IN); }}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-[#FFE2A0] text-[#1A1A1A] font-bold text-sm tracking-wide active:scale-[0.98] transition-transform cursor-pointer hover:bg-[#f5d880]"
            >
              <LogIn size={16} />
              Sign in
            </button>

            <button
              onClick={() => { onClose(); navigate('/sign-up'); }}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-[#373737] text-[#FBFAF8] font-semibold text-sm active:scale-[0.98] transition-transform cursor-pointer hover:bg-[#444]"
            >
              <UserPlus size={16} />
              Create a free account
            </button>

            <button
              onClick={onClose}
              className="text-[#FBFAF8]/40 text-sm text-center py-1 hover:text-[#FBFAF8]/70 transition-colors cursor-pointer"
            >
              Continue browsing as guest
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lbs-fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lbs-slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>,
    document.body,
  );
}