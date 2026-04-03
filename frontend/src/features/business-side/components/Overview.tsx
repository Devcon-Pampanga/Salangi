import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EventPostModal from "./PostEventModal";

export default function Overview() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userName, setUserName] = useState("John");

    return(
        <div className="w-full h-full">
            {/*Greetings dpt kung anong name yung pinag regis nila yun ma didisplay specifically first name lng*/}
            <div className = "px-6 py-4">
                <h1 className = "font-['Playfair_Display'] text-white text-3xl font-semibold tracking-wide">
                    Good Morning, <span className = "text-[#FFE2A0]">{userName}</span>
                </h1>

                <p className = "text-white text-sm">Here's what's happening with your listing today.</p>
            </div>

            <div>
                {/*Cards: Profile views, Saved by users, Directions tapped, Review score*/}
                <div className = "flex flex-row gap-3 justify-center px-6 py-4">

                    {/*Profile*/}
                    <div className = "w-full h-full space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-4 py-4">
                        <p className = "text-sm text-[#7a7a7a]">Profile views</p>
                        <p className = "text-white text-3xl font-semibold">1,467</p>

                        <div className = "flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className = "size-4 text-green-500">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                            </svg>
                            <p className = "text-green-500 text-sm">12% this week</p>
                        </div>
                    </div>

                    {/*Saved*/}
                    <div className = "w-full h-full space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-4 py-4">
                        <p className = "text-sm text-[#7a7a7a]">Saved by users</p>
                        <p className = "text-white text-3xl font-semibold">97</p>

                        <div className = "flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className = "size-4 text-green-500">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                            </svg>
                            <p className = "text-green-500 text-sm">4 new today</p>
                        </div>
                    </div>

                    {/*Directions tapped*/}
                    <div className = "w-full h-full space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-4 py-4">
                        <p className = "text-sm text-[#7a7a7a]">Directions tapped</p>
                        <p className = "text-white text-3xl font-semibold">37</p>

                        <div className = "flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className = "size-4 text-green-500">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                            </svg>
                            <p className = "text-green-500 text-sm">+8% vs last week</p>
                        </div>
                    </div>

                    {/*Review scores*/}
                    <div className = "w-full h-full space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-4 py-4">
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

                {/*Quick actions, Post new events*/}
                <div className = "flex flex-row gap-3 justify-center px-6 py-2">
                    {/*Quick actions*/}
                    <div className = "w-full h-full space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-6 py-4">
                        <p className = "text-lg text-[#ffffff]">Quick actions</p>

                        <div className = "space-y-3">
                            <div className = "flex flex-row gap-3">
                                <button 
                                onClick={() => navigate('/listbusiness')}
                                className="flex flex-row items-center gap-4 w-60 h-20 p-1 px-4 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] rounded-xl leading-tight cursor-pointer text-left">
                                    <div className = "p-3 h-13 flex justify-center items-center bg-[#474133] rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" className="size-6 text-white">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                                        </svg>
                                    </div>
                                    
                                    <div>
                                        <p className = "text-[#fdfdfd] text-md tracking-wide">List Business</p>
                                        <p className = "text-[#cecece] text-sm">Add listing</p>
                                    </div>
                                </button>

                                <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex flex-row items-center gap-4 w-60 h-20 p-1 px-4 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] rounded-xl leading-tight cursor-pointer text-left">
                                    <div className = "p-3 h-13 flex justify-center items-center bg-[#474133] rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" className = "size-5 text-white">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                        </svg>

                                    </div>
                                    
                                    <div>
                                        <p className="text-[#fdfdfd] text-md tracking-wide">Post Event</p>
                                        <p className = "text-[#cecece] text-sm">Create a new event</p>
                                    </div>
                                </button>

                                {/* Modal */}
                                <EventPostModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                />
                            </div>

                            <div className = "flex flex-row gap-3">
                                <button className="flex flex-row items-center gap-4 w-60 h-20 p-1 px-4 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] rounded-xl leading-tight cursor-pointer text-left">
                                    <div className = "p-3 h-13 flex justify-center items-center bg-[#474133] rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" className = "size-5 text-white">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                        </svg>

                                    </div>
                                    
                                    <div>
                                        <p className="text-[#fdfdfd] text-md tracking-wide">Add Photos</p>
                                        <p className = "text-[#cecece] text-sm">Update gallery</p>
                                    </div>
                                </button>

                                <button className="flex flex-row items-center gap-4 w-60 h-20 p-1 px-4 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] rounded-xl leading-tight cursor-pointer text-left">
                                    <div className = "p-3 h-13 flex justify-center items-center bg-[#474133] rounded-xl cursor-pointer text-left">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" className = "size-5 text-white">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                        </svg>

                                    </div>
                                    
                                    <div>
                                        <p className="text-[#fdfdfd] text-md tracking-wide">Promotion</p>
                                        <p className = "text-[#cecece] text-sm">Boost visibility</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/*Post new events*/}
                    <div className = "w-full h-full space-y-2 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-6 py-4">
                        <div className = "flex justify-between">
                            <p className = "text-lg text-[#ffffff]">Upcoming events</p>
                            <button 
                            onClick={() => setIsModalOpen(true)}
                            className = "text-[#FFE2A0] cursor-pointer">
                                + Post new
                            </button>
                        </div>

                        <div className = "space-y-2 mt-4">
                            <div className = "flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-14 p-1 bg-[#8d8065] border border-[#FFE2A0] rounded-lg leading-tight">
                                    <p className="text-[#FFE2A0] text-xs uppercase tracking-wide">Apr</p>
                                    <p className="text-[#FFE2A0] text-xl font-bold -mt-1">5</p>
                                </div>

                                <div>
                                    <p className = "text-sm text-[#d8d8d8] font-semibold tracking-wide">Sisig Festival Promo Night</p>
                                    <p className = "text-sm text-[#c9c9c9] tracking-wide">Angeles City 6 PM - 10 PM</p>
                                </div>
                            </div>

                            <div className="w-125 h-px bg-[#4b4b4b]"></div>

                            <div className = "flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-14 p-1 bg-[#8d8065] border border-[#FFE2A0] rounded-lg leading-tight">
                                    <p className="text-[#FFE2A0] text-xs uppercase tracking-wide">Apr</p>
                                    <p className="text-[#FFE2A0] text-xl font-bold -mt-1">5</p>
                                </div>

                                <div>
                                    <p className = "text-sm text-[#d8d8d8] font-semibold tracking-wide">Sisig Festival Promo Night</p>
                                    <p className = "text-sm text-[#c9c9c9] tracking-wide">Angeles City 6 PM - 10 PM</p>
                                </div>
                            </div>

                            <div className="w-125 h-px bg-[#4b4b4b]"></div>

                            <div className = "flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-14 p-1 bg-[#8d8065] border border-[#FFE2A0] rounded-lg leading-tight">
                                    <p className="text-[#FFE2A0] text-xs uppercase tracking-wide">Apr</p>
                                    <p className="text-[#FFE2A0] text-xl font-bold -mt-1">5</p>
                                </div>

                                <div>
                                    <p className = "text-sm text-[#d8d8d8] font-semibold tracking-wide">Sisig Festival Promo Night</p>
                                    <p className = "text-sm text-[#c9c9c9] tracking-wide">Angeles City 6 PM - 10 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*Recent Activity; Dito makikita lahat like kung sino nag mga nag comment, nag bigay stars, etc*/}
                <div className="flex flex-row gap-3 justify-center px-6 py-2">
                    <div className="w-full h-100 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-6 py-4">
                        <div className = "flex justify-between">
                            <p className = "font-semibold text-white tracking-wide">Recent activity</p>
                            <p className = "text-[#FFE2A0] text-sm cursor-pointer">View all</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}