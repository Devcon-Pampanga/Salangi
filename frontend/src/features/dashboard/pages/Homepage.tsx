//icons
import grid from '@assets/png-files/grid.png'
import resto from '@assets/png-files/resto.png'
import cafe from '@assets/png-files/cafe.png'
import activities from '@assets/png-files/activities.png'
import search from '@assets/png-files/search.png'
import settings from '@assets/png-files/Settings.png'

//image
import sampleimage from '@assets/png-files/imagesample.png'
import bg from '@assets/images/bg.png';

//component
import SpotCard from '../components/SpotCard';

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

                        <div className="flex gap-4 mb-5">
                            <button className="flex items-center cursor-pointer gap-2 p-3 px-5 bg-[#373737] rounded-lg hover:bg-[#454545] transition-colors">
                                <img src={grid} alt="all"/>
                                <p>All</p>
                            </button>
                            <button className="flex items-center cursor-pointer gap-2 p-3 px-4 bg-[#373737] rounded-lg hover:bg-[#454545] transition-colors">
                                <img src={resto} alt="resto"/>
                                <p>Resto</p>
                            </button>
                            <button className="flex items-center cursor-pointer gap-2 p-3 px-4 bg-[#373737] rounded-lg hover:bg-[#454545] transition-colors">
                                <img src={cafe} alt="cafe"/>
                                <p>Cafe</p>
                            </button>
                            <button className="flex items-center cursor-pointer gap-2 p-3 px-4 bg-[#373737] rounded-lg hover:bg-[#454545] transition-colors">
                                <img src={activities} alt="activities"/>
                                <p>Activities</p>
                            </button>
                        </div>
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
                    <div className="flex ml-75 items-center w-110 px-4 py-3 bg-[#2D2D2D] rounded-lg border border-transparent focus-within:border-gray-500 transition-all">
                        <img src={search} className="cursor-pointer" alt="search"/>
                        <input
                            type="text"
                            placeholder="Explore local spots"
                            className="flex-1 px-3 bg-transparent text-gray-200 placeholder-gray-500 outline-none text-sm"
                        />
                        <img src={settings} width="16" className="cursor-pointer" alt="settings"/>
                    </div>    

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