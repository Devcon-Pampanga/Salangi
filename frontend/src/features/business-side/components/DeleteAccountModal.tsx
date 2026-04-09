import { useState } from "react";
import { HiOutlineExclamation, HiX } from "react-icons/hi";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessName: string;
}

const DeleteAccountModal = ({ isOpen, onClose, businessName }: DeleteAccountModalProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [confirmName, setConfirmName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const isMatch = confirmName === businessName;

    const handleDelete = async () => {
        if (!isMatch || !user) return;
        setLoading(true);
        setError("");

        try {
            // Step 1: Delete all listings for this user
            // With CASCADE set, this will automatically delete:
            // events, gallery_images, listing_interactions, saves, reviews
            const { error: listingsError } = await supabase
                .from("listings")
                .delete()
                .eq("user_id", user.id);

            if (listingsError) throw new Error("Failed to delete business listings.");

            // Step 2: Delete the user row from your public users table
            const { error: userRowError } = await supabase
                .from("users")
                .delete()
                .eq("user_id", user.id);

            if (userRowError) throw new Error("Failed to delete user record.");

            // Step 3: Delete the auth.users record
            await supabase.rpc('delete_own_auth_user');

            // Step 4: Sign out the session
            await supabase.auth.signOut();

            // Step 5: Clear local storage and redirect
            localStorage.removeItem("user");
            navigate("/business-signin", { replace: true });

        } catch (err: any) {
            setError(err.message ?? "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl w-full max-w-md shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
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
                            This action cannot be undone. This will permanently delete the business{" "}
                            <span className="text-white font-bold underline decoration-[#FFE2A0]">{businessName}</span>{" "}
                            and all associated reviews, events, and gallery items.
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

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 bg-[#2a2a2a] text-[#a0a0a0] border border-[#3a3a3a] rounded-xl hover:text-white hover:bg-[#333333] transition-all text-sm font-semibold disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!isMatch || loading}
                            onClick={handleDelete}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-lg ${
                                isMatch && !loading
                                    ? 'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-red-500/20'
                                    : 'bg-[#2a2a2a] text-red-500/30 border border-red-500/10 cursor-not-allowed opacity-50'
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Deleting...
                                </span>
                            ) : "Delete Account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;