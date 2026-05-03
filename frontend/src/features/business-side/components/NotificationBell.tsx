import { useState, useEffect, useRef } from 'react';
import { HiOutlineBell } from 'react-icons/hi';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';

interface Notification {
  id: string;
  type: 'saved_listing' | 'event_attendance';
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── Load notifications ─────────────────────────────────────────────────────
  const fetchNotifications = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('notifications')
      .select('id, type, message, is_read, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `owner_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // ── Mark all read when panel opens ────────────────────────────────────────
  const handleOpen = async () => {
    setIsOpen(prev => !prev);
    if (!isOpen && unreadCount > 0 && user?.id) {
      // Optimistic
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('owner_id', user.id)
        .eq('is_read', false);
    }
  };

  const formatTime = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };


  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#a0a0a0] hover:text-[#FFE2A0] hover:bg-[#222222] transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <HiOutlineBell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFE2A0] text-[#1A1A1A] text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute left-full top-0 ml-2 w-72 bg-[#2D2D2D] border border-[#444444] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="px-4 py-3 border-b border-[#444444] flex items-center justify-between">
            <span className="text-white text-sm font-semibold">Notifications</span>
            {notifications.length > 0 && (
              <span className="text-[#707070] text-xs">{notifications.length} total</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <HiOutlineBell className="size-8 text-[#444444]" />
                <p className="text-[#707070] text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#3a3a3a] last:border-0 transition-colors ${
                    !n.is_read ? 'bg-[#FFE2A0]/5' : ''
                  }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-white text-xs font-medium leading-snug">{n.message}</p>
                    <p className="text-[#707070] text-[10px]">{formatTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFE2A0] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;