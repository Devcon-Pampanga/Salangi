import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EventPostModal from "./PostEventModal";

export default function Events(){
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return(
        <div className = "px-4 flex justify-center">
            <div>
                <p className = "text-white py-3 px-3 font-semibold text-lg">Your Events</p>
                <div className = "px-3 flex flex-row gap-4 max-w-290">
                    <div className = "w-285 h-175 bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl flex justify-center items-center">
                        <p className = "text-gray-400 font-normal">No Event Listed</p>
                    </div>
                    
                    <div className = "w-85 h-40 px-4 flex flex-col justify-center py-4 space-y-3 bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl">
                        <button 
                        onClick={() => setIsModalOpen(true)}
                        className = "p-2 w-60 rounded-xl flex flex-row items-center gap-4 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-sm tracking-wide cursor-pointer text-left">
                            <div className = "p-2 h-8 flex justify-center items-center bg-[#474133] rounded-xl">
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

                        <button className = "p-2 w-60 rounded-xl flex flex-row items-center gap-4 bg-[#772222] hover:bg-[#911e1e] border border-[#ff3c3c] text-[#fdfdfd] text-sm tracking-wide cursor-pointer text-left">
                            <div className = "p-2 h-8 flex justify-center items-center bg-[#461414] rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" className = "size-5 text-red-600">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </div>
                            
                            Delete Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}