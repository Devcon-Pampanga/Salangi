import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Loader2, BarChart2, Star, CalendarDays } from 'lucide-react';
import { upgradeToBusinessAccount } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/authContext';
import { ROUTES } from '../../../routes/paths';

// ─── Feature list shown on the upgrade page ───────────────────────────────────

const FEATURES = [
  {
    icon: Briefcase,
    label: 'List your business on Salangi',
  },
  {
    icon: BarChart2,
    label: 'Access analytics & insights',
  },
  {
    icon: Star,
    label: 'Manage reviews from customers',
  },
  {
    icon: CalendarDays,
    label: 'Create and promote events',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function UpgradeToBusinessPage() {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Call API to update profiles.role → 'business'
      await upgradeToBusinessAccount();

      // 2. Verify the DB write actually committed before navigating.
      //    This prevents ProtectedRoute from reading a stale 'user' role
      //    and bouncing the user back to this page.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Your session has expired. Please sign in again.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw new Error('Could not verify upgrade. Please try again.');
      if (profile?.role !== 'business') throw new Error('Role upgrade did not apply. Please try again.');

      // 3. Update global role in AuthContext immediately — ProtectedRoute
      //    reads from this, so the redirect will succeed without a re-fetch.
      setRole('business');

      // 4. Navigate — ProtectedRoute will now see role === 'business' instantly.
      navigate(ROUTES.DASHBOARD_OVERVIEW, { replace: true });

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-[#1a1a1a] flex items-center justify-center px-6 sm:px-12 md:px-16 min-h-screen overflow-x-hidden">

      {/* Radial glow — centered behind the content, not bleeding from top edge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[600px] h-[600px] rounded-full bg-[#FFE2A0]/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative z-10 text-center">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FFE2A0]/10 border border-[#FFE2A0]/20 mb-6">
          <Briefcase size={22} className="text-[#FFE2A0]" />
        </div>

        {/* Heading */}
        <h2 className="font-['Playfair_Display'] text-white text-3xl sm:text-4xl font-bold mb-3">
          Upgrade your account.
        </h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          One click is all it takes to unlock the business dashboard and list your business on Salangi.
        </p>

        {/* Feature list */}
        <ul className="flex flex-col gap-3 mb-8 text-left">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#FFE2A0]/10 border border-[#FFE2A0]/20 shrink-0">
                <Icon size={13} className="text-[#FFE2A0]" />
              </span>
              {label}
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Briefcase size={16} />}
          {loading ? 'Upgrading...' : 'UPGRADE TO BUSINESS'}
        </button>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mt-4">
            <span className="text-red-400 text-sm">⚠</span>
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {/* Go back */}
        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer"
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}

export default UpgradeToBusinessPage;