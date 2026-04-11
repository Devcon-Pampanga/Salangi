import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface BusinessFilterDropdownProps {
  activeFilter: string;
  onFilterChange: (name: string) => void;
  listings: { name: string }[];
}

export function BusinessFilterDropdown({ activeFilter, onFilterChange, listings }: BusinessFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full lg:w-fit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-[#3a3a3a] px-4 py-2.5 rounded-xl border border-[#4d4d4d] text-white text-sm hover:border-[#FFE2A0]/50 transition-all min-w-[200px] justify-between shadow-lg group active:scale-95"
      >
        <div className="flex gap-2.5 items-center">
          <div className="flex flex-col items-start leading-tight">
            <span className="font-semibold truncate max-w-[120px]">{activeFilter}</span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#FFE2A0]' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-full min-w-[220px] bg-[#2a2a2a] border border-[#444] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
              {["All", ...listings.map(l => l.name)].map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    onFilterChange(name);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm transition-all flex items-center justify-between group/item ${
                    activeFilter === name 
                      ? 'text-[#FFE2A0] bg-[#FFE2A0]/5 font-bold' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{name}</span>
                  {activeFilter === name && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFE2A0] shadow-[0_0_8px_#FFE2A0]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
