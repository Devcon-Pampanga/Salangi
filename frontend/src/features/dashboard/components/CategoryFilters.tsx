import { useState } from 'react';
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

interface CategoryFiltersProps {
    className?: string;
}

const CategoryFilters = ({ className = "" }: CategoryFiltersProps) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    const categories = [
        { key: 'all', label: 'All', default: grid, hover: gridHover, active: gridActive },
        { key: 'resto', label: 'Resto', default: resto, hover: restoHover, active: restoActive },
        { key: 'cafe', label: 'Cafe', default: cafe, hover: cafeHover, active: cafeActive },
        { key: 'activities', label: 'Activities', default: activities, hover: activitiesHover, active: activitiesActive },
    ];

    return (
        <div className={`flex gap-4 ${className}`}>
            {categories.map((cat) => {
                const isActive = activeCategory === cat.key;
                const isHovered = hoveredCategory === cat.key;
                
                // Determine icon based on state priority: active > hover > default
                let currentIcon = cat.default;
                if (isActive) currentIcon = cat.active;
                else if (isHovered) currentIcon = cat.hover;

                return (
                    <button
                        key={cat.key}
                        onMouseEnter={() => setHoveredCategory(cat.key)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`flex items-center cursor-pointer gap-2 p-2.5 px-5 rounded-lg border transition-all duration-200 
                            ${isActive 
                                ? 'bg-[#FFE2A0] text-[#222222] border-[#FFE2A0]' 
                                : 'bg-[#373737] text-white border-transparent hover:text-[#FFE2A0] hover:border-[#FFE2A0]'
                            }`}
                    >
                        <img src={currentIcon} alt={cat.label.toLowerCase()} className="w-5 h-5" />
                        <p className="font-semibold text-sm">{cat.label}</p>
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryFilters;
