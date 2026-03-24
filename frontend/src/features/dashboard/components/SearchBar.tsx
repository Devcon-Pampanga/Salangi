import { useState } from 'react';
import searchIconDefault from '@assets/icons/search-btn-default.svg';
import searchIconHover from '@assets/icons/search-btn-hover.svg';
import filterIconDefault from '@assets/icons/filter-btn-default.svg';
import filterIconHover from '@assets/icons/filter-btn-hover.svg';

interface SearchBarProps {
    searchIcon?: string;
    placeholder?: string;
    className?: string;
    containerClassName?: string;
    glass?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar = ({ 
    searchIcon, 
    placeholder = "Explore local spots",
    className = "",
    containerClassName = "",
    glass = false,
    value,
    onChange
}: SearchBarProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Determine which icons to show based on state
    // If a custom searchIcon is provided, only use it. If not, use the default/hover pair.
    const currentSearchIcon = isHovered && !searchIcon ? searchIconHover : (searchIcon || searchIconDefault);
    const currentFilterIcon = isHovered ? filterIconHover : filterIconDefault;

    return (
        <div className={containerClassName}>
            <div 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`flex items-center px-4 py-2 border transition-all duration-200 ${glass 
                    ? 'bg-[#2D2D2D]/60 backdrop-blur-md rounded-xl' 
                    : 'bg-[#2D2D2D] rounded-lg'
                } ${ (isHovered || isFocused) ? 'border-[#FFE2A0]' : 'border-zinc-700/50' } ${className}`}
            >
                <img src={currentSearchIcon} className="cursor-pointer" alt="search"/>
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
                <img src={currentFilterIcon} width="16" className="cursor-pointer transition-opacity" alt="filter"/>
            </div>
        </div>
    );
};

export default SearchBar;
