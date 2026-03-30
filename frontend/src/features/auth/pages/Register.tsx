import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import google from '@assets/icons/google-icon.svg';
import facebook from '@assets/icons/facebook-icon.svg';
import bg from '@assets/images/bg.png';
import { registerUser } from '@/api';
import { supabase } from '@/lib/supabase';

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await registerUser(formData);
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
          Discover <br />
          Local <span className="text-[#FFE2A0]">Gems</span> <br />
          in Pampanga
        </h1>
      </div>

      {/* Right side */}
      <div className="w-1/2 bg-[#1a1a1a] flex items-center justify-center px-16">
        <div className="w-full max-w-md">
          <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
            Register now.
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Create your account to get started.
          </p>

          {/* First Name & Last Name */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-gray-300 text-sm mb-1 block">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="eg. Juan"
                className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0]"
              />
            </div>
            <div className="flex-1">
              <label className="text-gray-300 text-sm mb-1 block">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="eg. Dela Cruz"
                className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0]"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          {/* Sign Up Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Signing up...' : 'SIGN UP'}
          </button>

          {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
          {success && <p className="text-green-400 text-sm text-center mt-3">{success}</p>}

          {/* Already have account */}
          <p className="text-gray-400 text-sm text-center mt-4">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-[#FFE2A0] hover:underline">
              Sign in.
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
              onClick={handleGoogleSignUp}
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

export default Register;