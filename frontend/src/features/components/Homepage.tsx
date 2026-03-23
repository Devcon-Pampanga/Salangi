// Features: category filtering, real-time search, map interaction, "List Your Business" nav

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
 
import BusinessCard from './Businesscard';
import MapView from './Mapview';
 
import { listings, CATEGORIES } from '../Data/Listings';
import type { Listing, Category } from '../Data/Listings';
 
import locBtn from '../../assets/locBtn.png';
import grid from '../../assets/grid.png';
import resto from '../../assets/resto.png';
import cafe from '../../assets/cafe.png';
import activities from '../../assets/activities.png';
import search from '../../assets/search.png';
import settings from '../../assets/Settings.png';
 
// ── Types ─────────────────────────────────────────────────────────────────────
 
interface CategoryButton {
  label: Category;
  icon: string;
  alt: string;
}
 
// ── Category button config ────────────────────────────────────────────────────
 
const CATEGORY_BUTTONS: CategoryButton[] = [
  { label: CATEGORIES.ALL as Category,        icon: grid,       alt: 'all'        },
  { label: CATEGORIES.RESTO as Category,      icon: resto,      alt: 'resto'      },
  { label: CATEGORIES.CAFE as Category,       icon: cafe,       alt: 'cafe'       },
  { label: CATEGORIES.ACTIVITIES as Category, icon: activities, alt: 'activities' },
];
 
// ── Component ─────────────────────────────────────────────────────────────────
 
function Homepage() {
  const navigate = useNavigate();
 
  const [activeCategory, setActiveCategory]   = useState<Category>(CATEGORIES.ALL as Category);
  const [searchQuery,    setSearchQuery]       = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
 
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
          style={{ width: '480px',}}
        >
          <div className="shrink-0">
            <h1 className="font-['Playfair_Display'] text-3xl leading-tight mb-5">
              Discover the <span className="text-[#FFE2A0]">heart</span> of Pampanga.
            </h1>
 
            {/* Category filter buttons */}
            <div className="flex gap-3 mb-5">
              {CATEGORY_BUTTONS.map(({ label, icon, alt }: CategoryButton) => (
                <button
                  key={label}
                  onClick={() => handleCategoryChange(label)}
                  className={`flex items-center cursor-pointer gap-2 py-2 px-4 rounded-lg transition-colors text-sm whitespace-nowrap ${
                    activeCategory === label
                      ? 'bg-[#FFE2A0] text-[#1A1A1A] font-semibold'
                      : 'bg-[#373737] text-[#FBFAF8] hover:bg-[#454545]'
                  }`}
                >
                  <img src={icon} alt={alt} style={{ width: '16px', height: '16px' }} />
                  <p>{label}</p>
                </button>
              ))}
            </div>
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
          <div className="flex-1 mt-6 min-h-0">
            <MapView selectedListing={selectedListing} />
          </div>
 
        </div>
      </div>
    </div>
  );
}
 
export default Homepage;