import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EventPostModal from "./PostEventModal";
import { ROUTES } from '../../../routes/paths';

const MyBusiness = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (

        <div>
            <div className = "py-4 px-6 gap-3">
                <div className = "w-285 h-75 flex flex-row bg-[#3a3a3a] rounded-xl px-4 py-4">
                    <div className = "flex flex-col justify-center space-y-3">
                        <button 
                        onClick={() => navigate(ROUTES.BUSINESS_REGISTER)}
                        className = "p-3 w-50 rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left">
                            <div className = "p-3 h-13 flex justify-center items-center bg-[#474133] rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" className="size-6 text-white">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                                </svg>
                            </div>
                            
                            List Business
                        </button>

                        <button 
                        onClick={() => setIsModalOpen(true)}
                        className = "p-3 w-50 rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left">
                            <div className = "p-3 h-13 flex justify-center items-center bg-[#474133] rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" className = "size-5 text-white">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                </svg>
                            </div>
                            
                            Post Event
                        </button>

                        {/* Modal */}
                        <EventPostModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                        />

                        <button className = "p-3 w-50 rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left">
                            <div className = "p-3 h-13 flex justify-center items-center bg-[#474133] rounded-xl cursor-pointer text-left">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" className = "size-5 text-white">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                </svg>

                            </div>
                            
                            Promotion
                        </button>
                    </div>

                    <div className = "px-4 flex flex-row gap-3">
                        <div className = "space-y-3"> 
                            <div className = "w-68 h-32 space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-4 py-4">
                                <p className = "text-sm text-[#7a7a7a]">Profile views</p>
                                <p className = "text-white text-3xl font-semibold">1,467</p>

                                <div className = "flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className = "size-4 text-green-500">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                                    </svg>
                                    <p className = "text-green-500 text-sm">12% this week</p>
                                </div>
                            </div>

                            <div className = "w-68 h-32 space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-4 py-4">
                                <p className = "text-sm text-[#7a7a7a]">Saved by users</p>
                                <p className = "text-white text-3xl font-semibold">97</p>

                                <div className = "flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className = "size-4 text-green-500">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                                    </svg>
                                    <p className = "text-green-500 text-sm">4 new today</p>
                                </div>
                            </div>
                        </div>

                        <div className = "space-y-3">
                            <div className = "w-68 h-32 space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-4 py-4">
                                <p className = "text-sm text-[#7a7a7a]">Directions tapped</p>
                                <p className = "text-white text-3xl font-semibold">37</p>

                                <div className = "flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className = "size-4 text-green-500">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                                    </svg>
                                    <p className = "text-green-500 text-sm">+8% vs last week</p>
                                </div>
                            </div>

                            <div className = "w-68 h-32 space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-4 py-4">
                                <p className = "text-sm text-[#7a7a7a]">Review score</p>
                                <p className = "text-white text-3xl font-semibold">
                                    
                                    4.7
                                </p>

                                <div className = "flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className = "size-4 text-green-500">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                                    </svg>
                                    <p className = "text-green-500 text-sm">+12% this week</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className = "w-80 h-67 space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-4 py-4">
                           
                        </div>
                    </div>
                </div>

                <p className = "text-white py-3">Your Listings</p>

                <div className = "w-90 h-90 bg-[#3a3a3a] rounded-xl px-4"></div>
            </div>
        </div>
    );
}

export default MyBusiness;