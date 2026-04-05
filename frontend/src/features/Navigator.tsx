import { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { createPortal } from 'react-dom';
import SettingsPage from './settings/pages/SettingsPage';
import { supabase } from '@/lib/supabase';

// icons
import homeBtn from '@assets/icons/home-btn-default.svg';
import locBtn from '@assets/icons/map-btn-default.svg';
import saveBtn from '@assets/icons/save-btn-default.svg';
import salangiLogo from '@assets/icons/salangi-logo.png';

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
  const [displayName, setDisplayName] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: '' as string | null,
  });

  const refreshUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email_confirmed_at) {
      supabase.auth.signOut();
      navigate('/sign-in');
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('first_name, last_name, email, profile_pic')
      .eq('user_id', user.id)
      .single();

    setDisplayName({
      firstName: profile?.first_name || user.user_metadata?.first_name || '',
      lastName:  profile?.last_name  || user.user_metadata?.last_name  || '',
      email:     profile?.email      || user.email || '',
      avatarUrl: profile?.profile_pic || null,
    });
  }, [navigate]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const initials = displayName.firstName && displayName.lastName
    ? `${displayName.firstName[0]}${displayName.lastName[0]}`.toUpperCase()
    : '?';

  const fullName = displayName.firstName && displayName.lastName
    ? `${displayName.firstName} ${displayName.lastName}`
    : 'Guest';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/sign-in');
  };

  const AvatarButton = ({ onClick, className }: { onClick?: () => void; className?: string }) => (
    <button
      onClick={onClick}
      className={`h-15 w-15 bg-[#2E2E2E] rounded-lg cursor-pointer flex items-center justify-center overflow-hidden transition-all hover:bg-[#222222] ${className}`}
    >
      {displayName.avatarUrl ? (
        <img src={displayName.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <p className="font-['Playfair-Display'] text-[#FFE2A0] text-xl">{initials}</p>
      )}
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <div className="bg-[#373737] w-20 p-3 flex flex-col justify-between items-center h-full shrink-0 relative">
        <div>
          <button
            onClick={() => navigate('/home-page')}
            className="cursor-pointer flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
          >
            <img src={salangiLogo} alt="Salangi" className="w-20 h-20 object-contain" />
          </button>
        </div>

        <div className="flex flex-col items-center py-10 gap-6">
          <NavItem to="/home-page" defaultIcon={homeBtn} activeIcon={homeBtnSelected} alt="Home" isEnd />
          <NavItem to="/location-page" defaultIcon={locBtn} activeIcon={locBtnSelected} alt="Location" className="w-12 h-12 rounded-xl" />
          <NavItem to="/save-page" defaultIcon={saveBtn} activeIcon={saveBtnSelected} alt="Save" className="w-12 h-12 rounded-xl" />
        </div>

        <div className="relative">
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute bottom-18 left-0 w-64 bg-[#2D2D2D] rounded-2xl shadow-2xl border border-zinc-700/50 py-3 px-3 z-50 flex flex-col gap-1 transition-all"
            >
              <div className="flex items-center gap-3 p-2 py-3">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-[#222222] flex items-center justify-center shrink-0">
                  {displayName.avatarUrl ? (
                    <img src={displayName.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#FFE2A0] text-xs font-bold">{initials}</span>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <p className="text-[#FBFAF8] text-sm font-semibold truncate">{fullName}</p>
                  <p className="text-gray-400 text-xs truncate">{displayName.email}</p>
                </div>
              </div>

              <div className="h-px bg-zinc-700/50 my-1 mx-2" />

              <button
                onClick={() => { setIsMenuOpen(false); setIsSettingsOpen(true); }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#3D3D3D] transition-colors cursor-pointer text-[#FBFAF8]/90 hover:text-white"
              >
                <Settings size={18} className="opacity-70" />
                <span className="text-sm font-medium">Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer text-[#FBFAF8]/90 hover:text-red-500"
              >
                <LogOut size={18} className="opacity-70" />
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          )}

          <AvatarButton onClick={() => setIsMenuOpen(!isMenuOpen)} />
        </div>
      </div>

      <main className="flex-1 bg-[#1E1E1E] overflow-hidden">
        <Outlet />
      </main>

      {isSettingsOpen && createPortal(
        <SettingsPage
          onClose={() => {
            setIsSettingsOpen(false);
            refreshUser();
          }}
        />,
        document.body
      )}
    </div>
  );
}

export default Navigator;