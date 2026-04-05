import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import searchIconDefault from '@assets/icons/search-btn-default.svg';
import searchIconHover from '@assets/icons/search-btn-hover.svg';
import filterIconDefault from '@assets/icons/filter-btn-default.svg';
import filterIconHover from '@assets/icons/filter-btn-hover.svg';

export interface FilterOptions {
  minRating: number | null;
  sortBy: 'default' | 'az';
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
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const currentSearchIcon = isHovered && !searchIcon ? searchIconHover : (searchIcon || searchIconDefault);
  const currentFilterIcon = isHovered ? filterIconHover : filterIconDefault;
  const isFilterActive = filters && (filters.minRating !== null || filters.sortBy !== 'default');

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

  const handleRatingFilter = (rating: number | null) => {
    onFilterChange?.({
      minRating: filters?.minRating === rating ? null : rating,
      sortBy: filters?.sortBy ?? 'default',
    });
  };

  const handleSortBy = (sort: 'default' | 'az') => {
    onFilterChange?.({
      minRating: filters?.minRating ?? null,
      sortBy: filters?.sortBy === sort ? 'default' : sort,
    });
  };

  const handleClearFilters = () => {
    onFilterChange?.({ minRating: null, sortBy: 'default' });
    setShowFilter(false);
  };

  const dropdown = showFilter && onFilterChange ? ReactDOM.createPortal(
    <div
      ref={filterRef}
      style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 99999 }}
      className="w-56 bg-[#2D2D2D] border border-zinc-700 rounded-xl shadow-xl p-4 flex flex-col gap-4"
    >
      <div>
        <p className="text-xs text-[#FBFAF8]/50 uppercase tracking-wider mb-2">Min Rating</p>
        <div className="flex gap-2">
          {[4, 3].map(rating => (
            <button
              key={rating}
              onClick={() => handleRatingFilter(rating)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filters?.minRating === rating
                  ? 'bg-[#FFE2A0] text-[#1A1A1A]'
                  : 'bg-[#3D3D3D] text-[#FBFAF8] hover:bg-[#4D4D4D]'
              }`}
            >
              {rating}+ ⭐
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#FBFAF8]/50 uppercase tracking-wider mb-2">Sort By</p>
        <button
          onClick={() => handleSortBy('az')}
          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filters?.sortBy === 'az'
              ? 'bg-[#FFE2A0] text-[#1A1A1A]'
              : 'bg-[#3D3D3D] text-[#FBFAF8] hover:bg-[#4D4D4D]'
          }`}
        >
          Name A → Z
        </button>
      </div>

      {isFilterActive && (
        <button
          onClick={handleClearFilters}
          className="w-full py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
      )}
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