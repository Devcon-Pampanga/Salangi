import { useState, useMemo } from 'react';
import search from '@assets/icons/search-btn-default.svg';

// components
import BusinessCard from '../components/BusinessCard';
import CategoryFilters from '../components/CategoryFilters';
import SearchBar from '../components/SearchBar';

// types
import { listings, CATEGORIES } from '../../Data/Listings';
import type { Listing, Category } from '../../Data/Listings';

function Savepage() {
    const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES.ALL as Category);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSpots = useMemo(() => {
        return listings.filter((spot: Listing) => {
            const matchesCategory = activeCategory === CATEGORIES.ALL || spot.category === activeCategory;
            const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    return (
        <div className="flex h-screen w-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden font-sans">
            <style>
                {`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>

            <main className="flex-1 relative flex flex-col overflow-hidden px-10 pt-10">
                <div className="absolute top-0 left-0 w-150 h-150 -translate-x-1/2 -translate-y-1/2 bg-[#FFE2A0]/10 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Navigation/Search Bar*/}
                <div className="flex justify-between items-center mb-8 z-10 gap-4">
                    <CategoryFilters 
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        className="z-10" 
                    />

                    <SearchBar 
                        glass 
                        searchIcon={search} 
                        className="w-110 py-3" 
                        placeholder="Explore local spots"
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/*For the cards*/}
                <div className="flex-1 overflow-y-auto no-scrollbar z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20 max-w-5xl mx-auto">
                        {filteredSpots.map((listing) => (
                            <BusinessCard 
                                key={listing.id}
                                listing={listing}
                                onSelect={() => {}} 
                                isSelected={false}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Savepage;
