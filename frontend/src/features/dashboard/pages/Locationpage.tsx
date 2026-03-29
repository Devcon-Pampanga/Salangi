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
import { supabase } from '@/lib/supabase';

interface Review {
  id: number;
  user: string;
  initials: string;
  date: string;
  rating: number;
  comment: string;
  profilePic?: string;
}

const DEFAULT_LISTING: Listing = {
  id: 999,
  name: "Holy Rosary Parish Church",
  location: "Angeles City, Pampanga",
  hours: "8:00 am - 10:00 pm (Mon-Fri)",
  coordinates: { lat: 15.1450, lng: 120.5887 },
  category: 'Activities',
  description: "One of Pampanga's oldest and most revered churches.",
  images: [sampleImage, bg, sampleImage],
  verified: true,
  phone: '+63 928 520 7489',
  facebook: 'facebook.com/hrpacofficial',
};

function Locationpage() {
  const { state } = useLocation();
  const listing: Listing = state?.listing ?? DEFAULT_LISTING;

  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing>(listing);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    getListings().then(setListings).catch(console.error);
  }, []);

  useEffect(() => {
    fetchReviews(selectedListing.id);
  }, [selectedListing.id]);

  const fetchReviews = async (listingId: number) => {
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select(`*, users!inner(first_name, last_name, profile_pic)`)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped: Review[] = data.map((r: any) => {
        const firstName = r.users?.first_name ?? 'Anonymous';
        const lastName = r.users?.last_name ?? '';
        const fullName = `${firstName} ${lastName}`.trim();
        const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
        return {
          id: r.id,
          user: fullName,
          initials,
          date: new Date(r.created_at).toLocaleDateString('en-US', {
            month: 'long', day: '2-digit', year: 'numeric'
          }),
          rating: r.rating,
          comment: r.comment,
          profilePic: r.users?.profile_pic ?? null,
        };
      });
      setReviews(mapped);
    }
    setReviewsLoading(false);
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

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

  return (
    <div className="flex h-full w-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden">
      <div className="w-125 h-full overflow-y-auto border-r border-zinc-800 flex flex-col items-center px-6 py-6 scrollbar-hide">
        <SearchBar
          searchIcon={search}
          containerClassName="w-full mb-4 shrink-0"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search local spots..."
        />

        {isSearching && (
          <div className="w-full mb-4">
            {searchResults.length > 0 ? (
              <div className="flex flex-col gap-2">
                {searchResults.map((item: Listing) => (
                  <div
                    key={item.id}
                    onClick={() => { setSelectedListing(item); setSearchQuery(''); }}
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

        {!isSearching && (
          <DetailedBusinessCard
            listingId={selectedListing.id}
            title={selectedListing.name}
            location={selectedListing.location}
            hours={selectedListing.hours}
            description={selectedListing.description}
            images={selectedListing.images}
            isVerified={selectedListing.verified}
            phone={selectedListing.phone}
            email={selectedListing.email}
            facebook={selectedListing.facebook}
            website={selectedListing.website}
            rating={averageRating}
            reviewsCount={reviews.length}
            reviews={reviews}
            reviewsLoading={reviewsLoading}
            onReviewAdded={() => fetchReviews(selectedListing.id)}
          />
        )}
      </div>

      <div className="flex-1 h-full relative">
        <MapView
          listings={isSearching ? searchResults : [selectedListing]}
          selectedListing={selectedListing}
          onSelect={(item) => { setSelectedListing(item); setSearchQuery(''); }}
        />
      </div>
    </div>
  );
}

export default Locationpage;