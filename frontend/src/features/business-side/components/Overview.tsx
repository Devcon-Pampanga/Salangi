import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ROUTES } from '../../../routes/paths';
import EventPostModal from "./PostEventModal";
import StatsCard from "./StatsCard";

export default function Overview() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userName, setUserName] = useState("John");
    const [events, setEvents] = useState([
        { month: 'Apr', day: '5', title: 'Sisig Festival Promo Night', location: 'Angeles City 6 PM - 10 PM' },
        { month: 'Apr', day: '5', title: 'Sisig Festival Promo Night', location: 'Angeles City 6 PM - 10 PM' },
        { month: 'Apr', day: '5', title: 'Sisig Festival Promo Night', location: 'Angeles City 6 PM - 10 PM' }
    ]);

    const handleAddEvent = (newEvent: any) => {
        setEvents(prev => [newEvent, ...prev]);
    };

    return(
        <div className="w-full h-full pb-10">
            {/*Greetings dpt kung anong name yung pinag regis nila yun ma didisplay specifically first name lng*/}
            <div className = "px-6 py-4">
                <h1 className = "font-['Playfair_Display'] text-white text-3xl font-semibold tracking-wide">
                    Good Morning, <span className = "text-[#FFE2A0]">{userName}</span>
                </h1>

                <p className = "text-white text-sm">Here's what's happening with your listing today.</p>
            </div>

            {/*Cards: Profile views, Saved by users, Directions tapped, Review score*/}
            <div className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-6 py-4">
                <StatsCard 
                    title="Profile views" 
                    value="1,467" 
                    trend="+12% this week" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-[#FFE2A0]"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>}
                />
                <StatsCard 
                    title="Saved by users" 
                    value="97" 
                    trend="+4 new today" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-[#FFE2A0]"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>}
                />
                <StatsCard 
                    title="Directions tapped" 
                    value="37" 
                    trend="+8% vs last week" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-[#FFE2A0]"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>}
                />
                <StatsCard 
                    title="Review score" 
                    value="4.7" 
                    trend="+12% this week" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-[#FFE2A0]"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>}
                />
            </div>

            {/*Quick actions, Post new events*/}
            <div className = "flex flex-col lg:flex-row items-start gap-4 px-6 py-2">
                {/*Quick actions*/}
                <div className = "flex-1 space-y-4 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-6 py-4 pb-6">
                    <p className = "text-lg text-[#ffffff] mb-4">Quick actions</p>

                    <div className = "grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <button 
                        onClick={() => navigate(ROUTES.LIST_BUSINESS)}
                        className="p-3 w-full rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95">
                            <div className = "p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-white text-bold">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                                </svg>
                            </div>
                            
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-semibold text-sm md:text-md truncate">List Business</span>
                                <span className="text-[10px] md:text-xs text-[#FFE2A0] opacity-80 truncate">Add your listing</span>
                            </div>
                        </button>

                        <button 
                        onClick={() => setIsModalOpen(true)}
                        className="p-3 w-full rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95">
                            <div className = "p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className = "size-6 text-white text-bold">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                </svg>
                            </div>
                            
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-semibold text-sm md:text-md truncate">Post Event</span>
                                <span className="text-[10px] md:text-xs text-[#FFE2A0] opacity-80 truncate">Create a new event</span>
                            </div>
                        </button>

                        <button 
                        onClick={() => navigate(ROUTES.DASHBOARD_GALLERY)}
                        className="p-3 w-full rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95">
                            <div className = "p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className = "size-6 text-white text-bold">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                </svg>
                            </div>
                            
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-semibold text-sm md:text-md truncate">Add Photos</span>
                                <span className="text-[10px] md:text-xs text-[#FFE2A0] opacity-80 truncate">Update gallery</span>
                            </div>
                        </button>

                        <button className="p-3 w-full rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95">
                            <div className = "p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl cursor-pointer text-left">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className = "size-6 text-white text-bold">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                </svg>
                            </div>
                            
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-semibold text-sm md:text-md truncate">Promotion</span>
                                <span className="text-[10px] md:text-xs text-[#FFE2A0] opacity-80 truncate">Boost visibility</span>
                            </div>
                        </button>

                        {/* Modal */}
                        <EventPostModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onAddEvent={handleAddEvent}
                        />
                    </div>
                </div>

                {/*Post new events*/}
                <div className = "flex-1 space-y-4 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-6 py-4">
                    <div className = "flex justify-between">
                        <p className = "text-lg text-[#ffffff]">Upcoming events</p>
                        <button 
                        onClick={() => setIsModalOpen(true)}
                        className = "text-[#FFE2A0] cursor-pointer">
                            + Post new
                        </button>
                    </div>

                    <div className = "space-y-4 mt-4">
                        {events.map((event, idx, arr) => (
                            <div key={idx} className="space-y-4">
                                <div className = "flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center min-w-14 w-14 p-1 bg-[#8d8065] border border-[#FFE2A0] rounded-lg leading-tight">
                                        <p className="text-[#474133] text-xs uppercase tracking-wide">{event.month}</p>
                                        <p className="text-[#474133] text-xl font-bold -mt-1">{event.day}</p>
                                    </div>

                                    <div>
                                        <p className = "text-sm text-[#d8d8d8] font-semibold tracking-wide">{event.title}</p>
                                        <p className = "text-sm text-[#c9c9c9] tracking-wide">{event.location}</p>
                                    </div>
                                </div>
                                {idx < arr.length - 1 && <div className="w-full h-px bg-[#4b4b4b]" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/*Recent Activity; Dito makikita lahat like kung sino nag mga nag comment, nag bigay stars, etc*/}
            <div className="flex flex-col lg:flex-row gap-3 justify-center px-6 py-2">
                <div className="w-full h-100 bg-[#3a3a3a] rounded-xl border border-[#4d4d4d] px-6 py-4 mb-4">
                    <div className = "flex justify-between">
                        <p className = "font-semibold text-white tracking-wide">Recent activity</p>
                        <p className = "text-[#FFE2A0] text-sm cursor-pointer">View all</p>
                    </div>

                    {/* Recent Activity Empty State */}
                    <div className="flex flex-col items-center justify-center h-[calc(100%-40px)] py-10 text-center space-y-4">
                        <div className="bg-[#474133] p-4 rounded-full border border-[#5a5241] shadow-inner transition-transform hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="size-10 text-[#FFE2A0]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white text-lg font-semibold font-['Playfair_Display'] tracking-wide">No Activity Yet</h3>
                            <p className="text-[#a0a0a0] text-sm font-light max-w-xs mx-auto leading-relaxed">
                                Your recent interactions and notifications will appear here as they happen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}