import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bg from '@assets/images/bg.png';
import { Eye, EyeOff } from 'lucide-react';

const ADMIN_PASSWORD = 'salangi-admin-2024';

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div
        className="w-1/2 relative flex items-end p-12"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 className="font-['Playfair_Display'] text-white text-6xl font-bold leading-tight">
          Admin <br />
          <span className="text-[#FFE2A0]">Portal</span>
        </h1>
      </div>

      <div className="w-1/2 bg-[#1a1a1a] flex items-center justify-center px-16">
        <div className="w-full max-w-md">
          <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
            Admin Login.
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Enter the admin password to access the dashboard.
          </p>

          <div className="mb-6">
            <label className="text-gray-300 text-sm mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
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
            onClick={handleLogin}
            className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors"
          >
            ENTER DASHBOARD
          </button>

          {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;