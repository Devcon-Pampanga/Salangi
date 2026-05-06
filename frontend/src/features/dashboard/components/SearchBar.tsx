import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import searchIconDefault from '@assets/icons/search-btn-default.svg';
import searchIconHover from '@assets/icons/search-btn-hover.svg';
import filterIconDefault from '@assets/icons/filter-btn-default.svg';
import filterIconHover from '@assets/icons/filter-btn-hover.svg';

export interface RatingRange {
  min: number;
  max: number;
}

export interface FilterOptions {
  ratingRange: RatingRange | null;
  sortBy: 'default' | 'az' | 'za';
  openNow: boolean;
  nearMe: boolean;
}

interface SearchBarProps {
  searchIcon?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  glass?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterChange?: (filters: FilterOptions) => void;
  filters?: FilterOptions;
}

const ratingRanges: RatingRange[] = [
  { min: 5, max: 5 },
  { min: 4, max: 4.9 },
  { min: 3, max: 3.9 },
  { min: 2, max: 2.9 },
  { min: 1, max: 1.9 },
];

const formatRangeLabel = (range: RatingRange): string => {
  if (range.min === range.max) return `${range.min.toFixed(1)}`;
  return `${range.min.toFixed(1)} – ${range.max.toFixed(1)}`;
};

const isRangeActive = (range: RatingRange, active: RatingRange | null | undefined): boolean =>
  active !== null && active !== undefined &&
  active.min === range.min &&
  active.max === range.max;

