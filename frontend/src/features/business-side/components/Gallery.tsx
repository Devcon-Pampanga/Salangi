/*
    This page is for adding images on the business side.
    It will display all the images of the business and allow the user to add new images.
    If the an image was added here, it should display dun as business card on the customer side.
*/

import { useState, useRef } from "react";
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePhotograph } from "react-icons/hi";

const MOCK_BUSINESSES = ["The Grand Bistro", "Lakeside Coffee", "Sunset Lounge"];

interface GalleryImage {
    id: string;
    url: string;
    alt: string;
    addedDate: string;
    businessName: string;
}

const Gallery = () => {
    const [images, setImages] = useState<GalleryImage[]>([
        { id: '1', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800', alt: 'Cocktail', addedDate: 'Apr 02, 2026', businessName: 'The Grand Bistro' },
        { id: '2', url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800', alt: 'Dessert', addedDate: 'Apr 03, 2026', businessName: 'Lakeside Coffee' },
        { id: '3', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800', alt: 'Coffee', addedDate: 'Apr 04, 2026', businessName: 'Lakeside Coffee' },
        { id: '4', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800', alt: 'Dinner', addedDate: 'Apr 05, 2026', businessName: 'The Grand Bistro' }
    ]);
    
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [isAddingPhoto, setIsAddingPhoto] = useState(false);
    const [selectedBusinessForUpload, setSelectedBusinessForUpload] = useState(MOCK_BUSINESSES[0]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            
            const newImage: GalleryImage = {
                id: Date.now().toString(),
                url: URL.createObjectURL(file),
                alt: file.name,
                addedDate: formattedDate,
                businessName: selectedBusinessForUpload
            };
            setImages(prev => [newImage, ...prev]);
            setIsAddingPhoto(false);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const filteredImages = activeFilter === "All" 
        ? images 
        : images.filter(img => img.businessName === activeFilter);

    return (
        <div className="w-full h-full pb-10">
            {/* Header */}
            <div className="px-4 md:px-6 py-4">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-0">
                    <div className="mb-2">
                        <h1 className="font-['Playfair_Display'] text-white text-2xl md:text-3xl font-semibold tracking-wide cursor-default">
                            Business <span className="text-[#FFE2A0]">Gallery</span>
                        </h1>
                        <p className="text-white text-sm">Organize your visuals by business branch</p>
                    </div>

                    {/* Business Filter Bar - Responsive Stacking */}
                    <div className="flex flex-row overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 gap-2 bg-[#3a3a3a] p-1.5 rounded-xl border border-[#4d4d4d] w-full lg:w-fit scrollbar-hide">
                        {["All", ...MOCK_BUSINESSES].map((business) => (
                            <button
                                key={business}
                                onClick={() => setActiveFilter(business)}
                                className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                                    activeFilter === business 
                                        ? 'bg-[#FFE2A0] text-[#1a1a1a] shadow-md scale-105' 
                                        : 'text-white hover:bg-white/5'
                                }`}
                            >
                                {business}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    {/* Add Photo Button - Exactly like MyBusiness buttons */}
                    <button 
                        onClick={() => setIsAddingPhoto(true)}
                        className="p-3 w-54 h-18 rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95 group"
                    >
                        <div className="p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl group-hover:scale-105 transition-transform shrink-0">
                            <HiOutlinePlus className="size-6 text-white text-bold" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">Add Photos</span>
                            <span className="text-[#FFE2A0] text-[10px] opacity-80">Update gallery</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="px-4 md:px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Image Collection */}
                    {filteredImages.map((image) => (
                        <div 
                            key={image.id}
                            onClick={() => setSelectedImage(image)}
                            className="group relative aspect-square bg-[#3a3a3a] border border-[#4d4d4d] rounded-2xl overflow-hidden shadow-lg hover:border-[#FFE2A0]/40 transition-all cursor-zoom-in animate-in fade-in zoom-in-95 duration-500"
                        >
                            <img 
                                src={image.url} 
                                alt={image.alt} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex gap-2 translate-y-[-10px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button 
                                    onClick={(e) => handleDelete(e, image.id)}
                                    className="p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-colors shadow-lg cursor-pointer"
                                    title="Delete Photo"
                                >
                                    <HiOutlineTrash className="size-5" />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="absolute bottom-4 left-4 right-4 translate-y-[20px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 text-left">
                                <p className="text-white text-[10px] uppercase tracking-widest font-bold mb-1 opacity-60">{image.businessName}</p>
                                <p className="text-[#FFE2A0] text-[10px] font-medium opacity-90">Added on {image.addedDate}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredImages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="bg-[#474133] p-6 rounded-full border border-[#5a5241]">
                            <HiOutlinePhotograph className="size-12 text-[#FFE2A0] opacity-20" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white text-lg font-semibold font-['Playfair_Display'] tracking-wide">Category is Empty</h3>
                            <p className="text-[#a0a0a0] text-sm max-w-xs mx-auto">
                                No images found for <span className="text-[#FFE2A0]">{activeFilter}</span>.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Photo Configuration Modal */}
            {isAddingPhoto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="space-y-1 text-center">
                            <h3 className="text-white text-2xl font-['Playfair_Display'] font-semibold tracking-wide">Add New Image</h3>
                            <p className="text-[#a0a0a0] text-sm">Select which business this photo represents</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[#FFE2A0] text-xs font-bold uppercase tracking-widest px-1">Select Business</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {MOCK_BUSINESSES.map((business) => (
                                        <button
                                            key={business}
                                            onClick={() => setSelectedBusinessForUpload(business)}
                                            className={`w-full p-4 rounded-xl text-left transition-all border ${
                                                selectedBusinessForUpload === business 
                                                    ? 'bg-[#474133] border-[#FFE2A0] text-white shadow-inner' 
                                                    : 'bg-[#333333] border-[#444444] text-[#a0a0a0] hover:bg-[#3a3a3a]'
                                            }`}
                                        >
                                            {business}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-4 bg-[#FFE2A0] text-[#1a1a1a] rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg cursor-pointer"
                            >
                                Select Image from Device
                            </button>
                            
                            <button 
                                onClick={() => setIsAddingPhoto(false)}
                                className="w-full py-2 text-[#a0a0a0] hover:text-white transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-300 animate-in fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-10"
                        onClick={() => setSelectedImage(null)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    
                    <div 
                        className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <img 
                            src={selectedImage.url} 
                            alt={selectedImage.alt} 
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        />
                        
                        <div className="text-center space-y-1">
                            <p className="text-white text-xs uppercase tracking-[0.2em] font-bold opacity-60">
                                {selectedImage.businessName}
                            </p>
                            <p className="text-[#FFE2A0] text-sm opacity-90 uppercase tracking-widest font-medium">
                                Added on {selectedImage.addedDate}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
