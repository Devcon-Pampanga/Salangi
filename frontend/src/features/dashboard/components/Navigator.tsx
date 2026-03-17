import {NavLink, Outlet} from 'react-router-dom'

//icons
import homeBtn from '@assets/homeBtn.png';
import locBtn from '@assets/locBtn.png';
import saveBtn from '@assets/saveBtn.png';

//colored icons
import homeBtnSelected from '@assets/homeBtnSelected.png';
import locBtnSelected from '@assets/locBtnSelected.png';
import saveBtnSelected from '@assets/saveBtnSelected.png';

function Navigator() {
    return (
        /* Change: h-screen and overflow-hidden here locks the viewport */
        <div className="flex h-screen w-full overflow-hidden bg-[#1E1E1E]">
            
            {/* Sidebar: h-full ensures it stretches top-to-bottom but doesn't grow with content */}
            <div className="bg-[#373737] w-24 p-5 flex flex-col justify-between items-center h-full shrink-0">
                {/*Logo*/}
                <div>
                    <button className="h-15 w-15 bg-[#2E2E2E] rounded-lg flex items-center justify-center">
                        <p className="font-['Playfair-Display'] text-[#FFE2A0] text-xl">L</p>
                    </button>
                </div>

                {/*Home, Loc, Save*/}
                <div className="flex flex-col items-center py-10 gap-6">
                    <NavLink to="/Homepage" end>
                        {({ isActive }) => (
                            <div className={`flex items-center justify-center w-13 h-13 rounded-lg transition-all duration-200 ${isActive ? 'bg-[#2E2E2E] shadow-lg' : 'bg-transparent'}`}>
                                <img src={isActive ? homeBtnSelected : homeBtn} alt="Home" className="w-6 h-6 object-contain" />
                            </div>
                        )}
                    </NavLink>

                    <NavLink to="/Locationpage">
                        {({ isActive }) => (
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#2E2E2E] shadow-lg' : 'bg-transparent'}`}>
                                <img src={isActive ? locBtnSelected : locBtn} alt="Location" className="w-6 h-6 object-contain" />
                            </div>
                        )}
                    </NavLink>
                    
                    <NavLink to="/Savepage">
                        {({ isActive }) => (
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#2E2E2E] shadow-lg' : 'bg-transparent'}`}>
                                <img src={isActive ? saveBtnSelected : saveBtn} alt="Save" className="w-6 h-6 object-contain" />
                            </div>
                        )}
                    </NavLink>
                </div>

                {/*Account*/}
                <div>
                    <button className="h-15 w-15 bg-[#2E2E2E] rounded-lg flex items-center justify-center">
                        <p className="font-['Playfair-Display'] text-[#FFE2A0] text-xl">JC</p>
                    </button>
                </div>
            </div>

            {/* Main Content Area: Change: overflow-y-auto enables the scroll here only */}
            <main className="flex-1 h-full overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}

export default Navigator;