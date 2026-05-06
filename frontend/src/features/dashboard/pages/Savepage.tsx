import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/authContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import LoginBottomSheet from '../components/LoginBottomSheet';
import SkeletonCard from '../components/SkeletonCard';
import search from '@assets/icons/search-btn-default.svg';

import BusinessCard from '../components/BusinessCard';
import CategoryFilters from '../components/CategoryFilters';
import SearchBar from '../components/SearchBar';
import type { FilterOptions } from '../components/SearchBar';

import { getListings, getAverageRatings, CATEGORIES } from '../../Data/Listings';
import type { Listing, Category } from '../../Data/Listings';

function Savepage() {
  const { session } = useAuth();
  const { guard, sheetProps } = useAuthGuard();
  const [listings, setListings]       = useState<Listing[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES.ALL as Category);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds]       = useState<number[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<number, number>>({});
  const [filters, setFilters]         = useState<FilterOptions>({ ratingRange: null, sortBy: 'default' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = session?.user;

        // ✅ Guest: stop loading, show empty state
        if (!user) {
          setIsLoading(false);
          return;
        }

        const [listingsData, ratingsData, savesResult] = await Promise.all([
          getListings(),
          getAverageRatings(),
          supabase.from('saves').select('listing_id').eq('user_id', user.id)
        ]);

        setListings(listingsData);
        setAverageRatings(ratingsData);
        if (!savesResult.error && savesResult.data) {
          setSavedIds(savesResult.data.map((row: any) => row.listing_id));
        }
      } catch (error) {
        console.warn("Error fetching data:", error);
      } finally {
        setIsLoading(false); // ✅ always stop loading
      }
    };

    fetchData();
  }, [session]);

  const toggleSave = async (id: number) => {
    try {
      const user = session?.user;
      if (!user) return;

      const isSaved = savedIds.includes(id);
      if (isSaved) {
        await supabase.from('saves').delete().eq('user_id', user.id).eq('listing_id', id);
        setSavedIds(prev => prev.filter(savedId => savedId !== id));
      } else {
        await supabase.from('saves').insert({ user_id: user.id, listing_id: id });
        setSavedIds(prev => [...prev, id]);
      }
    } catch (error) {
      console.warn("Error toggling save:", error);
    }
  };

  const filteredSpots = useMemo(() => {
    let result = listings.filter((spot: Listing) => {
      const isSaved = savedIds.includes(spot.id);
      const matchesCategory = activeCategory === CATEGORIES.ALL || spot.category === activeCategory;
      const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase());
      const rating = averageRatings[spot.id] ?? 0;
      const matchesRating = filters.ratingRange === null ||
        (rating >= filters.ratingRange.min && rating <= filters.ratingRange.max);
      return isSaved && matchesCategory && matchesSearch && matchesRating;
    });

    if (filters.sortBy === 'az') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'za') {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [listings, activeCategory, searchQuery, savedIds, filters, averageRatings]);

  // ✅ Guest empty state content
  const isGuest = !session?.user;

  return (
    <>
      <div className="flex h-screen w-full bg-[#1A1A1A] text-[#F8FAF8] overflow-hidden font-sans">
        <main className="flex-1 relative flex flex-col overflow-hidden px-4 md:px-10 pt-6 md:pt-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 z-10 gap-4 w-full shrink-0">
            <CategoryFilters
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              className="order-2 md:order-1"
            />
            <SearchBar
              glass
              searchIcon={search}
              className="w-full md:w-110 py-3"
              containerClassName="w-full md:w-auto order-1 md:order-2"
              placeholder="Search your saved spots"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onFilterChange={setFilters}
              filters={filters}
            />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar z-10">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20 w-full">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>

            ) : isGuest ? (
              // ✅ Guest state — prompts sign in
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60 gap-4">
                <div className="text-5xl">🔒</div>
                <h3 className="text-xl font-semibold">Sign in to see your saved spots</h3>
                <p className="max-w-xs text-sm opacity-70">
                  Create a free account to save businesses and build your local favourites list.
                </p>
                <button
                  onClick={() => guard('save', () => {})}
                  className="mt-2 bg-[#FFE2A0] text-[#373737] px-6 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 transition-all active:scale-95 shadow-lg cursor-pointer"
                >
                  Sign in
                </button>
              </div>

            ) : filteredSpots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20 w-full">
                {filteredSpots.map((listing: Listing) => (
                  <BusinessCard
                    key={listing.id}
                    listing={listing}
                    isSaved={true}
                    onToggleSave={toggleSave}
                    onSelect={() => {}}
                    isSelected={false}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                <div className="mb-4 text-6xl">✨</div>
                <h3 className="text-xl font-semibold mb-2">No saved spots</h3>
                <p className="max-w-xs text-sm">
                  Locations you save while browsing will appear here for quick access.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ✅ Login sheet for guest sign-in prompt */}
      <LoginBottomSheet {...sheetProps} />
    </>
  );
}

export default Savepage;