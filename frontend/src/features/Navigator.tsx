import {NavLink, Outlet} from 'react-router-dom'

//icons
import homeBtn from '@assets/png-files/homeBtn.png';
import locBtn from '@assets/png-files/locBtn.png';
import saveBtn from '@assets/png-files/saveBtn.png';

//colored icons
import homeBtnSelected from '@assets/png-files/homeBtnSelected.png';
import locBtnSelected from '@assets/png-files/locBtnSelected.png';
import saveBtnSelected from '@assets/png-files/saveBtnSelected.png';

function Navigator() {
    return (
        <div className="flex h-screen overflow-hidden">
            
            {/* Sidebar */}
            <div className="bg-[#373737] w-24 p-5 flex flex-col justify-between items-center h-full shrink-0">
                {/*Logo*/}
                <div>
                    <button className="h-15 w-15 bg-[#2E2E2E] rounded-lg">
                        <p className="font-['Playfair-Display'] text-[#FFE2A0] text-xl">L</p>
                    </button>
                </div>

                {/*Home, Loc, Save*/}
                <div className="flex flex-col items-center py-10 gap-6">
                    <NavLink to="/home-page" end>
                        {({ isActive }) => (
                            <div className={`flex items-center justify-center w-13 h-13 rounded-lg transition-all duration-200 ${
                                isActive ? 'bg-[#2E2E2E] shadow-lg' : 'bg-transparent'
                            }`}>
                                <img src={isActive ? homeBtnSelected : homeBtn} alt="Home" className="w-6 h-6 object-contain" />
                            </div>
                        )}
                    </NavLink>

                    <NavLink to="/location-page">
                        {({ isActive }) => (
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                                isActive ? 'bg-[#2E2E2E] shadow-lg' : 'bg-transparent'
                            }`}>
                                <img src={isActive ? locBtnSelected : locBtn} alt="Location" className="w-6 h-6 object-contain" />
                            </div>
                        )}
                    </NavLink>
                    
                    <NavLink to="/save-page">
                        {({ isActive }) => (
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                                isActive ? 'bg-[#2E2E2E] shadow-lg' : 'bg-transparent'
                            }`}>
                                <img src={isActive ? saveBtnSelected : saveBtn} alt="Save" className="w-6 h-6 object-contain" />
                            </div>
                        )}
                    </NavLink>
                </div>

                {/*Account*/}
                <div>
                    <button className="h-15 w-15 bg-[#2E2E2E] rounded-lg">
                        <p className="font-['Playfair-Display'] text-[#FFE2A0] text-xl">JC</p>
                    </button>
                </div>
            </div>

            <main className="flex-1 bg-[#1E1E1E] overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}

export default Navigator;