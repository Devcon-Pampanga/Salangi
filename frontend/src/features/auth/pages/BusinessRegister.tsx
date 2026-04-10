import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '@/services/api';
import { ROUTES } from '../../../routes/paths';

function BusinessRegister() {
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
      setSuccess(res.message?.charAt(0).toUpperCase() + res.message?.slice(1) || 'Account created successfully. Please check your email to verify your account.');
    } catch (err: any) {
      setError(err.message?.charAt(0).toUpperCase() + err.message?.slice(1) || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-[#1a1a1a] flex items-center justify-center px-6 sm:px-12 md:px-16 min-h-screen overflow-x-hidden">

      <div className="absolute top-0 left-0 p-6 sm:p-10 z-50">
        <button
          onClick={() => navigate(ROUTES.LIST_YOUR_BUSINESS)}
          className="flex items-center gap-2 text-[#FBFAF8]/50 hover:text-[#FBFAF8] text-sm cursor-pointer transition-colors"
        >
          ← Go Back.
        </button>
      </div>

      {/* Brighter concentrated top glow for all screen sizes */}
      <div className="absolute top-0 left-0 right-0 h-80 lg:h-[500px] bg-radial from-[#FFE2A0]/60 via-transparent to-transparent blur-3xl opacity-100 lg:opacity-70 pointer-events-none -translate-y-1/2 z-0" />

      <div className="w-full max-w-md relative z-10 py-24 lg:py-0">

        <h2 className="font-['Playfair_Display'] text-white text-3xl sm:text-4xl font-bold mb-2">
          Register now.
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mb-8">
          Create your account to get started.
        </p>

        {/* First Name & Last Name */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
            className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'SIGN UP'}
          </button>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mt-3">
              <span className="text-red-400 text-sm">⚠</span>
              <p className="text-red-400 text-xs leading-snug">
                {error.charAt(0).toUpperCase() + error.slice(1)}
              </p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 mt-3">
              <span className="text-green-400 text-sm">✓</span>
              <p className="text-green-400 text-xs">
                {success.charAt(0).toUpperCase() + success.slice(1)}
              </p>
            </div>
          )}

          {/* Already have account */}
          <p className="text-gray-400 text-sm text-center mt-4">
            Already have an account?{' '}
            <Link to={ROUTES.BUSINESS_SIGNIN} className="text-[#FFE2A0] hover:underline">
              Sign in.
            </Link>
          </p>
        </div>
      </div>
  );
}

export default BusinessRegister;