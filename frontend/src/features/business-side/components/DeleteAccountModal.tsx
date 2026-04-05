import { useState } from "react";
import { HiOutlineExclamation, HiX } from "react-icons/hi";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessName: string;
}

const DeleteAccountModal = ({ isOpen, onClose, businessName }: DeleteAccountModalProps) => {
    const [confirmName, setConfirmName] = useState("");
    
    if (!isOpen) return null;

    const isMatch = confirmName === businessName;

    const handleDelete = () => {
        if (!isMatch) return;
        
        // Mock success
        alert("Account scheduled for deletion. We're sorry to see you go!");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
            <div 
                className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl w-full max-w-md shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-red-500/10 flex items-center justify-between bg-red-500/5">
                    <div className="flex items-center gap-2">
                        <HiOutlineExclamation className="text-red-500 size-5" />
                        <h3 className="text-white text-lg font-semibold font-['Playfair_Display'] tracking-wide">Destructive Action</h3>
                    </div>
                    <button onClick={onClose} className="text-[#a0a0a0] hover:text-white transition-colors">
                        <HiX size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <h4 className="text-white font-semibold">Are you absolutely sure?</h4>
                        <p className="text-[#a0a0a0] text-sm leading-relaxed">
                            This action cannot be undone. This will permanently delete the business <span className="text-white font-bold underline decoration-[#FFE2A0]">{businessName}</span> and all associated reviews, events, and gallery items.
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-red-500/80 text-[10px] font-bold uppercase tracking-widest px-1">
                            Type <span className="text-white">"{businessName}"</span> to confirm
                        </label>
                        <input 
                            type="text" 
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder={businessName}
                            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white focus:border-red-500/50 transition-all outline-none" 
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 bg-[#2a2a2a] text-[#a0a0a0] border border-[#3a3a3a] rounded-xl hover:text-white hover:bg-[#333333] transition-all text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button 
                            disabled={!isMatch}
                            onClick={handleDelete}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-lg ${
                                isMatch 
                                ? 'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-red-500/20' 
                                : 'bg-[#2a2a2a] text-red-500/30 border border-red-500/10 cursor-not-allowed opacity-50'
                            }`}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;
