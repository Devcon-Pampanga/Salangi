import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  id: 1,
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
  const navigate = useNavigate();
  const listing: Listing = state?.listing ?? DEFAULT_LISTING;

  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing>(listing);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  useEffect(() => {
    getListings().then(setListings).catch(console.error);
  }, []);

  // Fetch user's saved listings
  useEffect(() => {
    const fetchSaves = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('saves')
        .select('listing_id')
        .eq('user_id', user.id);
      if (!error && data) {
        setSavedIds(data.map((row: any) => row.listing_id));
      }
    };
    fetchSaves();
  }, []);

  useEffect(() => {
    fetchReviews(selectedListing.id);
  }, [selectedListing.id]);

  const fetchReviews = async (listingId: number) => {
    setReviewsLoading(true);
    try {
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('id, listing_id, user_id, rating, comment, created_at')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (reviewError) {
        console.error('reviews error:', reviewError);
        setReviewsLoading(false);
        return;
      }

      if (!reviewData || reviewData.length === 0) {
        setReviews([]);
        setReviewsLoading(false);
        return;
      }

      const userIds = [...new Set(reviewData.map((r: any) => r.user_id))];
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id, first_name, last_name, profile_pic')
        .in('user_id', userIds);

      if (userError) {
        console.error('users error:', userError);
      }

      const userMap: Record<string, any> = {};
      (userData ?? []).forEach((u: any) => {
        userMap[u.user_id] = u;
      });

      const mapped: Review[] = reviewData.map((r: any) => {
        const u = userMap[r.user_id];
        const firstName = u?.first_name ?? 'Anonymous';
        const lastName = u?.last_name ?? '';
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
          profilePic: u?.profile_pic ?? null,
        };
      });

      setReviews(mapped);
    } catch (err) {
      console.error('fetchReviews unexpected error:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const toggleSave = async (id: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const isSaved = savedIds.includes(id);
    if (isSaved) {
      await supabase.from('saves').delete().eq('user_id', user.id).eq('listing_id', id);
      setSavedIds(prev => prev.filter(savedId => savedId !== id));
    } else {
      await supabase.from('saves').insert({ user_id: user.id, listing_id: id });
      setSavedIds(prev => [...prev, id]);
    }
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
        
        {/* Search bar with back button */}
        <div className="flex items-center gap-2 w-full mb-4 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2D2D2D] hover:bg-[#3D3D3D] transition-colors cursor-pointer shrink-0"
          >
            <img src={search} width="18" alt="back" />
          </button>
          <SearchBar
            containerClassName="flex-1"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search local spots..."
          />
        </div>

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
            initialSaved={savedIds.includes(selectedListing.id)}
            onToggleSave={toggleSave}
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