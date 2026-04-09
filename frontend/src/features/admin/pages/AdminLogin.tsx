import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bg from '@assets/images/bg.png';
import { Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '../../../routes/paths';

const ADMIN_PASSWORD = 'salangi-admin-2024';

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      navigate(ROUTES.ADMIN_DASHBOARD);
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div
      className="min-h-screen overflow-hidden relative"
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
          Admin <span className="text-[#FFE2A0]">Portal</span>
        </h1>
      </div>

      {/* Right — form */}
      <div className="motion-preset-slide-left motion-duration-800 ml-15 mt-10">

        {/* Heading */}
        <div className="ml-180 mt-25 absolute">
          <h1 className="font-['Playfair_Display'] text-[#FBFAF8] text-5xl font-bold mb-2.5">
            Admin Login<span className="text-[#FFE2A0]">.</span>
          </h1>
          <p className="text-[#FBFAF8] text-s">Enter the admin password to access the dashboard.</p>
        </div>

        {/* Password */}
        <div className="translate-x-180 mt-53 absolute">
          <div className="flex flex-col gap-2 w-120">
            <label className="text-[#FBFAF8] text-md">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
          <div className="translate-x-180 mt-79 absolute ml-50">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Login Button */}
        <div className="translate-x-180 mt-87 absolute">
          <button
            onClick={handleLogin}
            className="px-4 py-3 bg-[#FFE2A0] hover:bg-[#fcd789] active:bg-[#f5cc70] w-120 rounded-lg cursor-pointer font-semibold text-[#222222] transition-colors"
          >
            Enter Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;