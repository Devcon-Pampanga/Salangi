import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import { Menu } from 'lucide-react';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-[#373737] rounded-lg text-[#FFE2A0] shadow-lg border border-[#4d4d4d]"
      >
        <Menu size={24} />
      </button>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden off-screen on mobile, always visible on desktop */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 bg-[#222222] overflow-y-auto w-full pt-16 lg:pt-0">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Dashboard;