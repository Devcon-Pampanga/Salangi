import { useState } from "react";
import { 
    HiOutlineOfficeBuilding, 
    HiOutlinePhone, 
    HiOutlineMail, 
    HiOutlineGlobeAlt, 
    HiOutlineClock, 
    HiOutlineBell, 
    HiOutlineShieldCheck,
    HiOutlineTrash
} from "react-icons/hi";
import ChangePasswordModal from "./ChangePasswordModal";
import DeleteAccountModal from "./DeleteAccountModal";

const Settings = () => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [businessName] = useState("The Grand Bistro");
    const [notifications, setNotifications] = useState({
        savedListing: true,
        eventAttendance: true,
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="w-full h-full pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="px-4 md:px-6 py-4">
                <h1 className="font-['Playfair_Display'] text-white text-2xl md:text-3xl font-semibold tracking-wide cursor-default">
                    Business <span className="text-[#FFE2A0]">Settings</span>
                </h1>
                <p className="text-white text-sm">Manage your business profile, availability, and preferences</p>
            </div>

            <div className="px-4 md:px-6 py-4 space-y-10 max-w-6xl">
                
                {/* Section: Preferences & Security */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                    {/* Notifications */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-[#4d4d4d] pb-2">
                            <HiOutlineBell className="text-[#FFE2A0] size-6" />
                            <h2 className="text-white text-xl font-semibold">Notifications</h2>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(notifications).map(([key, value]) => {
                                const labels: Record<string, string> = {
                                    savedListing: "User Saves Listing",
                                    eventAttendance: "Event Attendance",
                                };
                                return (
                                    <div key={key} className="flex items-center justify-between bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-medium">{labels[key] || key}</span>
                                            <span className="text-[#a0a0a0] text-[10px]">Get notified instantly</span>
                                        </div>
                                        <button 
                                            onClick={() => toggleNotification(key as keyof typeof notifications)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-[#FFE2A0]' : 'bg-[#4d4d4d]'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Security */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-[#4d4d4d] pb-2">
                            <HiOutlineShieldCheck className="text-[#FFE2A0] size-6" />
                            <h2 className="text-white text-xl font-semibold">Security</h2>
                        </div>
                        <div className="space-y-4">
                            <button 
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="w-full flex items-center justify-between bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl px-4 py-3 text-white hover:border-[#FFE2A0] transition-colors group"
                            >
                                <span className="text-sm">Change Business Password</span>
                                <span className="text-[#a0a0a0] text-[10px] uppercase tracking-widest font-bold group-hover:text-[#FFE2A0] transition-colors">Update</span>
                            </button>
                            <button 
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="w-full flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-2">
                                    <HiOutlineTrash className="size-4" />
                                    <span className="text-sm font-semibold">Delete Business Account</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold group-hover:scale-105 transition-transform">Permanent</span>
                            </button>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="pt-10 flex flex-col md:flex-row border-t border-[#4d4d4d] justify-end gap-3 md:gap-4">
                    <button className="w-full md:w-auto px-8 py-3 rounded-xl text-[#a0a0a0] hover:text-white transition-colors font-semibold bg-[#3a3a3a] md:bg-transparent border md:border-0 border-[#4d4d4d] md:order-1 order-2 mt-2 md:mt-0">
                        Discard Changes
                    </button>
                    <button className="w-full md:w-auto px-10 py-3 rounded-xl bg-[#FFE2A0] text-[#1a1a1a] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg md:order-2 order-1">
                        Save All Changes
                    </button>
                </div>
            </div>
            
            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />

            <DeleteAccountModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                businessName={businessName}
            />
        </div>
    );
};

export default Settings;
