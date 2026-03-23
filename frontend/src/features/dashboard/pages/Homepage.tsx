import search from '@assets/icons/search-btn-default.svg'

//image
import sampleimage from '@assets/png-files/imagesample.png'
import bg from '@assets/images/bg.png';

//component
import SpotCard from '../components/SpotCard';
import CategoryFilters from '../components/CategoryFilters';
import SearchBar from '../components/SearchBar';

function Homepage() {
    return (
        <div className="relative w-full h-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden">
            <div className="absolute top-0 left-0 w-190 h-170 -translate-x-100 -translate-y-110 bg-radial from-[#FFE2A0]/80 via-[#FFE2A0]/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            
            <div className="relative z-10 h-full flex px-6 py-6 gap-6">
                <div className="flex-1 h-full flex flex-col overflow-hidden">
                    
                    <div className="shrink-0">
                        <h1 className="font-['Playfair-Display'] text-4xl leading-tight mb-5">
                            Discover the <span className="text-[#FFE2A0]">heart</span> of Pampanga.
                        </h1>

                        {/* Filter buttons */}
                        <CategoryFilters className="mb-5" />
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 flex flex-col gap-6 pb-10">
                        {/* Card */}
                        <SpotCard 
                            title="Holy Rosary Parish Church"
                            location="Angeles City, Pampanga"
                            hours="8:00 am - 10:00 pm (Mon-Fri)"
                            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna."
                            images={[sampleimage, bg]}
                            isVerified={true}
                        />

                        <SpotCard 
                            title="Holy Rosary Parish Church"
                            location="Angeles City, Pampanga"
                            hours="8:00 am - 10:00 pm (Mon-Fri)"
                            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna."
                            images={[sampleimage, bg]}
                            isVerified={true}
                        />
                    </div>
                </div>

                <div>
                    <SearchBar 
                        searchIcon={search} 
                        className="ml-75 w-110 py-3" 
                    />

                    {/*Map*/}
                    <div className="w-185 flex flex-col h-165">
                        <div className="mt-6 flex-1 bg-[#222222] rounded-xl border border-zinc-800 flex items-center justify-center">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Homepage;