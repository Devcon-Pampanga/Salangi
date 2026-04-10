import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import search from '@assets/icons/search-btn-default.svg';

import BusinessCard from '../components/BusinessCard';
import CategoryFilters from '../components/CategoryFilters';
import SearchBar from '../components/SearchBar';
import type { FilterOptions } from '../components/SearchBar';

import { getListings, getAverageRatings, CATEGORIES } from '../../Data/Listings';
import type { Listing, Category } from '../../Data/Listings';

function Savepage() {
  const [listings, setListings]       = useState<Listing[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES.ALL as Category);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds]       = useState<number[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<number, number>>({});
  const [filters, setFilters]         = useState<FilterOptions>({ minRating: null, sortBy: 'default' });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
      setIsLoading(false);
    };

    fetchData().catch(console.error);
  }, []);

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

  const filteredSpots = useMemo(() => {
    let result = listings.filter((spot: Listing) => {
      const isSaved = savedIds.includes(spot.id);
      const matchesCategory = activeCategory === CATEGORIES.ALL || spot.category === activeCategory;
      const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = filters.minRating === null || (averageRatings[spot.id] ?? 0) >= filters.minRating;
      return isSaved && matchesCategory && matchesSearch && matchesRating;
    });

    if (filters.sortBy === 'az') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [listings, activeCategory, searchQuery, savedIds, filters, averageRatings]);

  return (
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
            <div className="flex items-center justify-center h-full opacity-40">
              <p className="text-sm animate-pulse">Loading saved spots...</p>
            </div>
          ) : filteredSpots.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20 max-w-5xl mx-auto">
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
  );
}

export default Savepage;