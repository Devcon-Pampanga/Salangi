import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { Listing } from '../../Data/Listings';
import { ROUTES } from '../../../routes/paths';

import locBtnSelected from '@assets/icons/map-btn-active.svg';
import locBtn from '@assets/icons/map-btn-default.svg';
import verified from '@assets/icons/verified-btn.svg';
import saveInactive from '@assets/icons/save-btn-inactive.svg';
import saveActive from '@assets/icons/save-btn-active.svg';
import time from '@assets/icons/time-btn.svg';

interface BusinessCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  isSelected: boolean;
  isSaved: boolean; 
  onToggleSave: (id: number) => void;
  isBusinessSide?: boolean;
}

function BusinessCard({ listing, onSelect, isSelected, isSaved, onToggleSave, isBusinessSide }: BusinessCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
  };

  return (
    <div
      id={`listing-card-${listing.id}`}
      onClick={() => onSelect(listing)}
      className={`w-full max-w-120 bg-[#333333] rounded-xl cursor-pointer overflow-hidden shrink-0 transition-all duration-200 border border-zinc-800/50 ${
        isSelected
          ? 'ring-2 ring-[#FFE2A0] shadow-xl shadow-[#FFE2A0]/5'
          : 'hover:bg-[#3d3d3d] hover:shadow-2xl hover:shadow-black/50'
      }`}
    >
      <div className="relative group">
        {/* Delete Button - Only for Business Side */}
        {isBusinessSide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Potential delete logic/modal trigger
            }}
            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-red-600/90 hover:bg-red-700 backdrop-blur-md rounded-full z-30 cursor-pointer shadow-xl border border-white/10 transition-all duration-300 hover:scale-110 active:scale-95"
            title="Delete Listing"
          >
            <Trash2 size={18} className="text-white" />
          </button>
        )}

        {/* Save Button - Only for Consumer Side */}
        {!isBusinessSide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(listing.id);
            }}
            className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 bg-[#222222]/80 backdrop-blur-sm rounded-full z-20 cursor-pointer hover:scale-110 active:scale-95 shadow-lg border border-white/10"
          >
            <img src={isSaved ? saveActive : saveInactive} width="20" alt="heart" />
          </button>
        )}

        {/* Image Carousel */}
        <div className="relative w-full h-72 overflow-hidden bg-zinc-900">
          <img
            src={listing.images[currentIndex]}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            alt={`${listing.name} - ${currentIndex + 1}`}
          />

          {listing.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 backdrop-blur-sm rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 backdrop-blur-sm rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={16} className="text-white" />
              </button>
            </>
          )}

          {listing.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {listing.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'bg-[#FFE2A0] w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Name and Category Row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[#FBFAF8] font-['Playfair_Display'] font-bold text-2xl tracking-tight leading-tight">
              {listing.name}
            </h3>
            {listing.verified && (
              <img src={verified} width="16" height="16" alt="verified" className="mt-1" />
            )}
          </div>
          <div className="px-2 py-0.5 rounded border border-[#FFE2A0]/20 bg-[#FFE2A0]/5 shrink-0 flex items-center justify-center">
            <span className="text-[#FFE2A0] text-[9px] font-bold uppercase tracking-widest">
              {listing.category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#FBFAF8]/70 leading-relaxed line-clamp-2 mb-6 h-10">
          {listing.description}
        </p>

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
          <div className="flex items-center gap-2">
            <img src={locBtnSelected} width="14" alt="location" className="opacity-70" />
            <span className="text-[#FBFAF8]/50 text-xs font-medium">{listing.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={time} width="14" alt="hours" className="opacity-70" />
            <span className="text-[#FBFAF8]/50 text-xs font-medium">{listing.hours}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isBusinessSide ? (
            <div className="flex gap-3 w-full">
              <button 
                onClick={(e) => e.stopPropagation()}
                className="flex-1 py-3.5 bg-[#454545] text-white text-xs font-bold rounded-xl hover:bg-[#525252] transition-all active:scale-95 cursor-pointer shadow-lg border border-white/5"
              >
                Edit Listing
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Potential navigation to analytics
                }}
                className="flex-1 py-3.5 bg-[#FFE2A0] text-[#222222] text-xs font-bold rounded-xl hover:bg-[#ffe8b5] transition-all active:scale-95 cursor-pointer shadow-lg"
              >
                View Analytics
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onSelect(listing); 
                }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFE2A0] text-[#222222] text-xs font-bold rounded-xl hover:bg-[#ffe8b5] transition-all active:scale-95 cursor-pointer shadow-lg"
              >
                <img src={locBtn} width="14" alt="show" />
                <span>Show in maps</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BusinessCard;