const SearchBar = ({
  searchIcon,
  placeholder = "Explore local spots",
  className = "",
  containerClassName = "",
  glass = false,
  value,
  onChange,
  onFilterChange,
  filters,
}: SearchBarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const currentSearchIcon = isHovered && !searchIcon ? searchIconHover : (searchIcon || searchIconDefault);
  const currentFilterIcon = isHovered ? filterIconHover : filterIconDefault;
  const isFilterActive = filters && (
    filters.ratingRange !== null ||
    filters.sortBy !== 'default' ||
    filters.openNow ||
    filters.nearMe
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterRef.current && !filterRef.current.contains(e.target as Node) &&
        filterBtnRef.current && !filterBtnRef.current.contains(e.target as Node)
      ) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterClick = () => {
    if (filterBtnRef.current) {
      const rect = filterBtnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setShowFilter(prev => !prev);
  };

  const handleRatingFilter = (range: RatingRange) => {
    onFilterChange?.({
      ...filters!,
      ratingRange: isRangeActive(range, filters?.ratingRange) ? null : range,
    });
  };

  const handleSortBy = (sort: 'az' | 'za') => {
    onFilterChange?.({
      ...filters!,
      sortBy: filters?.sortBy === sort ? 'default' : sort,
    });
  };

  const handleOpenNow = () => {
    onFilterChange?.({
      ...filters!,
      openNow: !filters?.openNow,
    });
  };

  const handleNearMe = () => {
    if (filters?.nearMe) {
      onFilterChange?.({ ...filters!, nearMe: false });
      return;
    }
    setNearMeLoading(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        onFilterChange?.({ ...filters!, nearMe: true });
        setNearMeLoading(false);
      },
      () => {
        alert('Unable to get your location. Please allow location access.');
        setNearMeLoading(false);
      }
    );
  };

  const handleClearFilters = () => {
    onFilterChange?.({ ratingRange: null, sortBy: 'default', openNow: false, nearMe: false });
    setShowFilter(false);
  };

  const dropdown = showFilter && onFilterChange ? ReactDOM.createPortal(
    <div
      ref={filterRef}
      data-filter-dropdown
      style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 99999 }}
      className="w-64 bg-[#1E1E1E] border border-zinc-700/60 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-700/40 flex items-center justify-between">
        <span className="text-xs font-bold text-[#FBFAF8] uppercase tracking-widest">Filters</span>
        {isFilterActive && (
          <button
            onClick={handleClearFilters}
            className="text-[10px] text-red-400 hover:text-red-300 font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-5">

        {/* Quick Filters */}
        <div>
          <p className="text-[10px] text-[#FBFAF8]/40 uppercase tracking-widest mb-3">Quick Filters</p>
          <div className="flex flex-col gap-2">

            {/* Open Now */}
            <button
              onClick={handleOpenNow}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center justify-between ${
                filters?.openNow
                  ? 'bg-green-500/10 border-green-500/60 text-green-400'
                  : 'bg-transparent border-zinc-700 text-[#FBFAF8]/70 hover:border-green-500/40 hover:bg-green-500/5 hover:text-green-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${filters?.openNow ? 'bg-green-400' : 'bg-zinc-600'}`} />
                Open Now
              </div>
              {filters?.openNow && <span className="text-[10px]">✓</span>}
            </button>

            {/* Near Me */}
            <button
              onClick={handleNearMe}
              disabled={nearMeLoading}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center justify-between disabled:opacity-50 ${
                filters?.nearMe
                  ? 'bg-[#FFE2A0]/10 border-[#FFE2A0]/60 text-[#FFE2A0]'
                  : 'bg-transparent border-zinc-700 text-[#FBFAF8]/70 hover:border-[#FFE2A0]/40 hover:bg-[#FFE2A0]/5 hover:text-[#FFE2A0]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>📍</span>
                {nearMeLoading ? 'Getting location...' : 'Near Me'}
              </div>
              {filters?.nearMe && <span className="text-[10px]">✓</span>}
            </button>

          </div>
        </div>

        {/* Rating Range */}
        <div>
          <p className="text-[10px] text-[#FBFAF8]/40 uppercase tracking-widest mb-3">Rating Range</p>
          <div className="flex flex-col gap-2">
            {ratingRanges.map(range => {
              const active = isRangeActive(range, filters?.ratingRange);
              return (
                <button
                  key={`${range.min}-${range.max}`}
                  onClick={() => handleRatingFilter(range)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center justify-between group ${
                    active
                      ? 'bg-[#FFE2A0]/10 border-[#FFE2A0] text-[#FFE2A0]'
                      : 'bg-transparent border-zinc-700 hover:border-[#FFE2A0]/40 hover:bg-[#FFE2A0]/5'
                  }`}
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`text-sm transition-all duration-100 ${
                          star <= range.min
                            ? 'text-[#FFE2A0]'
                            : 'text-zinc-600 group-hover:text-zinc-500'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className={`text-[10px] ${active ? 'text-[#FFE2A0]' : 'text-[#FBFAF8]/40'}`}>
                    {formatRangeLabel(range)}
                    {active && ' ✓'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <p className="text-[10px] text-[#FBFAF8]/40 uppercase tracking-widest mb-3">Sort By</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'az' as const, label: 'A → Z' },
              { value: 'za' as const, label: 'Z → A' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleSortBy(option.value)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center justify-center gap-1.5 ${
                  filters?.sortBy === option.value
                    ? 'bg-[#FFE2A0] text-[#1A1A1A] border-[#FFE2A0] shadow-lg shadow-[#FFE2A0]/20'
                    : 'bg-transparent text-[#FBFAF8]/70 border-zinc-700 hover:border-[#FFE2A0]/50 hover:text-[#FFE2A0] hover:bg-[#FFE2A0]/5'
                }`}
              >
                <span>{option.value === 'az' ? '↑' : '↓'}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`relative ${containerClassName}`}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex items-center px-4 py-2 border transition-all duration-200 ${glass
          ? 'bg-[#2D2D2D]/60 backdrop-blur-md rounded-xl'
          : 'bg-[#2D2D2D] rounded-lg'
        } ${(isHovered || isFocused) ? 'border-[#FFE2A0]' : 'border-zinc-700/50'} ${className}`}
      >
        <img src={currentSearchIcon} className="cursor-pointer" alt="search" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`flex-1 px-3 bg-transparent outline-none text-sm transition-colors duration-200
            ${isHovered && !isFocused ? 'text-[#FFE2A0] placeholder-[#FFE2A0]/70' : 'text-gray-200 placeholder-gray-500'}
          `}
        />
        <button ref={filterBtnRef} onClick={handleFilterClick} className="cursor-pointer relative">
          <img src={currentFilterIcon} width="16" alt="filter" />
          {isFilterActive && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFE2A0] rounded-full" />
          )}
        </button>
      </div>
      {dropdown}
    </div>
  );
};

export default SearchBar;