import { Trash2 } from 'lucide-react';
import type { Event } from '../../Data/Events';

import locBtnSelected from '@assets/icons/map-btn-active.svg';
import locBtn from '@assets/icons/map-btn-default.svg';
import timeIcon from '@assets/icons/time-btn.svg';

interface EventCardProps {
  event: Event;
  isBusinessSide?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (id: number) => void;
}

function EventCard({ event, isBusinessSide, onEdit, onDelete }: EventCardProps) {
  return (
    <div className="w-full max-w-md bg-[#333333] rounded-xl overflow-hidden border border-zinc-800/50 hover:bg-[#3d3d3d] transition-all duration-200">
      {/* Image Section */}
      <div className="relative group h-72">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Date Tag - Similar to Active Listing badge */}
        <div className="absolute top-4 left-4 px-2.5 py-1 bg-[#FFE2A0]/90 backdrop-blur-md rounded-full z-20 flex items-center justify-center shadow-lg">
          <span className="text-[#222222] text-[9px] font-black tracking-wider uppercase">{event.date}</span>
        </div>

        {/* Delete Button - Only for Business Side */}
        {isBusinessSide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(event.id);
            }}
            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-red-600/90 hover:bg-red-700 backdrop-blur-md rounded-full z-30 cursor-pointer shadow-xl border border-white/10 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Trash2 size={18} className="text-white" />
          </button>
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
                onClick={() => {}} // Placeholder for analytics or another action
                className="flex-1 py-3.5 bg-[#FFE2A0] text-[#222222] text-xs font-bold rounded-xl hover:bg-[#ffe8b5] transition-all active:scale-95 cursor-pointer shadow-lg"
              >
                View Analytics
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <button
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFE2A0] text-[#222222] text-xs font-bold rounded-xl hover:bg-[#ffe8b5] transition-all active:scale-95 cursor-pointer shadow-lg"
              >
                <img src={locBtn} width="14" alt="interested" />
                <span>Interested</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCard;
