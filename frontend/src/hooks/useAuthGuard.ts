// src/hooks/useAuthGuard.ts

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/authContext';

export type GuardReason = 'save' | 'review' | 'profile' | 'saved-list' | 'generic';

export interface AuthGuardSheetProps {
  isOpen: boolean;
  reason: GuardReason;
  onClose: () => void;
  copy: { title: string; body: string };
}

const REASON_COPY: Record<GuardReason, { title: string; body: string }> = {
  save: {
    title: 'Save this spot',
    body: 'Create a free account to save businesses and build your local favourites list.',
  },
  review: {
    title: 'Leave a review',
    body: 'Sign in to share your experience and help others discover great local businesses.',
  },
  profile: {
    title: 'Your profile',
    body: 'Sign in to manage your account, saved spots, and review history.',
  },
  'saved-list': {
    title: 'Your saved spots',
    body: 'Sign in to see all the businesses you have bookmarked.',
  },
  generic: {
    title: 'Sign in to continue',
    body: 'Create a free account to unlock the full Salangi experience.',
  },
};

export function useAuthGuard() {
  const { session } = useAuth();
  const isGuest = !session;

  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<GuardReason>('generic');

  const guard = useCallback(
    (guardReason: GuardReason, action: () => void) => {
      if (!isGuest) {
        action();
        return;
      }
      setReason(guardReason);
      setIsOpen(true);
    },
    [isGuest],
  );

  const close = useCallback(() => setIsOpen(false), []);

  const sheetProps: AuthGuardSheetProps = {
    isOpen,
    reason,
    onClose: close,
    copy: REASON_COPY[reason],
  };

  return { isGuest, guard, sheetProps };
}

export { REASON_COPY };