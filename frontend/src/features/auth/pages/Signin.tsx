import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import bg from '@assets/images/bg.png';
import { supabase } from '@/lib/supabase';

function Signin() {
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

      // Block unverified users
      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        setError('Please verify your email before signing in. Check your inbox.');
        return;
      }

      // Store user info for display purposes (not for auth)
      const meta = data.user.user_metadata;
      localStorage.setItem('user', JSON.stringify({
        user_id:    data.user.id,
        first_name: meta?.first_name ?? meta?.full_name?.split(' ')[0] ?? '',
        last_name:  meta?.last_name  ?? meta?.full_name?.split(' ')[1] ?? '',
        email:      data.user.email,
        profile_pic: meta?.avatar_url ?? null,
      }));

      navigate('/home-page');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side */}
      <div
        className="w-1/2 relative flex items-end p-12"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 className="font-['Playfair_Display'] text-white text-6xl font-bold leading-tight">
          Continue <br />
          Your <br />
          Pampanga <br />
          <span className="text-[#FFE2A0]">Journey</span>
        </h1>
      </div>

      {/* Right side */}
      <div className="w-1/2 bg-[#1a1a1a] flex items-center justify-center px-16">
        <div className="w-full max-w-md">
          <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
            Sign in.
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Continue exploring local businesses and experiences.
          </p>

          <div className="mb-4">
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

          <div className="mb-6">
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

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>

          {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}

          <p className="text-gray-400 text-sm text-center mt-4">
            Don't have an account yet?{' '}
            <Link to="/sign-up" className="text-[#FFE2A0] hover:underline">
              Sign up.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signin;