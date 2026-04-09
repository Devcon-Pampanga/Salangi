import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import bg from '@assets/images/bg.png';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { error: supabaseError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
          },
        },
      });
      if (supabaseError) throw supabaseError;
      setSuccess('Account created! Please check your email to verify your account before signing in.');
    } catch (err) {
      setError((err as Error).message);
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
      <div className="absolute w-190 h-170 translate-x-113 -mt-110 bg-radial from-[#FFE2A0]/80 via-[#FFE2A0]/20 to-transparent rounded-full blur-3xl opacity-60" />

      {/* Left — headline */}
      <div className="motion-preset-slide-right motion-duration-800">
        <h1 className="font-['Playfair_Display'] translate-x-30 mt-95 text-[80px] absolute font-bold text-[#FBFAF8] max-w-120 leading-tight">
          Discover Local <span className="text-[#FFE2A0]">Gems</span> in Pampanga
        </h1>
      </div>

      {/* Right — form */}
      <div className="motion-preset-slide-left motion-duration-800">

        {/* Heading */}
        <div className="ml-180 mt-15 absolute">
          <h1 className="font-['Playfair_Display'] text-[#FBFAF8] text-5xl font-bold mb-2.5">
            Register Now<span className="text-[#FFE2A0]">.</span>
          </h1>
          <p className="text-[#FBFAF8] text-s">Create your account to get started.</p>
        </div>

        {/* First Name & Last Name */}
        <div className="translate-x-180 mt-45 absolute flex gap-4">
          <div className="flex flex-col gap-2 w-73">
            <label className="text-[#FBFAF8] text-md">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="eg. Juan"
              className="bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg border-none focus:ring-1 focus:ring-white outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-2 w-73">
            <label className="text-[#FBFAF8] text-md">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="eg. Dela Cruz"
              className="bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg border-none focus:ring-1 focus:ring-white outline-none transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="translate-x-180 mt-70 absolute">
          <div className="flex flex-col gap-2 w-150">
            <label className="text-[#FBFAF8] text-md">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="eg. juan.dc@gmail.com"
              className="bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg border-none focus:ring-1 focus:ring-white outline-none transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="translate-x-180 mt-95 absolute">
          <div className="flex flex-col gap-2 w-150">
            <label className="text-[#FBFAF8] text-md">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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

            {/* Error — inline, no overlap */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                <span className="text-red-400 text-sm">⚠</span>
                <p className="text-red-400 text-xs leading-snug">
                  Password must include uppercase, lowercase, number & special character.
                </p>
              </div>
            )}

            {/* Success — inline */}
            {success && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                <span className="text-green-400 text-sm">✓</span>
                <p className="text-green-400 text-xs">{success}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sign Up Button */}
        <div className="translate-x-180 absolute" style={{ marginTop: error || success ? '34rem' : '31.25rem' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-3 bg-[#FFE2A0] hover:bg-[#fcd789] active:bg-[#f5cc70] w-150 rounded-lg cursor-pointer font-semibold text-[#222222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </div>

        {/* Already have an account */}
        <div className="translate-x-180 absolute" style={{ marginTop: error || success ? '38rem' : '35.25rem' }}>
          <p className="text-[#FBFAF8]">
            Already have an account?{' '}
            <Link to="/Signin">
              <span className="text-[#FFE2A0] cursor-pointer hover:underline"> Sign in</span>.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;