import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing } from '../../Data/Listings';

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
}

// ── Placeholder shown when a listing has no images ────────────────────────────
function NoImagePlaceholder({ name }: { name: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#2D2D2D] gap-3">
      <span className="text-5xl">🏪</span>
      <p className="text-[#FBFAF8]/30 text-xs text-center px-4">
        No photos yet for<br />
        <span className="text-[#FBFAF8]/50 font-medium">{name}</span>
      </p>
    </div>
  );
}

function BusinessCard({ listing, onSelect, isSelected, isSaved, onToggleSave }: BusinessCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const hasImages = Array.isArray(listing.images) && listing.images.length > 0;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgError(false);
    setCurrentIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgError(false);
    setCurrentIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
  };

  return (
    <div
      id={`listing-card-${listing.id}`}
      onClick={() => onSelect(listing)}
      className={`w-full max-w-120 bg-[#373737] rounded-xl cursor-pointer overflow-hidden shrink-0 transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-[#FFE2A0] shadow-lg shadow-[#FFE2A0]/10'
          : 'hover:bg-[#3f3f3f]'
      }`}
    >
      <div className="relative group">
        {/* Save button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(listing.id);
          }}
          className="absolute top-3 left-3 flex items-center justify-center w-10 h-10 bg-[#222222]/80 backdrop-blur-sm rounded-full z-20 cursor-pointer hover:scale-110 active:scale-95"
        >
          <img src={isSaved ? saveActive : saveInactive} width="20" alt="heart" />
        </button>

        {/* Image area */}
        <div className="relative w-full h-72 overflow-hidden bg-zinc-800">
          {hasImages && !imgError ? (
            <img
              key={listing.images[currentIndex]}
              src={listing.images[currentIndex]}
              className="w-full h-full object-cover transition-opacity duration-300"
              alt={`${listing.name} - ${currentIndex + 1}`}
              onError={() => setImgError(true)}
            />
          ) : (
            <NoImagePlaceholder name={listing.name} />
          )}

          {/* Prev / Next arrows — only if multiple valid images */}
          {hasImages && !imgError && listing.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 backdrop-blur-sm rounded-full z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 backdrop-blur-sm rounded-full z-10"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {hasImages && !imgError && listing.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {listing.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'bg-white w-3' : 'bg-white/40 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Image count badge */}
          {hasImages && !imgError && listing.images.length > 1 && (
            <div className="absolute top-3 right-3 bg-[#222222]/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-20">
              {currentIndex + 1} / {listing.images.length}
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-center gap-2 mt-4">
          <img src={locBtnSelected} width="13" alt="loc" />
          <p className="text-[#FBFAF8]/50 text-sm">{listing.location}</p>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <img src={time} width="13" alt="time" />
          <p className="text-[#FBFAF8]/50 text-sm">{listing.hours}</p>
        </div>

        <div className="flex items-center gap-2 my-1">
          {listing.verified && (
            <img src={verified} width="15" alt="verified" title="Verified business" />
          )}
          <p className="text-[#FBFAF8] font-semibold text-lg">{listing.name}</p>
        </div>

        <p className="text-sm text-zinc-300 line-clamp-2 mb-1">
          {listing.description}
        </p>

        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate('/location-page', { state: { listing } });
          }}
          className="text-[#FFE2A0] text-sm cursor-pointer hover:underline"
        >
          See more.
        </span>

        <div className="flex justify-end py-3 mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(listing); }}
            className="flex items-center justify-center rounded-md gap-2 p-2 px-4 bg-[#FFE2A0] cursor-pointer hover:brightness-110 active:scale-95 transition-all duration-150"
          >
            <img src={locBtn} width="13" alt="show" />
            <p className="text-[#222222] text-xs font-bold">Show in maps</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BusinessCard;