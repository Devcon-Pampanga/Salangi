//icons
import locBtn from '@assets/png-files/locBtn.png';
import locBtnSelected from '@assets/png-files/locBtnSelected.png';
import verified from '@assets/png-files/verified.png';
import grid from '@assets/png-files/grid.png'
import resto from '@assets/png-files/resto.png'
import cafe from '@assets/png-files/cafe.png'
import activities from '@assets/png-files/activities.png'
import heart from '@assets/png-files/heart.png'
import search from '@assets/png-files/search.png'
import settings from '@assets/png-files/Settings.png'
import time from '@assets/png-files/time.png'

//image
import sampleimage from '@assets/png-files/imagesample.png'

const SAVED_SPOTS = [
    {
        id: 1,
        title: "Holy Rosary Parish Church",
        location: "Angeles City, Pampanga",
        hours: "8:00 am - 10:00 pm (Mon-Fri)",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.",
        image: sampleimage,
        isVerified: true
    },
    {
        id: 2,
        title: "Holy Rosary Parish Church",
        location: "Angeles City, Pampanga",
        hours: "8:00 am - 10:00 pm (Mon-Fri)",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.",
        image: sampleimage,
        isVerified: true
    },
    {
        id: 3,
        title: "Holy Rosary Parish Church",
        location: "Angeles City, Pampanga",
        hours: "8:00 am - 10:00 pm (Mon-Fri)",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.",
        image: sampleimage,
        isVerified: true
    },
    {
        id: 4,
        title: "Holy Rosary Parish Church",
        location: "Angeles City, Pampanga",
        hours: "8:00 am - 10:00 pm (Mon-Fri)",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.",
        image: sampleimage,
        isVerified: true
    }
];

function Savepage() {
    return (
        <div className="flex h-screen w-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden font-sans">
            {/*This is for the scroll bar in the cards section to make the scroll bar dissapear*/}
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
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 p-2.5 px-5 bg-[#373737] rounded-xl border border-zinc-700/30 cursor-pointer">
                            <img src={grid} className="w-4" alt="all" />
                            <span className="text-sm font-medium">All</span>
                        </button>
                        <button className="flex items-center gap-2 p-2.5 px-5 bg-[#373737] rounded-xl border border-zinc-700/30 cursor-pointer">
                            <img src={resto} className="w-4" alt="resto" />
                            <span className="text-sm font-medium">Resto</span>
                        </button>
                        <button className="flex items-center gap-2 p-2.5 px-5 bg-[#373737] rounded-xl border border-zinc-700/30 cursor-pointer">
                            <img src={cafe} className="w-4" alt="cafe" />
                            <span className="text-sm font-medium">Cafe</span>
                        </button>
                        <button className="flex items-center gap-2 p-2.5 px-5 bg-[#373737] rounded-xl border border-zinc-700/30 cursor-pointer">
                            <img src={activities} className="w-4" alt="activities" />
                            <span className="text-sm font-medium">Activities</span>
                        </button>
                    </div>

                    <div className="flex items-center w-full max-w-md px-4 py-3 bg-[#2D2D2D]/60 backdrop-blur-md rounded-xl border border-zinc-700/50">
                        <img src={search} className="w-4 opacity-40" alt="search" />
                        <input
                            type="text"
                            placeholder="Explore local spots"
                            className="flex-1 px-3 bg-transparent text-gray-200 placeholder-zinc-500 outline-none text-sm"
                        />
                        <img src={settings} className="w-4 cursor-pointer opacity-40" alt="settings" />
                    </div>
                </div>

                {/*For the cards*/}
                <div className="flex-1 overflow-y-auto no-scrollbar z-10">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20 w-270 ml-22">
                        {SAVED_SPOTS.map((spot) => (
                            <div key={spot.id} className="bg-[#2A2A2A] rounded-3xl overflow-hidden border border-zinc-800 transition-all duration-300">
                                <div className="p-6 ">
                                    <div className="relative overflow-hidden rounded-2xl mb-6">
                                        <div className="absolute top-4 left-4 z-20">
                                            <button className="w-11 h-11 bg-[#1A1A1A]/70 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer">
                                                <img src={heart} className="w-5" alt="favorite" />
                                            </button>
                                        </div>
                                        <img src={spot.image} className="w-full h-72 object-cover" alt={spot.title} />
                                        
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                            <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                            <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                            <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <img src={locBtnSelected} className="w-3 opacity-60" alt="loc" />
                                                <p className="text-zinc-500 text-md">{spot.location}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <img src={time} className="w-3 opacity-60" alt="time" />
                                                <p className="text-zinc-500 text-md">{spot.hours}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <h2 className="text-white font-semibold text-2xl tracking-tight">{spot.title}</h2>
                                            {spot.isVerified && <img src={verified} className="w-4" alt="verified" />}
                                        </div>

                                        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
                                            {spot.description} <span className="text-[#FFE2A0] cursor-pointer">See more.</span>
                                        </p>

                                        <div className="flex justify-end pt-2">
                                            <button className="flex items-center gap-2 px-6 py-3 bg-[#FFE2A0] rounded-xl cursor-pointer shadow-lg shadow-black/20">
                                                <img src={locBtn} className="w-3" alt="shop" />
                                                <span className="text-[#1A1A1A] text-sm">Shop in maps</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </main>
        </div>
    );
}

export default Savepage;