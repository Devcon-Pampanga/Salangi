import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import SettingsPage from './settings/pages/SettingsPage';

// icons
import homeBtn from '@assets/icons/home-btn-default.svg';
import locBtn from '@assets/icons/map-btn-default.svg';
import saveBtn from '@assets/icons/save-btn-default.svg';

// colored icons
import homeBtnSelected from '@assets/icons/home-btn-active.svg';
import locBtnSelected from '@assets/icons/map-btn-active.svg';
import saveBtnSelected from '@assets/icons/save-btn-active.svg';

interface NavItemProps {
  to: string;
  defaultIcon: string;
  activeIcon: string;
  alt: string;
  isEnd?: boolean;
  className?: string;
}

const NavItem = ({ to, defaultIcon, activeIcon, alt, isEnd = false, className = "w-13 h-13 rounded-lg" }: NavItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NavLink to={to} end={isEnd}>
      {({ isActive }) => {
        const showActive = isActive || isHovered;
        return (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`flex items-center justify-center transition-all duration-200 border ${className} ${
              showActive ? 'bg-[#222222]' : 'bg-transparent border-transparent'
            } ${isHovered ? 'border-[#FFE2A0]' : 'border-transparent'}`}
          >
            <img
              src={showActive ? activeIcon : defaultIcon}
              alt={alt}
              className="w-6 h-6 object-contain"
            />
          </div>
        );
      }}
    </NavLink>
  );
};

function Navigator() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get user from localStorage
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;
  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';
  const fullName = user ? `${user.first_name} ${user.last_name}` : 'Guest';

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/sign-in');
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <div className="bg-[#373737] w-24 p-5 flex flex-col justify-between items-center h-full shrink-0 relative">
        {/*Logo*/}
        <div>
          <button className="h-15 w-15 bg-[#2E2E2E] rounded-lg cursor-pointer">
            <p className="font-['Playfair-Display'] text-[#FFE2A0] text-xl">L</p>
          </button>
        </div>

        {/*Home, Loc, Save*/}
        <div className="flex flex-col items-center py-10 gap-6">
          <NavItem
            to="/home-page"
            defaultIcon={homeBtn}
            activeIcon={homeBtnSelected}
            alt="Home"
            isEnd
          />
          <NavItem
            to="/location-page"
            defaultIcon={locBtn}
            activeIcon={locBtnSelected}
            alt="Location"
            className="w-12 h-12 rounded-xl"
          />
          <NavItem
            to="/save-page"
            defaultIcon={saveBtn}
            activeIcon={saveBtnSelected}
            alt="Save"
            className="w-12 h-12 rounded-xl"
          />
        </div>

        {/*Account*/}
        <div className="relative">
          {/* Account Menu Popover */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute bottom-18 left-0 w-64 bg-[#2D2D2D] rounded-2xl shadow-2xl border border-zinc-700/50 py-3 px-3 z-50 flex flex-col gap-1 transition-all"
            >
              {/* User Info */}
              <div className="flex items-center gap-3 p-2 py-3">
                <div className="h-8 w-8 bg-[#222222] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[#FFE2A0] text-xs font-bold">{initials}</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <p className="text-[#FBFAF8] text-sm font-semibold truncate">{fullName}</p>
                  <p className="text-gray-400 text-xs truncate">{user?.email ?? ''}</p>
                </div>
              </div>

              <div className="h-px bg-zinc-700/50 my-1 mx-2" />

              {/* Settings */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#3D3D3D] transition-colors cursor-pointer text-[#FBFAF8]/90 hover:text-white"
              >
                <Settings size={18} className="opacity-70" />
                <span className="text-sm font-medium">Settings</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer text-[#FBFAF8]/90 hover:text-red-500"
              >
                <LogOut size={18} className="opacity-70 group-hover:opacity-100" />
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-15 w-15 bg-[#2E2E2E] rounded-lg cursor-pointer flex items-center justify-center transition-all hover:bg-[#222222]"
          >
            <p className="font-['Playfair-Display'] text-[#FFE2A0] text-xl">{initials}</p>
          </button>
        </div>
      </div>

      <main className="flex-1 bg-[#1E1E1E] overflow-hidden">
        <Outlet />
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsPage onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}

export default Navigator;