import { useState } from 'react';
import { CATEGORIES } from '../../Data/Listings';
import type { Category } from '../../Data/Listings';

import grid from '@assets/icons/all-btn-default.svg';
import gridHover from '@assets/icons/all-btn-hover.svg';
import gridActive from '@assets/icons/all-btn-active.svg';
import resto from '@assets/icons/resto-btn-default.svg';
import restoHover from '@assets/icons/resto-btn-hover.svg';
import restoActive from '@assets/icons/resto-btn-active.svg';
import cafe from '@assets/icons/cafe-btn-default.svg';
import cafeHover from '@assets/icons/cafe-btn-hover.svg';
import cafeActive from '@assets/icons/cafe-btn-active.svg';
import activities from '@assets/icons/act-btn-default.svg';
import activitiesHover from '@assets/icons/act-btn-hover.svg';
import activitiesActive from '@assets/icons/act-btn-active.svg';

import { IoFastFood, IoStorefront, IoBowlingBallSharp } from "react-icons/io5";
import { FaConciergeBell, FaHotel, FaHandHoldingHeart } from "react-icons/fa";

interface CategoryFiltersProps {
    className?: string;
    activeCategory: Category;
    onCategoryChange: (category: Category) => void;
}

const CategoryFilters = ({ className = "", activeCategory, onCategoryChange }: CategoryFiltersProps) => {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    const categories = [
        { key: CATEGORIES.ALL as Category, label: 'All', default: grid, hover: gridHover, active: gridActive, isSvg: true },
        { key: CATEGORIES.FOOD as Category, label: 'Food & Drinks', icon: IoFastFood },
        { key: CATEGORIES.SHOPS as Category, label: 'Shops', icon: IoStorefront },
        { key: CATEGORIES.ACTIVITIES as Category, label: 'Activities', icon: IoBowlingBallSharp },
        { key: CATEGORIES.SERVICES as Category, label: 'Services', icon: FaConciergeBell },
        { key: CATEGORIES.STAY as Category, label: 'Stay', icon: FaHotel },
        { key: CATEGORIES.COMMUNITY as Category, label: 'Community', icon: FaHandHoldingHeart },
    ];

    return (
        <div className={`flex flex-wrap gap-2 md:gap-2.5 ${className}`}>
            {categories.map((cat) => {
                const isActive = activeCategory === cat.key;
                const isHovered = hoveredCategory === cat.key;
                const Icon = cat.icon;
                
                // Determine icon based on state priority: active > hover > default
                let currentIcon = cat.default;
                if (isActive) currentIcon = cat.active;
                else if (isHovered) currentIcon = cat.hover;

                return (
                    <button
                        key={cat.key}
                        onMouseEnter={() => setHoveredCategory(cat.key)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        onClick={() => onCategoryChange(cat.key)}
                        className={`flex items-center cursor-pointer gap-2 p-1.5 px-3 md:px-4 rounded-lg border transition-all duration-200 
                            ${isActive 
                                ? 'bg-[#FFE2A0] text-[#222222] border-[#FFE2A0] shadow-md scale-[1.02]' 
                                : 'bg-[#373737]/80 text-[#FBFAF8]/60 border-zinc-700/50 hover:text-[#FFE2A0] hover:border-[#FFE2A0]/50 hover:bg-[#373737]'
                            }`}
                    >
                        {cat.isSvg ? (
                            <img src={currentIcon} alt={cat.label.toLowerCase()} className="w-4 h-4 md:w-5 md:h-5" />
                        ) : (
                            Icon && <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-[#222222]' : ''}`} />
                        )}
                        <p className="font-bold text-[11px] md:text-xs whitespace-nowrap tracking-wide">{cat.label}</p>
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryFilters;
