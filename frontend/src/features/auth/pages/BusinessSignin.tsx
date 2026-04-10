import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '../../../routes/paths';

function BusinessSignin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({ email, password });
      if (supabaseError) throw supabaseError;

      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        setError('Please verify your email before signing in. Check your inbox for a confirmation link.');
        return;
      }

      const meta = data.user.user_metadata;
      localStorage.setItem('user', JSON.stringify({
        user_id:     data.user.id,
        first_name:  meta?.first_name ?? meta?.full_name?.split(' ')[0] ?? '',
        last_name:   meta?.last_name  ?? meta?.full_name?.split(' ')[1] ?? '',
        email:       data.user.email,
        profile_pic: meta?.avatar_url ?? null,
      }));

      navigate('/dashboard/overview');
    } catch (err: any) {
      setError(err.message?.charAt(0).toUpperCase() + err.message?.slice(1) || 'An error occurred during sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-[#1a1a1a] flex items-center justify-center px-6 md:px-16 min-h-screen overflow-hidden">

      <div className="absolute top-0 left-0 p-6 md:p-10 z-50">
        <button
          onClick={() => navigate(ROUTES.LIST_YOUR_BUSINESS)}
          className="flex items-center gap-2 text-[#FBFAF8]/50 hover:text-[#FBFAF8] text-sm cursor-pointer transition-colors"
        >
          ← Go Back.
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div
          className="absolute top-30 left-20 rounded-full blur-3xl opacity-60 pointer-events-none -z-10"
          style={{
            width: '760px',
            height: '680px',
            transform: 'translate(-250px, -650px)',
            background: 'radial-gradient(circle, rgba(255,226,160,0.8) 0%, rgba(255,226,160,0.2) 50%, transparent 70%)',
          }}
        />

        <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
          Sign in.
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          Continue exploring local businesses and experiences.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              placeholder="eg. juan.dc@gmail.com"
              className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0]"
            />
          </div>

          <div className="mb-2">
            <label className="text-gray-300 text-sm mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                placeholder="*************"
                className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <p className="text-right mb-6">
            <Link to="/forgot-password" className="text-[#FFE2A0] text-sm hover:underline">
              Forgot password?
            </Link>
          </p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mt-3">
              <span className="text-red-400 text-sm">⚠</span>
              <p className="text-red-400 text-xs leading-snug">
                {error.charAt(0).toUpperCase() + error.slice(1)}
              </p>
            </div>
          )}

          <p className="text-gray-400 text-sm text-center mt-4">
            Don't have an account yet?{' '}
            <Link to={ROUTES.BUSINESS_REGISTER} className="text-[#FFE2A0] hover:underline">
              Sign up.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default BusinessSignin;