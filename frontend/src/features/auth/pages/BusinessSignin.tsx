import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import google from '@assets/icons/google-icon.svg';
import facebook from '@assets/icons/facebook-icon.svg';

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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard/overview');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error(error.message);
  };

  return (
    <div className="relative bg-[#1a1a1a] flex items-center justify-center px-6 md:px-16 min-h-screen overflow-hidden">
      
      <div className="absolute top-0 left-0 p-6 md:p-10 z-50">
        <button
          onClick={() => navigate('/listyourbusiness')}
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

        {/* Header */}
        <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
          Sign in.
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          Continue exploring local businesses and experiences.
        </p>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="***********"
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
            className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors cursor-pointer"
          >
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>

          {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}

          <p className="text-gray-400 text-sm text-center mt-4">
            Don't have an account yet?{' '}
            <Link to="/businessRegister" className="text-[#FFE2A0] hover:underline">
              Sign up.
            </Link>
          </p>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="text-gray-400 text-sm">Or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2E2E2E] hover:bg-[#3a3a3a] text-white py-3 rounded-lg transition-colors border border-gray-600 cursor-pointer"
            >
              <img src={google} className="w-5 h-5" alt="Google" />
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#2E2E2E] hover:bg-[#3a3a3a] text-white py-3 rounded-lg transition-colors border border-gray-600 cursor-pointer">
              <img src={facebook} className="w-5 h-5" alt="Facebook" />
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessSignin;