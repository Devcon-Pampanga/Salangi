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

      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        setError('Please verify your email before signing in. Check your inbox.');
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

      navigate('/home-page');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to right, transparent -11%, rgba(34, 34, 34, 0.9), #222222 50%), url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dashed curve decoration */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <path
          d="M 400 0 C 200 200, 600 400, 400 800"
          transform="translate(200, 0)"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeDasharray="8 8"
          className="opacity-30"
        />
      </svg>

      {/* Radial spotlight */}
      <div className="absolute w-190 h-170 translate-x-113 -mt-97 bg-radial from-[#FFE2A0]/80 via-[#FFE2A0]/20 to-transparent rounded-full blur-3xl opacity-60" />

      {/* Left — headline */}
      <div className="motion-preset-slide-right motion-duration-800">
        <h1 className="font-['Playfair_Display'] translate-x-30 mt-70 text-[80px] absolute font-bold text-[#FBFAF8] max-w-120 leading-tight">
          Continue your Pampanga <span className="text-[#FFE2A0]">Journey</span>
        </h1>
      </div>

      {/* Right — form */}
      <div className="motion-preset-slide-left motion-duration-800">

        {/* Heading */}
        <div className="ml-180 mt-25 absolute">
          <h1 className="font-['Playfair_Display'] text-[#FBFAF8] text-5xl font-bold mb-2.5">
            Sign in<span className="text-[#FFE2A0]">.</span>
          </h1>
          <p className="text-[#FBFAF8] text-s">Continue exploring local businesses and experiences.</p>
        </div>

        {/* Email */}
        <div className="translate-x-180 mt-53 absolute">
          <div className="flex flex-col gap-2 w-150">
            <label className="text-[#FBFAF8] text-md">Email</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              placeholder="eg. juan.dc@gmail.com"
              className="bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg border-none focus:ring-1 focus:ring-white outline-none transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="translate-x-180 mt-79 absolute">
          <div className="flex flex-col gap-2 w-150">
            <div className="flex items-center justify-between">
              <label className="text-[#FBFAF8] text-md">Password</label>
              <Link to="/forgot-password" className="text-[#FFE2A0] text-sm hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                placeholder="**********"
                className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg border-none focus:ring-1 focus:ring-white outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="translate-x-180 mt-103 absolute w-150">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Sign In Button */}
        <div className="translate-x-180 mt-110 absolute">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="px-4 py-3 bg-[#FFE2A0] hover:bg-[#fcd789] active:bg-[#f5cc70] w-150 rounded-lg cursor-pointer font-semibold text-[#222222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        {/* Don't have an account */}
        <div className="translate-x-180 mt-126 absolute">
          <p className="text-[#FBFAF8]">
            Don't have an account?{' '}
            <Link to="/sign-up">
              <span className="text-[#FFE2A0] cursor-pointer hover:underline">Sign up</span>.
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Signin;