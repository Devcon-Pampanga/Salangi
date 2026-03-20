import { useState } from 'react';
import { X, User, Building2 } from 'lucide-react';
import uploadIcon from '@assets/icons/upload-icon.svg';

interface SettingsPageProps {
    onClose: () => void;
}

const SettingsPage = ({ onClose }: SettingsPageProps) => {
    const [activeTab, setActiveTab] = useState<'account' | 'business'>('account');
    
    // Account States
    const [firstName, setFirstName] = useState('Juan');
    const [lastName, setLastName] = useState('Dela Cruz');
    const [email, setEmail] = useState('jdc@gmail.com');
    const [password, setPassword] = useState('********');

    // Business States
    const [businessName, setBusinessName] = useState('Holy Rosary Parish');
    const [description, setDescription] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit...');
    const [phone, setPhone] = useState('+63 987 654 3210');
    const [businessEmail, setBusinessEmail] = useState('hrpc@email.com');
    const [website, setWebsite] = useState('www.hrpc.com');
    const [facebook, setFacebook] = useState('facebook/holy-r...');

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
                            onClick={() => setActiveTab('account')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${activeTab === 'account' ? 'bg-[#333333] text-white border-zinc-700/50' : 'text-zinc-400 hover:text-white hover:bg-[#2A2A2A] border-transparent'}`}
                        >
                            <User size={18} className={activeTab === 'account' ? 'text-white' : 'text-zinc-500'} />
                            <span className="text-sm font-medium">Account</span>
                        </button>

                        <button 
                            onClick={() => setActiveTab('business')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${activeTab === 'business' ? 'bg-[#333333] text-white border-zinc-700/50' : 'text-zinc-400 hover:text-white hover:bg-[#2A2A2A] border-transparent'}`}
                        >
                            <Building2 size={18} className={activeTab === 'business' ? 'text-white' : 'text-zinc-500'} />
                            <span className="text-sm font-medium">Register business</span>
                        </button>
                    </nav>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-12 bg-[#222222] scrollbar-hide">
                    {activeTab === 'account' ? (
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
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Business Information */}
                            <div className="mb-10">
                                <h3 className="text-[#FBFAF8] text-lg font-semibold mb-6">Business Information</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center py-4 border-b border-zinc-800/50">
                                        <span className="text-sm text-zinc-400">Name</span>
                                        <input 
                                            type="text" 
                                            value={businessName} 
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm text-zinc-400">Description</h4>
                                        <textarea 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-transparent text-sm text-zinc-400 leading-relaxed outline-none focus:text-zinc-300 transition-colors h-24 resize-none"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-t border-zinc-800/50">
                                        <span className="text-sm text-zinc-400">Category <span className="text-zinc-600 text-xs">(optional)</span></span>
                                        <select className="bg-[#2D2D2D] text-zinc-300 text-xs px-4 py-2 rounded-lg outline-none border border-zinc-700/50 cursor-pointer">
                                            <option>Select option</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mb-10">
                                <h3 className="text-[#FBFAF8] text-sm font-semibold mb-4">Location</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input placeholder="Longitude *" className="bg-[#2D2D2D] text-sm p-4 rounded-xl border border-transparent focus:border-zinc-700 outline-none placeholder-zinc-600" />
                                        <input placeholder="Latitude *" className="bg-[#2D2D2D] text-sm p-4 rounded-xl border border-transparent focus:border-zinc-700 outline-none placeholder-zinc-600" />
                                    </div>
                                    <input placeholder="Address line 1 *" className="w-full bg-[#2D2D2D] text-sm p-4 rounded-xl border border-transparent focus:border-zinc-700 outline-none placeholder-zinc-600" />
                                    <input placeholder="Address line 2" className="w-full bg-[#2D2D2D] text-sm p-4 rounded-xl border border-transparent focus:border-zinc-700 outline-none placeholder-zinc-600" />
                                    <input placeholder="Address line 3" className="w-full bg-[#2D2D2D] text-sm p-4 rounded-xl border border-transparent focus:border-zinc-700 outline-none placeholder-zinc-600" />
                                    <input placeholder="Municipality/City *" className="w-full bg-[#2D2D2D] text-sm p-4 rounded-xl border border-transparent focus:border-zinc-700 outline-none placeholder-zinc-600" />
                                    <input placeholder="Province *" className="w-full bg-[#2D2D2D] text-sm p-4 rounded-xl border border-transparent focus:border-zinc-700 outline-none placeholder-zinc-600" />
                                </div>
                            </div>

                            {/* Operating hours */}
                            <div className="mb-10 flex justify-between items-center py-4 border-y border-zinc-800/50">
                                <span className="text-sm text-zinc-400 font-semibold">Operating hours</span>
                                <select className="bg-[#2D2D2D] text-zinc-300 text-xs px-4 py-2 rounded-lg outline-none border border-zinc-700/50 cursor-pointer">
                                    <option>Select option</option>
                                </select>
                            </div>

                            {/* Contact Information */}
                            <div className="mb-10">
                                <h3 className="text-[#FBFAF8] text-lg font-semibold mb-6">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-4 border-b border-zinc-800/50">
                                        <span className="text-sm text-zinc-400">Phone number</span>
                                        <input 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-zinc-800/50">
                                        <span className="text-sm text-zinc-400">Email address</span>
                                        <input 
                                            value={businessEmail}
                                            onChange={(e) => setBusinessEmail(e.target.value)}
                                            className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-zinc-800/50">
                                        <span className="text-sm text-zinc-400">Website link</span>
                                        <input 
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-zinc-800/50">
                                        <span className="text-sm text-zinc-400">Facebook <span className="text-zinc-600 text-xs">(optional)</span></span>
                                        <input 
                                            value={facebook}
                                            onChange={(e) => setFacebook(e.target.value)}
                                            className="text-sm text-[#FBFAF8] font-medium bg-transparent text-right outline-none focus:text-[#FFE2A0] transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Upload Images */}
                            <div className="mb-10">
                                <h3 className="text-[#FBFAF8] text-lg font-semibold mb-6">Upload Images</h3>
                                <div className="w-full p-6 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center bg-[#1C1C1C]/50 gap-8 hover:border-zinc-700 transition-colors">
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

                            {/* Actions */}
                            <div className="flex justify-end pt-4 pb-8">
                                <button className="px-10 py-3 bg-[#FFE2A0] text-[#222222] font-bold rounded-xl shadow-lg hover:bg-[#FFD680] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]">
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
