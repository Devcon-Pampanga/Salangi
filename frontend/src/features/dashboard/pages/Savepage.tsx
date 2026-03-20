import search from '@assets/icons/search-btn-default.svg'

//image
import sampleimage from '@assets/png-files/imagesample.png'

//components
import SpotCard from '../components/SpotCard';
import CategoryFilters from '../components/CategoryFilters';
import SearchBar from '../components/SearchBar';

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
                    <CategoryFilters className="z-10" />

                    <SearchBar 
                        glass 
                        searchIcon={search} 
                        className="w-110 py-3" 
                        placeholder="Explore local spots"
                    />
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
