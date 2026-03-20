import search from '@assets/png-files/search.png';
import settings from '@assets/png-files/Settings.png';
import sampleimage from '@assets/png-files/imagesample.png';
import bg from '@assets/images/bg.png';

//components
import SpotDetailCard from '../components/SpotDetailCard';

const SPOT_DETAIL = {
    title: "Holy Rosary Parish Church",
    location: "Angeles City, Pampanga",
    hours: "8:00 am - 10:00 pm (Mon-Fri)",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
    images: [sampleimage, bg, sampleimage],
    phone: "+63 976 355 7152",
    email: "hrpc@email.com",
    facebook: "facebook.com/hrpacofficial/",
    website: "www.hrpc.com",
    rating: 4.8,
    reviewsCount: 25,
    isVerified: true,
    reviews: [
        {
            id: 1,
            user: "Jane Doe",
            initials: "JD",
            date: "March 03, 2026",
            rating: 5,
            comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        },
        {
            id: 2,
            user: "John Smith",
            initials: "JS",
            date: "March 01, 2026",
            rating: 4,
            comment: "Nice place to visit and very historical."
        }
    ]
};

function Locationpage() {
    return (
        <div className="flex h-full w-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden">
            <div className="w-125 h-full overflow-y-auto border-r border-zinc-800 flex flex-col items-center px-6 py-6 scrollbar-hide">
                
                <div className="w-full mb-6 shrink-0">
                    <div className="flex items-center px-4 py-2 bg-[#2D2D2D] rounded-lg border border-transparent focus-within:border-gray-500 transition-all">
                        <img src={search} className="cursor-pointer" alt="search"/>
                        <input
                            type="text"
                            placeholder="Explore local spots"
                            className="flex-1 px-3 bg-transparent text-gray-200 placeholder-gray-500 outline-none text-sm"
                        />
                        <img src={settings} width="16" className="cursor-pointer" alt="settings"/>
                    </div>
                </div>

                {/* Card */}
                <SpotDetailCard {...SPOT_DETAIL} />

            </div>

            {/* Map here*/}
            <div className="flex-1 h-full bg-[#242424] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                </div>
            </div>
        </div>
    );
}

export default Locationpage;