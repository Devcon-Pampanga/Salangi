import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import google from '@assets/icons/google-icon.svg';
import facebook from '@assets/icons/facebook-icon.svg';
import bg from '@assets/images/bg.png';
import { loginUser } from '@/api';
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
      const res = await loginUser({ email, password });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify({
        user_id: res.user_id,
        first_name: res.first_name,
        last_name: res.last_name,
        email: res.email,
      }));
      navigate('/home-page');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const handleGoogleSignIn = async () => {
  setError('');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) setError(error.message);
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

          {/* Email */}
          <div className="mb-4">
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="eg. juan.dc@gmail.com"
              className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0]"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-gray-300 text-sm mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
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

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>

          {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}

          {/* Don't have account */}
          <p className="text-gray-400 text-sm text-center mt-4">
            Don't have an account yet?{' '}
            <Link to="/sign-up" className="text-[#FFE2A0] hover:underline">
              Sign up.
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="text-gray-400 text-sm">Or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Social buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2E2E2E] hover:bg-[#3a3a3a] text-white py-3 rounded-lg transition-colors border border-gray-600 cursor-pointer"
            >
              <img src={google} className="w-5 h-5" />
              Google
            </button>
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-2 bg-[#2E2E2E] text-white/40 py-3 rounded-lg border border-gray-600 cursor-not-allowed"
            >
              <img src={facebook} className="w-5 h-5 opacity-40" />
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;