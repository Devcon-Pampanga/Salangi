//icons
import locBtn from '../../assets/locBtn.png';
import locBtnSelected from '../../assets/locBtnSelected.png';
import verified from '../../assets/verified.png';
import grid from '../../assets/grid.png'
import resto from '../../assets/resto.png'
import cafe from '../../assets/cafe.png'
import activities from '../../assets/activities.png'
import heart from '../../assets/heart.png'
import search from '../../assets/search.png'
import settings from '../../assets/Settings.png'
import time from '../../assets/time.png'

//image
import sampleimage from '../../assets/imagesample.png'

function Homepage() {
    return (
        <div className="relative w-full h-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-190 h-170 -translate-x-100 -translate-y-110 bg-radial from-[#FFE2A0]/80 via-[#FFE2A0]/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            
            <div className="relative z-10 h-full flex px-6 py-6 gap-6">
                
                <div className="flex-1 h-full flex flex-col overflow-hidden">
                    
                    <div className="shrink-0">
                        <h1 className="font-['Playfair-Display'] text-4xl leading-tight mb-5">
                            Discover the <span className="text-[#FFE2A0]">heart</span> of Pampanga.
                        </h1>

                        <div className="flex gap-4 mb-5">
                            <button className="flex items-center gap-2 p-3 px-5 bg-[#373737] rounded-lg hover:bg-[#454545] transition-colors">
                                <img src={grid} alt="all"/>
                                <p>All</p>
                            </button>
                            <button className="flex items-center gap-2 p-3 px-4 bg-[#373737] rounded-lg hover:bg-[#454545] transition-colors">
                                <img src={resto} alt="resto"/>
                                <p>Resto</p>
                            </button>
                            <button className="flex items-center gap-2 p-3 px-4 bg-[#373737] rounded-lg hover:bg-[#454545] transition-colors">
                                <img src={cafe} alt="cafe"/>
                                <p>Cafe</p>
                            </button>
                            <button className="flex items-center gap-2 p-3 px-4 bg-[#373737] rounded-lg hover:bg-[#454545] transition-colors">
                                <img src={activities} alt="activities"/>
                                <p>Activities</p>
                            </button>
                        </div>
                    </div>

                    {/* scrollable section */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 flex flex-col gap-6 pb-10">
                        {/* Card */}
                        <div className="w-full max-w-120 bg-[#373737] rounded-xl cursor-pointer overflow-hidden shrink-0">
                            <div className="p-5">
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-center justify-center w-10 h-10 bg-[#222222]/80 backdrop-blur-sm rounded-full z-20">
                                        <img src={heart} width="20" alt="heart"/>
                                    </div>
                                    <img src={sampleimage} className="w-full rounded-lg" alt="spot"/>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <img src={locBtnSelected} width="13" alt="loc"/>
                                    <p className="text-[#FBFAF8]/50 text-xs">Angeles City, Pampanga</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <img src={time} width="13" alt="time"/>
                                    <p className="text-[#FBFAF8]/50 text-xs">8:00 am - 10:00 pm (Mon-Fri)</p>
                                </div>
                                <div className="flex items-center gap-2 my-1">
                                    <p className="text-[#FBFAF8] font-semibold text-lg">Holy Rosary Parish Church</p>
                                    <img src={verified} width="15" alt="verified"/>
                                </div>
                                <p className="text-sm text-zinc-300">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. <span className="text-[#FFE2A0]">See more.</span>
                                </p>
                                <div className="flex justify-end py-3 mt-2">
                                    <button className="flex items-center justify-center rounded-md gap-2 p-2 px-4 bg-[#FFE2A0] cursor-pointer">
                                        <img src={locBtn} width="13" alt="shop"/>
                                        <p className="text-[#222222] text-xs font-bold">Shop in maps</p>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-120 bg-[#373737] rounded-xl cursor-pointer overflow-hidden shrink-0">
                            <div className="p-5">
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-center justify-center w-10 h-10 bg-[#222222]/80 backdrop-blur-sm rounded-full z-20">
                                        <img src={heart} width="20" alt="heart"/>
                                    </div>
                                    <img src={sampleimage} className="w-full rounded-lg" alt="spot"/>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <img src={locBtnSelected} width="13" alt="loc"/>
                                    <p className="text-[#FBFAF8]/50 text-xs">Angeles City, Pampanga</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <img src={time} width="13" alt="time"/>
                                    <p className="text-[#FBFAF8]/50 text-xs">8:00 am - 10:00 pm (Mon-Fri)</p>
                                </div>
                                <div className="flex items-center gap-2 my-1">
                                    <p className="text-[#FBFAF8] font-semibold text-lg">Holy Rosary Parish Church</p>
                                    <img src={verified} width="15" alt="verified"/>
                                </div>
                                <p className="text-sm text-zinc-300">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. <span className="text-[#FFE2A0]">See more.</span>
                                </p>
                                <div className="flex justify-end py-3 mt-2">
                                    <button className="flex items-center justify-center rounded-md gap-2 p-2 px-4 bg-[#FFE2A0] cursor-pointer">
                                        <img src={locBtn} width="13" alt="shop"/>
                                        <p className="text-[#222222] text-xs font-bold">Shop in maps</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*Map*/}
                <div className="">
                    <div className="flex ml-75 items-center w-110 px-4 py-3 bg-[#2D2D2D] rounded-lg border border-transparent focus-within:border-gray-500 transition-all">
                        <img src={search} className="cursor-pointer" alt="search"/>
                        <input
                            type="text"
                            placeholder="Explore local spots"
                            className="flex-1 px-3 bg-transparent text-gray-200 placeholder-gray-500 outline-none text-sm"
                        />
                        <img src={settings} width="16" className="cursor-pointer" alt="settings"/>
                    </div>    

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