import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { HiOutlineOfficeBuilding, HiOutlineSpeakerphone } from "react-icons/hi";
import { ROUTES } from '../../../routes/paths';
import BusinessCard from "../../dashboard/components/BusinessCard";
import EditListingModal from "./EditListingModal";
import type { Listing } from "../../Data/Listings";

const MyBusiness = () => {
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);

    const MOCK_LISTING: Listing = {
        id: 101,
        name: "The Grand Bistro",
        location: "Angeles City",
        coordinates: { lat: 15.1441, lng: 120.5887 },
        hours: "10:00 AM - 10:00 PM",
        description: "Experience the finest European cuisine in the heart of the city. A premium dining experience for every occasion.",
        verified: true,
        images: ["https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"],
        category: "Resto"
    };

    const handleEditListing = (listing: Listing) => {
        setEditingListing(listing);
        setIsEditModalOpen(true);
    };

    const handleSaveListing = (updatedListing: Partial<Listing>) => {
        console.log("Saving Listing:", updatedListing);
        // Implementation for saving (Supabase call usually)
        setIsEditModalOpen(false);
        setEditingListing(null);
    };

    return (
        <div>
            <div className = "px-6 py-4">
                <div className="mb-4">
                    <h1 className="font-['Playfair_Display'] text-white text-3xl font-semibold tracking-wide cursor-default">
                        My <span className="text-[#FFE2A0]">Business</span>
                    </h1>
                    <p className="text-white text-sm">Overview and management of your professional presence</p>
                </div>
                <div className = "flex flex-row gap-4 mt-6">
                    <button 
                    onClick={() => navigate(ROUTES.LIST_BUSINESS)}
                    className = "p-3 w-54 h-18 rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95">
                        <div className = "p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl text-white">
                            <HiOutlineOfficeBuilding className="size-6" />
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="font-semibold">List Business</span>
                            <span className="text-xs text-[#FFE2A0] opacity-80">Add your listing</span>
                        </div>
                    </button>

                    <button className = "p-3 w-54 h-18 rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95">
                        <div className = "p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl text-white">
                            <HiOutlineSpeakerphone className="size-6" />
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="font-semibold">Promotion</span>
                            <span className="text-xs text-[#FFE2A0] opacity-80">Boost visibility</span>
                        </div>
                    </button>
                </div>

                <div className = "mt-12 mb-6">
                    <h2 className = "text-[#FFE2A0] text-xl font-['Playfair_Display'] font-semibold">Your Listings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                    <BusinessCard 
                        listing={MOCK_LISTING} 
                        isBusinessSide={true} 
                        isSelected={false}
                        isSaved={false}
                        onSelect={() => {}}
                        onToggleSave={() => {}}
                        onEdit={handleEditListing}
                    />
                </div>
            </div>

            <EditListingModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveListing}
                listing={editingListing}
            />
        </div>
    );
};

export default MyBusiness;