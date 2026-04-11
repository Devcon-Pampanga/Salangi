import { useState, useEffect } from "react";
import { 
    HiOutlineBell
} from "react-icons/hi";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../hooks/useAuth";

const Settings = () => {
    // 1. Auth and State Hooks
    const { user } = useAuth();
    const [businessName, setBusinessName] = useState("");
    const [notifications, setNotifications] = useState({
        savedListing: true,
        eventAttendance: true,
    });

    // 2. Fetch Business Name from Supabase
    useEffect(() => {
        if (!user?.id) return;
        
        supabase
            .from("listings")
            .select("name")
            .eq("user_id", user.id)
            .limit(1)
            .single()
            .then(({ data, error }) => {
                if (data && !error) {
                    setBusinessName(data.name);
                }
            });
    }, [user?.id]);

    // 3. Handlers
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
                
                {/* Section: Preferences */}
                <div className="grid grid-cols-1 gap-10 pt-4">
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

                </div>
            </div>
        </div>
    );
};

export default Settings;