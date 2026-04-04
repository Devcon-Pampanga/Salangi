import { useNavigate } from "react-router-dom";
import { useState } from "react";
// import EventPostModal from "./PostEventModal"; // Removed as requested
import { ROUTES } from '../../../routes/paths';

const MyBusiness = () => {
    const navigate = useNavigate();
    // const [isModalOpen, setIsModalOpen] = useState(false); // Removed as requested

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
                        <div className = "p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-white text-bold">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                            </svg>
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="font-semibold">List Business</span>
                            <span className="text-xs text-[#FFE2A0] opacity-80">Add your listing</span>
                        </div>
                    </button>

                    <button className = "p-3 w-54 h-18 rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95">
                        <div className = "p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className = "size-6 text-white text-bold">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                            </svg>
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

                <div className = "flex flex-col items-center justify-center text-center px-4 py-16 mt-4 space-y-4">
                    <div className="bg-[#474133] p-4 rounded-full border border-[#5a5241] shadow-inner transition-transform hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" className="size-10 text-[#FFE2A0]">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-white text-xl font-semibold tracking-wide font-['Playfair_Display']">No Listings Yet</h3>
                        <p className="text-[#a0a0a0] text-sm font-light max-w-xs mx-auto leading-relaxed">
                            Your journey on Salangi starts here. Create your first business listing to get discovered.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyBusiness;