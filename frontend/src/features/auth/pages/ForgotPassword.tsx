import { useState } from 'react';
import { Link } from 'react-router-dom';
import bg from '@assets/images/bg.png';
import { supabase } from '@/lib/supabase';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendLink = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (supabaseError) throw supabaseError;
      setSent(true);
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
          Reset Your <br />
          <span className="text-[#FFE2A0]">Password</span>
        </h1>
      </div>

      {/* Right side */}
      <div className="w-1/2 bg-[#1a1a1a] flex items-center justify-center px-16">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="font-['Playfair_Display'] text-white text-3xl font-bold mb-2">
                Check your inbox.
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                We sent a password reset link to <span className="text-[#FFE2A0]">{email}</span>. 
                Click the link in the email to reset your password.
              </p>
              <p className="text-gray-400 text-sm">
                Didn't receive it?{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-[#FFE2A0] hover:underline cursor-pointer"
                >
                  Try again.
                </button>
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
                Forgot password?
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <div className="mb-6">
                <label className="text-gray-300 text-sm mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendLink()}
                  placeholder="eg. juan.dc@gmail.com"
                  className="w-full bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-[#FFE2A0]"
                />
              </div>

              <button
                onClick={handleSendLink}
                disabled={loading || !email}
                className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'SEND RESET LINK'}
              </button>

              {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}

              <p className="text-gray-400 text-sm text-center mt-4">
                Remember your password?{' '}
                <Link to="/sign-in" className="text-[#FFE2A0] hover:underline">
                  Sign in.
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;