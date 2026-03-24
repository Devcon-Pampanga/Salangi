import { useState } from 'react';
import { X, User } from 'lucide-react';
import uploadIcon from '@assets/icons/upload-icon.svg';

interface SettingsPageProps {
    onClose: () => void;
}

const SettingsPage = ({ onClose }: SettingsPageProps) => {
    // Account States
    const [firstName, setFirstName] = useState('Juan');
    const [lastName, setLastName] = useState('Dela Cruz');
    const [email, setEmail] = useState('jdc@gmail.com');
    const [password, setPassword] = useState('********');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-[#1A1A1A]/60 backdrop-blur-md cursor-default transition-all animate-in fade-in duration-300">
            {/* Modal Container */}
            <div className="flex w-full max-w-5xl h-[85vh] bg-[#222222] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 animate-in zoom-in duration-300">
                
                {/* Modal Sidebar */}
                <div className="w-64 bg-[#1C1C1C] border-r border-zinc-800 p-6 flex flex-col gap-8 shrink-0 text-white">
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#333333] rounded-lg transition-colors cursor-pointer"
                    >
                        <X size={20} className="text-zinc-500" />
                    </button>

                    <nav className="flex flex-col gap-3">
                        <button 
                            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all border bg-[#333333] text-white border-zinc-700/50"
                        >
                            <User size={18} className="text-white" />
                            <span className="text-sm font-medium">Account</span>
                        </button>
                    </nav>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-12 bg-[#222222] scrollbar-hide">
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Profile Picture */}
                        <div className="mb-12">
                            <h3 className="text-[#FBFAF8] text-sm font-semibold mb-6 uppercase tracking-wider opacity-60">Profile Picture</h3>
                            <div className="w-full max-w-2xl p-5 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center bg-[#1C1C1C]/50 gap-8 hover:border-zinc-700 transition-colors">
                                <div className="flex-shrink-0 w-24 h-24 bg-[#FFE2A0] rounded-full flex items-center justify-center shadow-lg">
                                    <img src={uploadIcon} alt="upload" className="w-10 h-10" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[#FBFAF8] font-bold text-lg">
                                        Drop your photo here or <span className="text-[#FFE2A0] cursor-pointer hover:underline">Select a file</span>
                                    </p>
                                    <p className="text-sm text-zinc-500 mt-1">Supports: JPG , PNG.</p>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="mb-12">
                            <h3 className="text-[#FBFAF8] text-sm font-semibold mb-2">Account Information</h3>
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center py-5 border-b border-zinc-800/50">
                                    <span className="text-sm text-zinc-400">First Name</span>
                                    <input 
                                        type="text" 
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors w-1/2"
                                    />
                                </div>
                                <div className="flex justify-between items-center py-5 border-b border-zinc-800/50">
                                    <span className="text-sm text-zinc-400">Last Name</span>
                                    <input 
                                        type="text" 
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors w-1/2"
                                    />
                                </div>
                                <div className="flex justify-between items-center py-5 border-b border-zinc-800/50">
                                    <span className="text-sm text-zinc-400">Email Address</span>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors w-1/2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password & Security */}
                        <div className="mb-12">
                            <h3 className="text-[#FBFAF8] text-sm font-semibold mb-2">Password & Security</h3>
                            <div className="flex justify-between items-center py-5 border-b border-zinc-800/50">
                                <span className="text-sm text-zinc-400">Change Password</span>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors w-1/2 tracking-widest"
                                />
                            </div>
                        </div>

                        {/* Manage Account */}
                        <div className="mb-6">
                            <h3 className="text-[#FBFAF8] text-sm font-semibold mb-4">Manage Account</h3>
                            <div className="flex justify-between items-center py-5 bg-[#1C1C1C]/50 rounded-2xl px-6 border border-zinc-800/30">
                                <span className="text-sm text-zinc-300">Delete account</span>
                                <button className="px-6 py-2 border border-red-900/50 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
