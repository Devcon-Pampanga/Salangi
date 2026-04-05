import { useState } from "react";
import { HiOutlineLockClosed, HiX } from "react-icons/hi";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwords.new !== passwords.confirm) {
            setError("New passwords do not match");
            return;
        }

        if (passwords.new.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        // Mock success
        alert("Password updated successfully!");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div 
                className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#3a3a3a] flex items-center justify-between bg-[#333333]/30">
                    <div className="flex items-center gap-2">
                        <HiOutlineLockClosed className="text-[#FFE2A0] size-5" />
                        <h3 className="text-white text-lg font-semibold font-['Playfair_Display'] tracking-wide">Security Update</h3>
                    </div>
                    <button onClick={onClose} className="text-[#a0a0a0] hover:text-white transition-colors">
                        <HiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="p-6 space-y-6">
                    <p className="text-[#a0a0a0] text-sm leading-relaxed">Ensure your account is using a long, random password to stay secure.</p>
                    
                    <div className="space-y-4">
                        {/* Current Password */}
                        <div className="space-y-1.5">
                            <label className="text-[#FFE2A0] text-[10px] font-bold uppercase tracking-widest px-1 opacity-60">Current Password</label>
                            <input 
                                required
                                type="password" 
                                value={passwords.current}
                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                placeholder="Enter current password"
                                className="w-full bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl px-4 py-3 text-white focus:border-[#FFE2A0] transition-all outline-none" 
                            />
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="text-[#FFE2A0] text-[10px] font-bold uppercase tracking-widest px-1 opacity-60">New Password</label>
                            <input 
                                required
                                type="password" 
                                value={passwords.new}
                                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                placeholder="Min. 6 characters"
                                className="w-full bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl px-4 py-3 text-white focus:border-[#FFE2A0] transition-all outline-none" 
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-[#FFE2A0] text-[10px] font-bold uppercase tracking-widest px-1 opacity-60">Confirm New Password</label>
                            <input 
                                required
                                type="password" 
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                placeholder="Repeat new password"
                                className="w-full bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl px-4 py-3 text-white focus:border-[#FFE2A0] transition-all outline-none" 
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-[#a0a0a0] hover:text-white transition-colors text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-3 bg-[#FFE2A0] text-[#1a1a1a] rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#FFE2A0]/10"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
