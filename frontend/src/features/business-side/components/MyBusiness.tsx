import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { HiOutlineOfficeBuilding, HiOutlineSpeakerphone } from "react-icons/hi";
import { ROUTES } from '../../../routes/paths';
import BusinessCard from "../../dashboard/components/BusinessCard";
import EditListingModal from "./EditListingModal";
import type { Listing } from "../../Data/Listings";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../hooks/useAuth"; 

const MyBusiness = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    // ─── Fetch user's listings ────────────────────────────────────────────────
    const fetchListings = async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
            .from("listings")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (fetchError) {
            setError("Failed to load your listings. Please try again.");
            console.error(fetchError);
        } else {
            // Map Supabase row shape → Listing type
            const mapped: Listing[] = (data ?? []).map((row: any) => ({
                id: row.id,
                name: row.name,
                location: row.location,
                coordinates: { lat: Number(row.lat), lng: Number(row.lng) },
                hours: row.hours,
                description: row.description,
                verified: row.verified,
                images: row.images ?? [],
                category: row.category,
                phone: row.phone,
                email: row.email,
                facebook: row.facebook,
                website: row.website,
            }));
            setListings(mapped);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchListings();
    }, [user?.id]);

    // ─── Edit ─────────────────────────────────────────────────────────────────
    const handleEditListing = (listing: Listing) => {
        setEditingListing(listing);
        setIsEditModalOpen(true);
    };

    const handleSaveListing = async (updatedListing: Partial<Listing>) => {
        if (!editingListing) return;

        const { error: updateError } = await supabase
            .from("listings")
            .update({
                name: updatedListing.name,
                location: updatedListing.location,
                lat: updatedListing.coordinates?.lat,
                lng: updatedListing.coordinates?.lng,
                hours: updatedListing.hours,
                description: updatedListing.description,
                images: updatedListing.images,
                category: updatedListing.category,
                phone: updatedListing.phone,
                email: updatedListing.email,
                facebook: updatedListing.facebook,
                website: updatedListing.website,
            })
            .eq("id", editingListing.id);

        if (updateError) {
            console.error("Failed to save listing:", updateError);
            // You can surface this to the user via a toast/snackbar
        } else {
            // Optimistically update local state
            setListings((prev) =>
                prev.map((l) =>
                    l.id === editingListing.id ? { ...l, ...updatedListing } : l
                )
            );
        }

        setIsEditModalOpen(false);
        setEditingListing(null);
    };

    // ─── Delete ───────────────────────────────────────────────────────────────
    const handleDeleteListing = async (id: number) => {
        setDeletingId(id);

        const { error: deleteError } = await supabase
            .from("listings")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.error("Failed to delete listing:", deleteError);
        } else {
            setListings((prev) => prev.filter((l) => l.id !== id));
        }

        setDeletingId(null);
        setConfirmDeleteId(null);
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div>
            <div className="px-4 md:px-6 py-4">
                <div className="mb-4">
                    <h1 className="font-['Playfair_Display'] text-white text-2xl md:text-3xl font-semibold tracking-wide cursor-default">
                        My <span className="text-[#FFE2A0]">Business</span>
                    </h1>
                    <p className="text-white text-sm">Overview and management of your professional presence</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button
                        onClick={() => navigate(ROUTES.LIST_BUSINESS)}
                        className="p-3 w-54 h-18 rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95"
                    >
                        <div className="p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl text-white">
                            <HiOutlineOfficeBuilding className="size-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold">List Business</span>
                            <span className="text-xs text-[#FFE2A0] opacity-80">Add your listing</span>
                        </div>
                    </button>

                    <button className="p-3 w-54 h-18 rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95">
                        <div className="p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl text-white">
                            <HiOutlineSpeakerphone className="size-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold">Promotion</span>
                            <span className="text-xs text-[#FFE2A0] opacity-80">Boost visibility</span>
                        </div>
                    </button>
                </div>

                <div className="mt-12 mb-6">
                    <h2 className="text-[#FFE2A0] text-xl font-['Playfair_Display'] font-semibold">Your Listings</h2>
                </div>

                {/* States */}
                {loading && (
                    <div className="flex items-center justify-center h-48 text-[#a0a0a0]">
                        <svg className="animate-spin h-6 w-6 mr-3 text-[#FFE2A0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Loading your listings...
                    </div>
                )}

                {!loading && error && (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            onClick={fetchListings}
                            className="px-4 py-2 bg-[#5a5241] border border-[#FFE2A0] text-[#FFE2A0] text-sm rounded-lg hover:bg-[#857657] transition-all"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && listings.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
                        <div className="bg-[#474133] p-4 rounded-full border border-[#5a5241]">
                            <HiOutlineOfficeBuilding className="size-8 text-[#FFE2A0]" />
                        </div>
                        <p className="text-white font-semibold">No listings yet</p>
                        <p className="text-[#a0a0a0] text-sm">Click "List Business" to add your first listing.</p>
                    </div>
                )}

                {!loading && !error && listings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                        {listings.map((listing) => (
                            <div key={listing.id} className="relative">
                                <BusinessCard
                                    listing={listing}
                                    isBusinessSide={true}
                                    isSelected={false}
                                    isSaved={false}
                                    onSelect={() => {}}
                                    onToggleSave={() => {}}
                                    onEdit={handleEditListing}
                                />

                                {/* Delete confirmation overlay */}
                                {confirmDeleteId === listing.id && (
                                    <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center gap-4 z-20 p-6">
                                        <p className="text-white text-sm text-center font-semibold">
                                            Delete "{listing.name}"? This cannot be undone.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setConfirmDeleteId(null)}
                                                className="px-4 py-2 rounded-lg bg-[#5a5241] border border-[#FFE2A0] text-white text-sm hover:bg-[#857657] transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleDeleteListing(listing.id)}
                                                disabled={deletingId === listing.id}
                                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-all disabled:opacity-50"
                                            >
                                                {deletingId === listing.id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Delete trigger button (replaces the red trash icon that was hardcoded) */}
                                {confirmDeleteId !== listing.id && (
                                    <button
                                        onClick={() => setConfirmDeleteId(listing.id)}
                                        className="absolute top-3 right-3 z-20 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-all shadow-lg"
                                        title="Delete listing"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <EditListingModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingListing(null);
                }}
                onSave={handleSaveListing}
                listing={editingListing}
            />
        </div>
    );
};

export default MyBusiness;