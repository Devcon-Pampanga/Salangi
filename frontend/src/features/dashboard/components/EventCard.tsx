import { useState, useEffect } from 'react';
import { Trash2, Heart } from 'lucide-react';
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

  const handleInterested = async () => {
    if (loading) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    if (isInterested) {
      await supabase
        .from('event_interests')
        .delete()
        .eq('event_id', event.id)
        .eq('user_id', user.id);
      setIsInterested(false);
      setInterestCount(prev => Math.max(0, prev - 1));
    } else {
      await supabase
        .from('event_interests')
        .insert({ event_id: event.id, user_id: user.id });
      setIsInterested(true);
      setInterestCount(prev => prev + 1);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-[#333333] rounded-xl overflow-hidden border border-zinc-800/50 hover:bg-[#3d3d3d] transition-all duration-200">
      {/* Image Section */}
      <div className="relative group h-72">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Date Tag */}
        <div className="absolute top-4 left-4 px-2.5 py-1 bg-[#FFE2A0]/90 backdrop-blur-md rounded-full z-20 flex items-center justify-center shadow-lg">
          <span className="text-[#222222] text-[9px] font-black tracking-wider uppercase">{event.date}</span>
        </div>

        {/* Delete Button - Business Side only */}
        {isBusinessSide && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(event.id); }}
            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-red-600/90 hover:bg-red-700 backdrop-blur-md rounded-full z-30 cursor-pointer shadow-xl border border-white/10 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Trash2 size={18} className="text-white" />
          </button>
        )}

        {/* Interest count pill — business side only, shown on image */}
        {isBusinessSide && (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <Heart size={12} className="text-[#FFE2A0] fill-[#FFE2A0]" />
            <span className="text-[#FFE2A0] text-xs font-bold">{interestCount}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Name Row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex flex-col">
            <h3 className="text-[#FBFAF8] font-['Playfair_Display'] font-bold text-2xl tracking-tight leading-tight">
              {event.title}
            </h3>
            <span className="text-[#FFE2A0] text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">
              {event.organizer}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#FBFAF8]/70 leading-relaxed line-clamp-2 mb-6 h-10">
          {event.description}
        </p>

        {/* Info Row */}
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isBusinessSide ? (
            <div className="flex gap-3 w-full">
              <button
                onClick={() => onEdit?.(event)}
                className="flex-1 py-3.5 bg-[#454545] text-white text-xs font-bold rounded-xl hover:bg-[#525252] transition-all active:scale-95 cursor-pointer shadow-lg border border-white/5"
              >
                Edit Event
              </button>
              <button
                className="flex-1 py-3.5 bg-[#FFE2A0] text-[#222222] text-xs font-bold rounded-xl hover:bg-[#ffe8b5] transition-all active:scale-95 cursor-pointer shadow-lg"
              >
                View Analytics
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              {/* Interest count - user side */}
              <div className="flex items-center gap-1.5 text-[#FBFAF8]/40">
                <Heart size={13} className={isInterested ? 'fill-[#FFE2A0] text-[#FFE2A0]' : ''} />
                <span className="text-xs">{interestCount} interested</span>
              </div>

              <button
                onClick={handleInterested}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg disabled:opacity-60 ${
                  isInterested
                    ? 'bg-[#FFE2A0] text-[#222222] hover:bg-[#f5d880]'
                    : 'bg-[#454545] text-[#FBFAF8] hover:bg-[#525252] border border-white/5'
                }`}
              >
                <Heart
                  size={14}
                  className={isInterested ? 'fill-[#222222] text-[#222222]' : 'text-[#FFE2A0]'}
                />
                <span>{isInterested ? 'Interested!' : 'Interested'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCard;