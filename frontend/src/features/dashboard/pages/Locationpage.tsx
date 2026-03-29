import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import search from '@assets/icons/search-back-btn.svg';
import sampleImage from '@assets/png-files/imagesample.png';
import bg from '@assets/images/bg.png';
import DetailedBusinessCard from '../components/DetailedBusinessCard';
import SearchBar from '../components/SearchBar';
import MapView from '../../../map/MapView';
import type { Listing } from '../../Data/Listings';
import { getListings } from '../../Data/Listings';

const DEFAULT_SPOT = {
  title: "Holy Rosary Parish Church",
  location: "Angeles City, Pampanga",
  hours: "8:00 am - 10:00 pm (Mon-Fri)",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  images: [sampleImage, bg, sampleImage],
  phone: '+63 928 520 7489',
  facebook: 'facebook.com/hrpacofficial',
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
  phone: DEFAULT_SPOT.phone,
  facebook: DEFAULT_SPOT.facebook,
};

function Locationpage() {
  const { state } = useLocation();
  const listing: Listing = state?.listing ?? DEFAULT_LISTING;

  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing>(listing);

  // Fetch listings from Supabase for search
  useEffect(() => {
    getListings().then(setListings).catch(console.error);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const searchResults = searchQuery.trim().length > 0
    ? listings.filter((item: Listing) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const isSearching = searchQuery.trim().length > 0;

  const spot = {
    ...DEFAULT_SPOT,
    title: selectedListing.name,
    location: selectedListing.location,
    hours: selectedListing.hours,
    description: selectedListing.description,
    images: selectedListing.images,
    isVerified: selectedListing.verified,
    phone: selectedListing.phone,
    email: selectedListing.email,
    facebook: selectedListing.facebook,
    website: selectedListing.website,
  };

  return (
    <div className="flex h-full w-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden">
      {/* Left: Business Detail */}
      <div className="w-125 h-full overflow-y-auto border-r border-zinc-800 flex flex-col items-center px-6 py-6 scrollbar-hide">
        <SearchBar
          searchIcon={search}
          containerClassName="w-full mb-4 shrink-0"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search local spots..."
        />

        {/* Search Results */}
        {isSearching && (
          <div className="w-full mb-4">
            {searchResults.length > 0 ? (
              <div className="flex flex-col gap-2">
                {searchResults.map((item: Listing) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedListing(item);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-4 py-3 bg-[#2D2D2D] rounded-lg cursor-pointer hover:bg-[#3D3D3D] transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#FBFAF8]">{item.name}</p>
                      <p className="text-xs text-[#FBFAF8]/50">{item.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[#FBFAF8]/50 text-sm">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Business Detail */}
        {!isSearching && <DetailedBusinessCard {...spot} />}
      </div>

      {/* Right: Map */}
      <div className="flex-1 h-full relative">
        <MapView
          listings={isSearching ? searchResults : [selectedListing]}
          selectedListing={selectedListing}
          onSelect={(item) => {
            setSelectedListing(item);
            setSearchQuery('');
          }}
        />
      </div>
    </div>
  );
}

export default Locationpage;