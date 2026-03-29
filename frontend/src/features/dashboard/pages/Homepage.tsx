// Features: category filtering, real-time search, map interaction, "List Your Business" nav

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
 
import BusinessCard from '../components/BusinessCard';
import MapView from '../../../map/MapView';
 
import { listings, CATEGORIES } from '../../Data/Listings';
import type { Listing, Category } from '../../Data/Listings';
 
import CategoryFilters from '../components/CategoryFilters';
import locBtn from '@assets/png-files/locBtn.png';
import search from '@assets/png-files/search.png';
import settings from '@assets/png-files/Settings.png';
 
function Homepage() {
  const navigate = useNavigate();
 
  const [activeCategory, setActiveCategory]   = useState<Category>(CATEGORIES.ALL as Category);
  const [searchQuery,    setSearchQuery]       = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // 1. Logic for saving/loading from LocalStorage
  const [savedIds, setSavedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('salangi_saved_spots');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('salangi_saved_spots', JSON.stringify(savedIds));
  }, [savedIds]);

  const toggleSave = (id: number) => {
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(savedId => savedId !== id) : [...prev, id]
    );
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
  }, [activeCategory, searchQuery]);
 
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

  // Scroll to selected card when selected from map pin
  useEffect(() => {
    if (!selectedListing) return;
    const el = document.getElementById(`listing-card-${selectedListing.id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedListing]);
 
  return (
    <div className="relative w-full h-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden">
 
      {/* Ambient glow — matches original */}
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
 
        {/* ── LEFT COLUMN: fixed width, title + filters + scrollable cards ── */}
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
 
          {/* Scrollable card list */}
          <div
            className="flex-1 overflow-y-auto flex flex-col gap-6 pb-10 pr-2 pl-1 pt-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {filteredListings.length > 0 ? (
              filteredListings.map((listing: Listing) => (
                <BusinessCard
                  key={listing.id}
                  listing={listing}
                  onSelect={handleCardSelect}
                  isSelected={selectedListing?.id === listing.id}
                  // ADD THESE TWO PROPS TO FIX THE ERROR
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
 
        {/* ── RIGHT COLUMN: flex-1 fills remaining space, search bar + map ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
 
          {/* Search bar row */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex-1 flex items-center px-4 py-3 bg-[#2D2D2D] rounded-lg border border-transparent focus-within:border-gray-500 transition-all">
              <img src={search} alt="search" className="cursor-pointer" style={{ width: '16px' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Explore local spots"
                className="flex-1 px-3 bg-transparent text-gray-200 placeholder-gray-500 outline-none text-sm"
              />
              <img src={settings} alt="settings" className="cursor-pointer" style={{ width: '16px' }} />
            </div>
 
            {/* List Your Business button */}
            <button
              onClick={() => navigate('/listbusiness')}
              className="flex items-center gap-2 px-4 py-3 bg-[#FFE2A0] text-[#1A1A1A] rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer hover:bg-[#f5d880] transition-colors"
            >
              <img src={locBtn} alt="pin" style={{ width: '13px' }} />
              List Your Business
            </button>
          </div>
 
          {/* Map — fills all remaining vertical space below search bar */}
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