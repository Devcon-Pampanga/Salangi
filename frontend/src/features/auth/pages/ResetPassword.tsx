import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bg from '@assets/images/bg.png';
import { supabase } from '@/lib/supabase';

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Recovery mode active
      }
    });
  }, []);

  const validatePassword = (pw: string): string => {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-z]/.test(pw)) return 'Password must include at least one lowercase letter.';
  if (!/[A-Z]/.test(pw)) return 'Password must include at least one uppercase letter.';
  if (!/[0-9]/.test(pw)) return 'Password must include at least one number.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw)) return 'Password must include at least one special character.';
  return '';
};

const handleResetPassword = async () => {
  setError('');
  const validationError = validatePassword(password);
  if (validationError) {
    setError(validationError);
    return;
  }
  if (password !== confirmPassword) {
    setError('Passwords do not match. Please try again.');
    return;
  }
  setLoading(true);
  try {
    const { error: supabaseError } = await supabase.auth.updateUser({ password });
    if (supabaseError) throw supabaseError;
    setSuccess(true);
    setTimeout(() => navigate('/sign-in'), 3000);
  } catch (err: any) {
    setError(err.message?.charAt(0).toUpperCase() + err.message?.slice(1) || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-screen overflow-hidden relative flex"
      style={{
        backgroundImage: `linear-gradient(to right, transparent -11%, rgba(26, 26, 26, 0.9), #1a1a1a 50%), url(${bg})`,
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
      <div className="absolute w-190 h-170 translate-x-113 -mt-97 bg-radial from-[#FFE2A0]/80 via-[#FFE2A0]/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Left side — Headline */}
      <div className="w-1/2 relative flex items-end p-20 pb-32 z-10">
        <h1 className="font-['Playfair_Display'] text-white text-7xl font-bold leading-tight">
          Set a New <br />
          <span className="text-[#FFE2A0]">Password</span>
        </h1>
      </div>

      {/* Right side — Form */}
      <div className="w-1/2 flex items-center justify-center px-16 z-10">
        <div className="w-full max-w-md">
          {success ? (
            <div className="text-center motion-preset-fade">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-['Playfair_Display'] text-white text-3xl font-bold mb-2">
                Password Updated!
              </h2>
              <p className="text-gray-400 text-sm">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <div className="motion-preset-slide-left">
              <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
                New password.
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                Choose a strong password for your account.
              </p>

              <div className="mb-4">
                <label className="text-gray-300 text-sm mb-1 block">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0] border-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-gray-300 text-sm mb-1 block">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                    placeholder="Repeat new password"
                    className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0] border-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading || !password || !confirmPassword}
                className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Updating...' : 'UPDATE PASSWORD'}
              </button>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mt-3">
                  <span className="text-red-400 text-sm">⚠</span>
                  <p className="text-red-400 text-xs leading-snug">
                    {error.charAt(0).toUpperCase() + error.slice(1)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;