import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import search from '@assets/icons/search-back-btn.svg';
import sampleImage from '@assets/png-files/imagesample.png';
import bg from '@assets/images/bg.png';
import DetailedBusinessCard from '../components/DetailedBusinessCard';
import SearchBar from '../components/SearchBar';
import type { FilterOptions } from '../components/SearchBar';
import MapView from '../../../map/MapView';
import type { Listing } from '../../Data/Listings';
import { getListings, getAverageRatings } from '../../Data/Listings';
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
  const incomingListing: Listing | undefined = state?.listing;

  const [listings, setListings] = useState<Listing[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({ ratingRange: null, sortBy: 'default' });

  // selectedListing drives both map highlight and sidebar visibility
  const [selectedListing, setSelectedListing] = useState<Listing | null>(
    incomingListing ?? null
  );
  // sidebarOpen controls the animated slide-in/out
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!!incomingListing);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // ── Load all listings & ratings ──────────────────────────────────────────
  useEffect(() => {
    Promise.all([getListings(), getAverageRatings()])
      .then(([listingsData, ratingsData]) => {
        setListings(listingsData);
        setAverageRatings(ratingsData);
      })
      .catch(console.error);
  }, []);

  // ── Load saved IDs ───────────────────────────────────────────────────────
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

  // ── Load gallery images when selected listing changes ────────────────────
  useEffect(() => {
    if (!selectedListing) return;

    const fetchGalleryImages = async () => {
      const { data } = await supabase
        .from('gallery_images')
        .select('url')
        .eq('listing_id', selectedListing.id)
        .order('added_date', { ascending: false });

      const listingMainImage = selectedListing.images?.[0];

      if (data && data.length > 0) {
        const galleryUrls = data.map((row: any) => row.url);
        setGalleryImages([
          ...(listingMainImage ? [listingMainImage] : []),
          ...galleryUrls,
        ]);
      } else {
        setGalleryImages(selectedListing.images ?? []);
      }
    };

    fetchGalleryImages();
  }, [selectedListing?.id]);

  // ── Load reviews when selected listing changes ───────────────────────────
  useEffect(() => {
    if (!selectedListing) return;
    fetchReviews(selectedListing.id);
  }, [selectedListing?.id]);

  const fetchReviews = async (listingId: number) => {
    setReviewsLoading(true);
    try {
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('id, listing_id, user_id, rating, comment, created_at')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (reviewError) { console.error('reviews error:', reviewError); return; }
      if (!reviewData || reviewData.length === 0) { setReviews([]); return; }

      const userIds = [...new Set(reviewData.map((r: any) => r.user_id))];
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id, first_name, last_name, profile_pic')
        .in('user_id', userIds);

      if (userError) console.error('users error:', userError);

      const userMap: Record<string, any> = {};
      (userData ?? []).forEach((u: any) => { userMap[u.user_id] = u; });

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
      setSavedIds(prev => prev.filter(sid => sid !== id));
    } else {
      await supabase.from('saves').insert({ user_id: user.id, listing_id: id });
      setSavedIds(prev => [...prev, id]);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // ── Marker click: select listing and open sidebar ────────────────────────
  const handleMarkerSelect = (listing: Listing) => {
    setSelectedListing(listing);
    setSidebarOpen(true);
    setSearchQuery('');
    setSearchOpen(false);
  };

  // ── Close sidebar (map-only mode) ────────────────────────────────────────
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    // Small delay before clearing so slide-out animation plays fully
    setTimeout(() => setSelectedListing(null), 350);
  };

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const isSearching = searchQuery.trim().length > 0;

  const searchResults = isSearching
    ? listings
        .filter((item: Listing) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((item: Listing) => {
          const rating = averageRatings[item.id] ?? 0;
          return filters.ratingRange === null ||
            (rating >= filters.ratingRange.min && rating <= filters.ratingRange.max);
        })
        .sort((a, b) => {
          if (filters.sortBy === 'az') return a.name.localeCompare(b.name);
          if (filters.sortBy === 'za') return b.name.localeCompare(a.name);
          return 0;
        })
    : [];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1A1A1A]">

      {/* ── Full-screen Map ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <MapView
          listings={listings}
          selectedListing={selectedListing}
          onSelect={handleMarkerSelect}
        />
      </div>

      {/* ── Floating top bar (back btn + search) ───────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-4 py-4 pointer-events-none">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-[#2D2D2D]/90 hover:bg-[#3D3D3D] backdrop-blur-sm transition-colors cursor-pointer shrink-0 shadow-lg"
        >
          <img src={search} width="18" alt="back" />
        </button>

        {/* Search toggle (collapsed by default to keep map clean) */}
        <div
          className={`pointer-events-auto flex-1 transition-all duration-300 ${
            searchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none w-0 overflow-hidden'
          }`}
        >
          <SearchBar
            containerClassName="flex-1"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search local spots..."
            onFilterChange={setFilters}
            filters={filters}
          />
        </div>

        {/* Search icon button */}
        {!searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-[#2D2D2D]/90 hover:bg-[#3D3D3D] backdrop-blur-sm transition-colors shadow-lg text-[#FBFAF8]/70 text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Search local spots…</span>
          </button>
        )}

        {/* Close search */}
        {searchOpen && (
          <button
            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
            className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-[#2D2D2D]/90 hover:bg-[#3D3D3D] backdrop-blur-sm transition-colors cursor-pointer shrink-0 shadow-lg text-[#FBFAF8]"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Search results dropdown ─────────────────────────────────────── */}
      {isSearching && (
        <div className="absolute top-20 left-4 right-4 z-20 rounded-xl bg-[#1A1A1A]/95 backdrop-blur-sm border border-zinc-700/50 shadow-2xl max-h-72 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="flex flex-col divide-y divide-zinc-800/50">
              {searchResults.map((item: Listing) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkerSelect(item)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#2D2D2D] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#FBFAF8] truncate">{item.name}</p>
                    <p className="text-xs text-[#FBFAF8]/50 truncate">{item.location}</p>
                  </div>
                  {averageRatings[item.id] != null && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[#FFE2A0] text-xs">★</span>
                      <span className="text-[#FBFAF8]/50 text-xs">
                        {averageRatings[item.id].toFixed(1)}
                      </span>
                    </div>
                  )}
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

      {/* ── "Tap a pin" hint — shown only when no listing is selected ──── */}
      {!sidebarOpen && !isSearching && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1A1A1A]/80 backdrop-blur-sm border border-zinc-700/40 shadow-xl animate-pulse-slow">
            <span className="text-base">📍</span>
            <span className="text-xs text-[#FBFAF8]/70 font-medium whitespace-nowrap">
              Tap a pin to explore businesses
            </span>
          </div>
        </div>
      )}

      {/* ── Sidebar overlay backdrop (mobile) ──────────────────────────── */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-20 bg-black/30 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* ── Detail Sidebar ──────────────────────────────────────────────── */}
      {/*
        Desktop: slides in from the left (translateX)
        Mobile:  slides up from the bottom
      */}
      <div
        className={`
          absolute z-30
          /* Mobile: bottom sheet */
          bottom-0 left-0 right-0 h-[82vh] rounded-t-2xl
          /* Desktop: left sidebar */
          md:top-0 md:bottom-0 md:left-0 md:right-auto md:h-full md:w-[440px] md:rounded-none
          bg-[#1A1A1A] border-t border-zinc-800 md:border-t-0 md:border-r
          overflow-hidden flex flex-col
          transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]
          /* Slide states */
          ${sidebarOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:-translate-x-full'
          }
        `}
        style={{ willChange: 'transform' }}
      >
        {/* Drag handle (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-600" />
        </div>

        {/* Sidebar header with close button */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-zinc-800/60 md:border-b-0 md:pt-4">
          <button
            onClick={handleCloseSidebar}
            className="hidden md:flex items-center gap-2 text-[#FBFAF8]/50 hover:text-[#FBFAF8] transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
            </svg>
            Back to map
          </button>
          <button
            onClick={handleCloseSidebar}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#2D2D2D] hover:bg-[#3D3D3D] transition-colors text-[#FBFAF8]/70 text-sm"
          >
            ✕
          </button>
          {/* Spacer to keep close btn right on mobile */}
          <div className="md:hidden" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 md:px-6">
          {selectedListing && (
            <DetailedBusinessCard
              listingId={selectedListing.id}
              title={selectedListing.name}
              location={selectedListing.location}
              hours={selectedListing.hours}
              description={selectedListing.description}
              images={galleryImages}
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
      </div>

    </div>
  );
}

export default Locationpage;