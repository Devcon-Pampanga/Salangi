import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/paths";

interface ClaimBusinessButtonProps {
  listingId: number;
  listingName: string;
  isClaimed: boolean;
}

export default function ClaimBusinessButton({
  listingId,
  listingName,
  isClaimed,
}: ClaimBusinessButtonProps) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const user = session?.user;

   const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!user || isClaimed) return;
    supabase
      .from("listing_claims")
      .select("id")
      .eq("listing_id", listingId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle()
      .then(({ data }) => setIsPending(!!data));
  }, [listingId, user?.id, isClaimed]);

  // Don't render if already claimed
  if (isClaimed) return null;

    if (isPending) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-400/80">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Claim pending approval
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!user) return;

    setStatus("loading");
    setErrorMsg("");

    // Check for existing pending/approved claim from this user
    const { data: existing, error: checkError } = await supabase
      .from("listing_claims")
      .select("id, status")
      .eq("listing_id", listingId)
      .eq("user_id", user.id)
      .in("status", ["pending", "approved"])
      .maybeSingle();

    if (checkError) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
      return;
    }

    if (existing) {
      setStatus("error");
      setErrorMsg(
        existing.status === "pending"
          ? "You already have a pending claim for this listing."
          : "You have already claimed this listing."
      );
      return;
    }

    const { error: insertError } = await supabase.from("listing_claims").insert({
      listing_id: listingId,
      user_id: user.id,
      status: "pending",
      note: note.trim() || null,
    });

    if (insertError) {
      setStatus("error");
      setErrorMsg("Failed to submit your claim. Please try again.");
      return;
    }

    setStatus("success");
  };

  const handleClose = () => {
    setOpen(false);
    setNote("");
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <>
      {/* ── Trigger ── */}
      {!user ? (
        <button
          onClick={() => navigate(ROUTES.SIGN_IN)}
          className="flex items-center gap-2 text-xs text-[#FBFAF8]/50 hover:text-[#FFE2A0] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Log in to claim this business
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-xs text-[#FBFAF8]/50 hover:text-[#FFE2A0] transition-colors group"
        >
          <svg className="w-3.5 h-3.5 group-hover:text-[#FFE2A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Claim this business
        </button>
      )}

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-md rounded-2xl bg-[#1A1A1A] border border-zinc-700/50 shadow-2xl p-6">

            {status === "success" ? (
              <div className="text-center py-4 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-600/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-['Playfair_Display'] font-bold text-xl">Claim submitted!</h3>
                  <p className="mt-1 text-sm text-[#FBFAF8]/50">
                    Your request for <span className="text-[#FFE2A0]">{listingName}</span> is under review. We'll notify you once it's approved.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-[#FFE2A0] text-[#1a1a1a] text-sm font-bold hover:brightness-110 transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-['Playfair_Display'] font-bold text-xl">Claim this business</h3>
                    <p className="mt-1 text-sm text-[#FBFAF8]/50">
                      Submit a request to become the owner of <span className="text-[#FFE2A0]">{listingName}</span>.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="ml-4 text-[#FBFAF8]/30 hover:text-[#FBFAF8]/70 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-2">
                  <label className="block text-xs font-medium text-[#FBFAF8]/50 mb-1.5">
                    Note <span className="text-[#FBFAF8]/30">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. I am the owner and can verify via business registration..."
                    className="w-full rounded-xl bg-[#2a2a2a] border border-zinc-700/50 px-3 py-2.5 text-sm text-[#FBFAF8] placeholder-[#FBFAF8]/20 focus:border-[#FFE2A0]/50 focus:outline-none focus:ring-1 focus:ring-[#FFE2A0]/30 resize-none transition-colors"
                  />
                </div>

                {errorMsg && (
                  <p className="mt-3 text-xs text-red-400">{errorMsg}</p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#2D2D2D] text-white text-sm font-semibold hover:bg-[#3D3D3D] transition-all border border-zinc-700/50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={status === "loading"}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FFE2A0] text-[#1a1a1a] text-sm font-bold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {status === "loading" ? "Submitting..." : "Submit claim"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}