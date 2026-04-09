import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Heart, X, MapPin, Clock, Calendar } from 'lucide-react';
import type { Event } from '../../Data/Events';
import { supabase } from '@/lib/supabase';

import locBtnSelected from '@assets/icons/map-btn-active.svg';
import timeIcon from '@assets/icons/time-btn.svg';

interface EventCardProps {
  event: Event & { interest_count?: number };
  isBusinessSide?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (id: number) => void;
}

function EventCard({ event, isBusinessSide, onEdit, onDelete }: EventCardProps) {
  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(event.interest_count ?? 0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isBusinessSide) return;

    const checkInterest = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('event_interests')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsInterested(!!data);
    };

    const fetchCount = async () => {
      const { count } = await supabase
        .from('event_interests')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id);
      setInterestCount(count ?? 0);
    };

    checkInterest();
    fetchCount();
  }, [event.id, isBusinessSide]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const handleInterested = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      if (isInterested) {
        const { error } = await supabase
          .from('event_interests')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);
        if (!error) { setIsInterested(false); setInterestCount(prev => Math.max(0, prev - 1)); }
        else console.error('Delete interest error:', error);
      } else {
        const { error } = await supabase
          .from('event_interests')
          .insert({ event_id: event.id, user_id: user.id });
        if (!error) { setIsInterested(true); setInterestCount(prev => prev + 1); }
        else console.error('Insert interest error:', error);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const modal = showModal ? createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <div
        className="relative w-full max-w-lg bg-[#2a2a2a] rounded-2xl overflow-hidden border border-zinc-700/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Image */}
        <div className="relative h-64 w-full">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a2a2a] via-transparent to-transparent" />

          {/* Close */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/10 transition-all hover:scale-110 active:scale-95"
          >
            <X size={16} className="text-white" />
          </button>

          {/* Date badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-[#FFE2A0]/90 backdrop-blur-md rounded-full shadow-lg">
            <span className="text-[#222222] text-[10px] font-black tracking-wider uppercase">{event.date}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-[#FBFAF8] font-['Playfair_Display'] font-bold text-2xl leading-tight mb-1">
            {event.title}
          </h2>
          <span className="text-[#FFE2A0] text-[10px] font-bold uppercase tracking-widest opacity-80">
            {event.organizer}
          </span>

          <div className="my-4 border-t border-white/10" />

          <p className="text-sm text-[#FBFAF8]/70 leading-relaxed mb-5">{event.description}</p>

          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3a3a3a] flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-[#FFE2A0]" />
              </div>
              <div>
                <p className="text-[#FBFAF8]/40 text-[10px] uppercase tracking-wider font-semibold">Location</p>
                <p className="text-[#FBFAF8] text-sm font-medium">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3a3a3a] flex items-center justify-center shrink-0">
                <Clock size={14} className="text-[#FFE2A0]" />
              </div>
              <div>
                <p className="text-[#FBFAF8]/40 text-[10px] uppercase tracking-wider font-semibold">Time</p>
                <p className="text-[#FBFAF8] text-sm font-medium">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3a3a3a] flex items-center justify-center shrink-0">
                <Calendar size={14} className="text-[#FFE2A0]" />
              </div>
              <div>
                <p className="text-[#FBFAF8]/40 text-[10px] uppercase tracking-wider font-semibold">Date</p>
                <p className="text-[#FBFAF8] text-sm font-medium">{event.date}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          {!isBusinessSide ? (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-[#FBFAF8]/40">
                <Heart size={13} className={isInterested ? 'fill-[#FFE2A0] text-[#FFE2A0]' : ''} />
                <span className="text-xs">{interestCount} interested</span>
              </div>
              <button
                onClick={(e) => handleInterested(e)}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg disabled:opacity-60 ${
                  isInterested
                    ? 'bg-[#FFE2A0] text-[#222222] hover:bg-[#f5d880]'
                    : 'bg-[#454545] text-[#FBFAF8] hover:bg-[#525252] border border-white/5'
                }`}
              >
                <Heart size={14} className={isInterested ? 'fill-[#222222] text-[#222222]' : 'text-[#FFE2A0]'} />
                <span>{isInterested ? 'Interested!' : 'Interested'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowModal(false); onEdit?.(event); }}
              className="w-full py-3.5 bg-[#454545] text-white text-xs font-bold rounded-xl hover:bg-[#525252] transition-all active:scale-95 cursor-pointer shadow-lg border border-white/5"
            >
              Edit Event
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* ── Card ── */}
      <div
        className="w-full max-w-md bg-[#333333] rounded-xl overflow-hidden border border-zinc-800/50 hover:bg-[#3d3d3d] transition-all duration-200 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {/* Image */}
        <div className="relative group h-72">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Date Tag */}
          <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-[#FFE2A0]/90 backdrop-blur-md rounded-full z-20 shadow-lg">
            <span className="text-[#222222] text-[9px] font-black tracking-wider uppercase">{event.date}</span>
          </div>

          {isBusinessSide && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(event.id); }}
              className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-red-600/90 hover:bg-red-700 backdrop-blur-md rounded-full z-30 cursor-pointer shadow-xl border border-white/10 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <Trash2 size={18} className="text-white" />
            </button>
          )}

          {isBusinessSide && (
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              <Heart size={12} className="text-[#FFE2A0] fill-[#FFE2A0]" />
              <span className="text-[#FFE2A0] text-xs font-bold">{interestCount}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col mb-4">
            <h3 className="text-[#FBFAF8] font-['Playfair_Display'] font-bold text-2xl tracking-tight leading-tight">
              {event.title}
            </h3>
            <span className="text-[#FFE2A0] text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">
              {event.organizer}
            </span>
          </div>

          <p className="text-sm text-[#FBFAF8]/70 leading-relaxed line-clamp-2 mb-6 h-10">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
            <div className="flex items-center gap-2">
              <img src={locBtnSelected} width="14" alt="location" className="opacity-70" />
              <span className="text-[#FBFAF8]/50 text-xs font-medium">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={timeIcon} width="14" alt="hours" className="opacity-70" />
              <span className="text-[#FBFAF8]/50 text-xs font-medium">{event.time}</span>
            </div>
          </div>

          <div className="flex gap-3">
            {isBusinessSide ? (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(event); }}
                className="w-full py-3.5 bg-[#454545] text-white text-xs font-bold rounded-xl hover:bg-[#525252] transition-all active:scale-95 cursor-pointer shadow-lg border border-white/5"
              >
                Edit Event
              </button>
            ) : (
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#FBFAF8]/40">
                  <Heart size={13} className={isInterested ? 'fill-[#FFE2A0] text-[#FFE2A0]' : ''} />
                  <span className="text-xs">{interestCount} interested</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleInterested(e); }}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg disabled:opacity-60 ${
                    isInterested
                      ? 'bg-[#FFE2A0] text-[#222222] hover:bg-[#f5d880]'
                      : 'bg-[#454545] text-[#FBFAF8] hover:bg-[#525252] border border-white/5'
                  }`}
                >
                  <Heart size={14} className={isInterested ? 'fill-[#222222] text-[#222222]' : 'text-[#FFE2A0]'} />
                  <span>{isInterested ? 'Interested!' : 'Interested'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portal modal */}
      {modal}
    </>
  );
}

export default EventCard;