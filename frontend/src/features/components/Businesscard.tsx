// BusinessCard.tsx — Reusable card component for each listing

import type { Listing } from '../Data/Listings';

// Asset imports — adjust paths to match your project structure
import locBtnSelected from '../../assets/locBtnSelected.png';
import locBtn from '../../assets/locBtn.png';
import verified from '../../assets/verified.png';
import heart from '../../assets/heart.png';
import time from '../../assets/time.png';

interface BusinessCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  isSelected: boolean;
}

function BusinessCard({ listing, onSelect, isSelected }: BusinessCardProps) {
  return (
    <div
      onClick={() => onSelect(listing)}
      className={`w-full max-w-120 bg-[#373737] rounded-xl cursor-pointer overflow-hidden shrink-0 transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-[#FFE2A0] shadow-lg shadow-[#FFE2A0]/10'
          : 'hover:bg-[#3f3f3f]'
      }`}
    >
      <div className="p-5">
        {/* Image with heart button */}
        <div className="relative">
          <div className="absolute top-3 left-3 flex items-center justify-center w-10 h-10 bg-[#222222]/80 backdrop-blur-sm rounded-full z-20">
            <img src={heart} width="20" alt="heart" />
          </div>
          <img
            src={listing.image}
            className="w-full rounded-lg object-cover h-75"
            alt={listing.name}
          />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mt-4">
          <img src={locBtnSelected} width="13" alt="loc" />
          <p className="text-[#FBFAF8]/50 text-xs">{listing.location}</p>
        </div>

        {/* Hours */}
        <div className="flex items-center gap-2 mt-2">
          <img src={time} width="13" alt="time" />
          <p className="text-[#FBFAF8]/50 text-xs">{listing.hours}</p>
        </div>

        {/* Name + verified badge */}
        <div className="flex items-center gap-2 my-1">
          <p className="text-[#FBFAF8] font-semibold text-lg">{listing.name}</p>
          {listing.verified && (
            <img src={verified} width="15" alt="verified" title="Verified business" />
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-300 line-clamp-2 mb-1">
          {listing.description}
        </p>
        <span className="text-[#FFE2A0] text-sm cursor-pointer hover:underline">
          See more.
        </span>

        {/* CTA */}
        <div className="flex justify-end py-3 mt-2">
          <button className="flex items-center justify-center rounded-md gap-2 p-2 px-4 bg-[#FFE2A0] cursor-pointer hover:bg-[#f5d880] transition-colors">
            <img src={locBtn} width="13" alt="map" />
            <p className="text-[#222222] text-xs font-bold">Show in maps</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BusinessCard;