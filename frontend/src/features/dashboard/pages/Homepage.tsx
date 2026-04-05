import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

import BusinessCard from '../components/BusinessCard';
import MapView from '../../../map/MapView';
import SearchBar from '../components/SearchBar';

import { getListings, CATEGORIES } from '../../Data/Listings';
import type { Listing, Category } from '../../Data/Listings';

import CategoryFilters from '../components/CategoryFilters';

function Homepage() {
  const navigate = useNavigate();

  const [listings, setListings]               = useState<Listing[]>([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [activeCategory, setActiveCategory]   = useState<Category>(CATEGORIES.ALL as Category);
  const [searchQuery,    setSearchQuery]       = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [savedIds, setSavedIds]               = useState<number[]>([]);

  // Fetch listings
  useEffect(() => {
    getListings()
      .then(setListings)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch saved spots from Supabase
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

  const toggleSave = async (id: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isSaved = savedIds.includes(id);

    if (isSaved) {
      await supabase
        .from('saves')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', id);
      setSavedIds(prev => prev.filter(savedId => savedId !== id));
    } else {
      await supabase
        .from('saves')
        .insert({ user_id: user.id, listing_id: id });
      setSavedIds(prev => [...prev, id]);
    }
  };

  const filteredListings = useMemo<Listing[]>(() => {
    return listings.filter((item: Listing) => {
      const matchesCategory =
        activeCategory === CATEGORIES.ALL || item.category === activeCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [listings, activeCategory, searchQuery]);

  const handleCardSelect = (listing: Listing): void => {
    setSelectedListing((prev: Listing | null) =>
      prev?.id === listing.id ? null : listing
    );
  };

  const handleCategoryChange = (cat: Category): void => {
    setActiveCategory(cat);
    setSelectedListing(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (!selectedListing) return;
    const el = document.getElementById(`listing-card-${selectedListing.id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedListing]);

  return (
    <div className="relative w-full h-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden">

      <div
        className="absolute top-0 left-0 rounded-full blur-3xl opacity-60 pointer-events-none"
        style={{
          width: '760px',
          height: '680px',
          transform: 'translate(-400px, -440px)',
          background: 'radial-gradient(circle, rgba(255,226,160,0.8) 0%, rgba(255,226,160,0.2) 50%, transparent 70%)',
        }}
      />

      <div className="relative z-10 h-full flex px-6 py-6 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div
          className="h-full flex flex-col overflow-hidden shrink-0"
          style={{ width: '480px' }}
        >
          <div className="shrink-0">
            <h1 className="font-['Playfair_Display'] text-3xl leading-tight mb-5">
              Discover the <span className="text-[#FFE2A0]">heart</span> of Pampanga.
            </h1>

            <CategoryFilters
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              className="mb-5"
            />
          </div>

          <div
            className="flex-1 overflow-y-auto flex flex-col gap-6 pb-10 pr-2 pl-1 pt-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[#FBFAF8]/50 text-sm animate-pulse">Loading listings...</p>
              </div>
            ) : filteredListings.length > 0 ? (
              filteredListings.map((listing: Listing) => (
                <BusinessCard
                  key={listing.id}
                  listing={listing}
                  onSelect={handleCardSelect}
                  isSelected={selectedListing?.id === listing.id}
                  isSaved={savedIds.includes(listing.id)}
                  onToggleSave={toggleSave}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-[#FBFAF8]/70 font-semibold">No places found</p>
                <p className="text-[#FBFAF8]/40 text-sm mt-1">
                  Try a different search term or category
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          <div className="flex items-center gap-3 shrink-0">
            <SearchBar
              placeholder="Explore local spots"
              value={searchQuery}
              onChange={handleSearchChange}
              className="py-1"
              containerClassName="flex-1"
            />

            <button
              onClick={() => navigate('/listbusiness')}
              className="flex items-center gap-2 px-4 py-3 bg-[#FFE2A0] text-[#1A1A1A] rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer hover:bg-[#f5d880] transition-colors"
            >
              📍 List Your Business
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <MapView
              listings={filteredListings}
              selectedListing={selectedListing}
              onSelect={handleCardSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;