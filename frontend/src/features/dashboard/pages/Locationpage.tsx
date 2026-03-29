import { useLocation } from 'react-router-dom';
import search from '@assets/icons/search-back-btn.svg';
import sampleImage from '@assets/png-files/imagesample.png';
import bg from '@assets/images/bg.png';

import DetailedBusinessCard from '../components/DetailedBusinessCard';
import SearchBar from '../components/SearchBar';
import MapView from '../../../map/MapView';
import type { Listing } from '../../Data/Listings';

const DEFAULT_SPOT = {
  title: "Holy Rosary Parish Church",
  location: "Angeles City, Pampanga",
  hours: "8:00 am - 10:00 pm (Mon-Fri)",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
  images: [sampleImage, bg, sampleImage],
  phone: "+63 976 355 7152",
  email: "hrpc@email.com",
  facebook: "facebook.com/hrpacofficial/",
  website: "www.hrpc.com",
  rating: 4.8,
  reviewsCount: 25,
  isVerified: true,
  reviews: [
    {
      id: 1,
      user: "Jane Doe",
      initials: "JD",
      date: "March 03, 2026",
      rating: 5,
      comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      id: 2,
      user: "John Smith",
      initials: "JS",
      date: "March 01, 2026",
      rating: 4,
      comment: "Nice place to visit and very historical.",
    }
  ]
};

const DEFAULT_LISTING: Listing = {
  id: 999,
  name: DEFAULT_SPOT.title,
  location: DEFAULT_SPOT.location,
  hours: DEFAULT_SPOT.hours,
  coordinates: { lat: 15.1450, lng: 120.5887 },
  category: 'Activities',
  description: DEFAULT_SPOT.description,
  images: DEFAULT_SPOT.images,
  verified: DEFAULT_SPOT.isVerified,
};

function Locationpage() {
  const { state } = useLocation();
  const listing: Listing = state?.listing ?? DEFAULT_LISTING;

  // Build the spot detail from the passed listing
  const spot = {
    ...DEFAULT_SPOT,
    title: listing.name,
    location: listing.location,
    hours: listing.hours,
    description: listing.description,
    images: listing.images,
    isVerified: listing.verified,
  };

  return (
    <div className="flex h-full w-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden">
      {/* Left: Business Detail */}
      <div className="w-125 h-full overflow-y-auto border-r border-zinc-800 flex flex-col items-center px-6 py-6 scrollbar-hide">
        <SearchBar
          searchIcon={search}
          containerClassName="w-full mb-6 shrink-0"
        />
        <DetailedBusinessCard {...spot} />
      </div>

      {/* Right: Map */}
      <div className="flex-1 h-full relative">
        <MapView
          listings={[listing]}
          selectedListing={listing}
          onSelect={() => {}}
        />
      </div>
    </div>
  );
}

export default Locationpage;