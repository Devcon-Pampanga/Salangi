//icons
import grid from '@assets/png-files/grid.png'
import resto from '@assets/png-files/resto.png'
import cafe from '@assets/png-files/cafe.png'
import activities from '@assets/png-files/activities.png'
import search from '@assets/png-files/search.png'
import settings from '@assets/png-files/Settings.png'

//image
import sampleimage from '@assets/png-files/imagesample.png'

//components
import SpotCard from '../components/SpotCard';

const SAVED_SPOTS = [
    {
        id: 1,
        title: "Holy Rosary Parish Church",
        location: "Angeles City, Pampanga",
        hours: "8:00 am - 10:00 pm (Mon-Fri)",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.",
        images: [sampleimage, sampleimage],
        isVerified: true
    },
    {
        id: 2,
        title: "Holy Rosary Parish Church",
        location: "Angeles City, Pampanga",
        hours: "8:00 am - 10:00 pm (Mon-Fri)",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.",
        images: [sampleimage, sampleimage],
        isVerified: true
    },
    {
        id: 3,
        title: "Holy Rosary Parish Church",
        location: "Angeles City, Pampanga",
        hours: "8:00 am - 10:00 pm (Mon-Fri)",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.",
        images: [sampleimage, sampleimage],
        isVerified: true
    },
    {
        id: 4,
        title: "Holy Rosary Parish Church",
        location: "Angeles City, Pampanga",
        hours: "8:00 am - 10:00 pm (Mon-Fri)",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.",
        images: [sampleimage, sampleimage],
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
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-1 gap-y-8 pb-20 w-270 ml-22">
                        {SAVED_SPOTS.map((spot) => (
                            <SpotCard 
                                key={spot.id}
                                title={spot.title}
                                location={spot.location}
                                hours={spot.hours}
                                description={spot.description}
                                images={spot.images}
                                isVerified={spot.isVerified}
                                initialSaved={true}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Savepage;
