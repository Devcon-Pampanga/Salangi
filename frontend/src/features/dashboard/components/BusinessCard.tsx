import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing } from '../../Data/Listings';

// Asset imports — adjust paths to match your project structure
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
}

function BusinessCard({ listing, onSelect, isSelected }: BusinessCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      onClick={() => onSelect(listing)}
      className={`w-full max-w-120 bg-[#373737] rounded-xl cursor-pointer overflow-hidden shrink-0 transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-[#FFE2A0] shadow-lg shadow-[#FFE2A0]/10'
          : 'hover:bg-[#3f3f3f]'
      }`}
    >
      <div className="relative group">
        {/* If clicked, it will save the card to the Saved page*/}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          className="absolute top-3 left-3 flex items-center justify-center w-10 h-10 bg-[#222222]/80 backdrop-blur-sm rounded-full z-20 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <img src={isSaved ? saveActive : saveInactive} width="20" alt="heart" />
        </button>

        {/* Image Carousel */}
        <div className="relative w-full h-72 overflow-hidden bg-zinc-800">
          <img
            src={listing.images[currentIndex]}
            className="w-full h-full object-cover transition-opacity duration-300"
            alt={`${listing.name} - ${currentIndex + 1}`}
          />

          {/* Navigation Arrows */}
          {listing.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#222222]/50 hover:bg-[#222222]/80 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {listing.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {listing.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'bg-white w-3' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-2 mt-4">
          <img src={locBtnSelected} width="13" alt="loc" />
          <p className="text-[#FBFAF8]/50 text-sm">{listing.location}</p>
        </div>

        {/* Hours */}
        <div className="flex items-center gap-2 mt-2">
          <img src={time} width="13" alt="time" />
          <p className="text-[#FBFAF8]/50 text-sm">{listing.hours}</p>
        </div>

        {/* Name + verified badge */}
        <div className="flex items-center gap-2 my-1">
          {listing.verified && (
            <img src={verified} width="15" alt="verified" title="Verified business" />
          )}
          <p className="text-[#FBFAF8] font-semibold text-lg">{listing.name}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-300 line-clamp-2 mb-1">
          {listing.description}
        </p>
        <Link to="/location-page">
          <span className="text-[#FFE2A0] text-sm cursor-pointer hover:underline">
            See more.
          </span>
        </Link>

        {/* CTA */}
        <div className="flex justify-end py-3 mt-2">
            <Link to="/location-page">
                <button className="flex items-center justify-center rounded-md gap-2 p-2 px-4 bg-[#FFE2A0] cursor-pointer hover:brightness-110 active:scale-95 transition-all duration-200 shadow-lg">
                    <img src={locBtn} width="13" alt="show" />
                    <p className="text-[#222222] text-xs font-bold">Show in maps</p>
                </button>
            </Link>
        </div>
      </div>
    </div>
  );
}

export default BusinessCard;