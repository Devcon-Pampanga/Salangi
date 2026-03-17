//icons
import locBtnSelected from '../../assets/locBtnSelected.png';
import verified from '../../assets/verified.png';
import heart from '../../assets/heart.png';
import search from '../../assets/search.png';
import settings from '../../assets/Settings.png';
import time from '../../assets/time.png';
import call from '../../assets/call.png';
import email from '../../assets/email.png';
import facebook from '../../assets/facebook.png';
import website from '../../assets/website.png';
import star from '../../assets/star.png';
import comment from '../../assets/comment.png';

//image
import sampleimage from '../../assets/imagesample.png';

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
                <div className="w-full h-auto bg-[#373737] rounded-xl overflow-hidden shrink-0 mb-10 pb-6 shadow-2xl">
                    <div className="relative flex flex-col">
                        {/* Heart Icon Overlay */}
                        <div className="absolute top-4 left-4 z-20">
                            <div className="flex items-center justify-center w-10 h-10 bg-[#222222]/80 backdrop-blur-sm rounded-full cursor-pointer hover:bg-[#222222] transition-colors">
                                <img src={heart} width="20" alt="heart" />
                            </div>
                        </div>

                        {/* Image Section with Pagination Dots */}
                        <div className="relative">
                            <img src={sampleimage} className="w-full h-75 object-cover" alt="sample" />
                            {/* Image Pagination Dots */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                <div className="w-2 h-2 rounded-full bg-white/40"></div>
                                <div className="w-2 h-2 rounded-full bg-white/40"></div>
                                <div className="w-2 h-2 rounded-full bg-white/40"></div>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Header Info */}
                            <div className="flex items-center gap-2">
                                <img src={locBtnSelected} width="13" alt="loc" />
                                <p className="text-[#FBFAF8]/50 text-[11px]">Angeles City, Pampanga</p>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <img src={time} width="13" alt="time" />
                                <p className="text-[#FBFAF8]/50 text-[11px]">8:00 am - 10:00 pm (Mon-Fri)</p>
                            </div>

                            <div className="flex items-center gap-2 my-2">
                                <img src={verified} width="15" alt="verified" />
                                <p className="text-[#FBFAF8] font-bold text-lg">Holy Rosary Parish Church</p>
                            </div>

                            <p className="text-sm leading-relaxed text-zinc-300 mt-3 border-b border-zinc-600/50 pb-6">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation...
                            </p>

                            {/* Contact Information */}
                            <div className="flex flex-col gap-5 py-6 border-b border-zinc-600/50">
                                <div className="flex items-center gap-4 text-[11px] text-[#FBFAF8]/80">
                                    <img src={call} width="16" className="opacity-70" alt="call" />
                                    <span>+63 976 355 7152</span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] text-[#FBFAF8]/80">
                                    <img src={email} width="16" className="opacity-70" alt="email" />
                                    <span>hrpc@email.com</span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] text-[#FBFAF8]/80">
                                    <img src={facebook} width="16" className="opacity-70" alt="fb" />
                                    <span>facebook/holy-rosary-parish-com</span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] text-[#FBFAF8]/80">
                                    <img src={website} width="16" className="opacity-70" alt="web" />
                                    <span>www.hrpc.com</span>
                                </div>
                            </div>

                            {/* Ratings Summary */}
                            <div className="py-6">
                                <p className="text-[11px] text-zinc-400 mb-1">Customer Reviews (25)</p>
                                <div className="flex flex-col">
                                    <span className="text-5xl font-serif text-[#FBFAF8]">4.8</span>
                                    <div className="flex gap-1 mt-2">
                                        {[...Array(5)].map((_, i) => (
                                            <img key={i} src={star} width="9" alt="star" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Review List */}
                            <div className="space-y-8 mt-4">
                                {[1, 2].map((review) => (
                                    <div key={review} className="flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#2E2E2E] flex items-center justify-center text-[10px] font-bold">
                                                    JD
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-semibold">Jane Doe</span>
                                                    <span className="text-[9px] text-zinc-500">March 03, 2026</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <img key={i} src={star} width="9" alt="review star" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-zinc-400 leading-relaxed pr-4">
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Leave a Review Button */}
                            <div className="mt-8 flex justify-end">
                                <button className="flex items-center gap-2 bg-[#FFE2A0] text-[#373737] px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all active:scale-95 shadow-lg cursor-pointer">
                                    <span><img src = {comment}/></span> Leave a review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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