import { useState, useMemo, useEffect } from 'react';
import search from '@assets/icons/search-btn-default.svg';

// components
import BusinessCard from '../components/BusinessCard';
import CategoryFilters from '../components/CategoryFilters';
import SearchBar from '../components/SearchBar';

// types - fixed path to match your structure
import { listings, CATEGORIES } from '../../Data/Listings';
import type { Listing, Category } from '../../Data/Listings';

function Savepage() {
    const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES.ALL as Category);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [savedIds, setSavedIds] = useState<number[]>(() => {
        const saved = localStorage.getItem('salangi_saved_spots');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('salangi_saved_spots', JSON.stringify(savedIds));
    }, [savedIds]);

    const toggleSave = (id: number) => {
        setSavedIds(prev => prev.filter(savedId => savedId !== id));
    };

    const filteredSpots = useMemo(() => {
        return listings.filter((spot: Listing) => {
            const isSaved = savedIds.includes(spot.id);
            const matchesCategory = activeCategory === CATEGORIES.ALL || spot.category === activeCategory;
            const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase());
            return isSaved && matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery, savedIds]);

    return (
        <div className="flex h-screen w-full bg-[#1A1A1A] text-[#F8FAF8] overflow-hidden font-sans">
            <main className="flex-1 relative flex flex-col overflow-hidden px-10 pt-10">
                <div className="flex justify-between items-center mb-8 z-10 gap-4">
                    <CategoryFilters 
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                    <SearchBar 
                        glass
                        searchIcon={search}
                        className="w-110 py-3"
                        placeholder="Search your saved spots"
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar z-10">
                    {filteredSpots.length > 0 ? (
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