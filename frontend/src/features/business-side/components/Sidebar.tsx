import { useState } from 'react';
import { NavLink, NavLinkRenderProps, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ROUTES } from '../../../routes/paths';
import { X, LogOut } from 'lucide-react';
import { IoCalendarOutline } from "react-icons/io5";
import { supabase } from '../../../lib/supabase';

interface SidebarProps {
  onClose?: () => void;
}

function Sidebar({ onClose }: SidebarProps) {
    const navigate = useNavigate();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    const navClass = ({ isActive }: NavLinkRenderProps): string => 
        `flex items-center gap-2 transition-colors ${
            isActive 
              ? 'bg-[#222222] border border-[#222222] text-[#FFE2A0] py-1 px-2 rounded-md' 
              : 'bg-[#373737] border border-[#373737] hover:bg-[#222222] hover:border-[#FFE2A0] py-1 px-2 rounded-md text-white hover:text-[#FFE2A0]'
        }`;

    const handleBackToHomepage = () => {
        setIsRedirecting(true);
        setTimeout(() => {
            navigate(ROUTES.HOME);
            setIsRedirecting(false);
        }, 400);
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        await supabase.auth.signOut();
        navigate(ROUTES.SIGN_IN);
    };

    return (
        <div className="bg-[#373737] w-64 lg:w-55 min-h-screen z-10 relative flex flex-col">

            {/* ── Loading overlay ── */}
            {isRedirecting && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6"
                    style={{ backgroundColor: '#1A1A1A' }}
                >
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-30 pointer-events-none"
                        style={{
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, rgba(255,226,160,0.8) 0%, rgba(255,226,160,0.1) 60%, transparent 80%)',
                        }}
                    />
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-[#FFE2A0]/10" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFE2A0] animate-spin" />
                    </div>
                    <div className="text-center space-y-1 relative z-10">
                        <p className="text-[#FFE2A0] font-semibold text-lg tracking-wide">Going back</p>
                        <p className="text-[#FBFAF8]/40 text-sm">Taking you there...</p>
                    </div>
                </div>,
                document.body
            )}

            <div className="px-4 py-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <button
                        onClick={handleBackToHomepage}
                        className="flex items-center gap-2 text-[#707070] hover:text-[#FFE2A0] text-sm transition-colors font-medium cursor-pointer"
                    >
                        ← Back to Homepage
                    </button>
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="lg:hidden p-2 text-white hover:text-[#FFE2A0] transition-colors"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>
                <div className="mb-8">
                    <p className="font-['Playfair_Display'] text-[#FFE2A0] text-2xl font-semibold tracking-wide">Dashboard</p>
                </div>

                <div className="space-y-4">
                    <NavLink to={ROUTES.DASHBOARD_OVERVIEW} onClick={onClose} className={navClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                        </svg>
                        <span>Overview</span>
                    </NavLink>

                    <NavLink to={ROUTES.DASHBOARD_MY_BUSINESS} onClick={onClose} className={navClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                        </svg>
                        My Business
                    </NavLink>

                    <NavLink to={ROUTES.DASHBOARD_EVENTS} onClick={onClose} className={navClass}>
                        <IoCalendarOutline className="size-5" />
                        Events
                    </NavLink>

                    <NavLink to={ROUTES.DASHBOARD_REVIEWS} onClick={onClose} className={navClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>
                        Reviews
                    </NavLink>
                </div>

                <p className="text-[#707070] text-md tracking-wide mt-6">Tools</p>

                <div className="space-y-4 mt-5">
                    <NavLink to={ROUTES.DASHBOARD_ANALYTICS} onClick={onClose} className={navClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                        </svg>
                        Analytics
                    </NavLink>

                    <NavLink to={ROUTES.DASHBOARD_GALLERY} onClick={onClose} className={navClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        Gallery
                    </NavLink>

                    <NavLink to={ROUTES.DASHBOARD_SETTINGS} onClick={onClose} className={navClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                        </svg>
                        Settings
                    </NavLink>
                </div>

                {/* ── Sign Out — pinned to bottom ── */}
                <div className="mt-auto pt-6 border-t border-[#444444]">
                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="flex items-center gap-2 w-full py-1 px-2 rounded-md text-sm font-medium transition-all cursor-pointer bg-[#373737] border border-[#373737] text-[#a0a0a0] hover:bg-red-900/30 hover:border-red-700/50 hover:text-red-400 disabled:opacity-50"
                    >
                        <LogOut size={16} />
                        <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;