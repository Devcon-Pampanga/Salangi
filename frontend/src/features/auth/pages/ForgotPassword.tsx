import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

//bg
import bg from '@assets/images/bg.png';

//icons
import inbox from '@assets/png-files/inbox.png'

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
    <div className="relative min-h-screen bg-[#222222] lg:bg-transparent overflow-x-hidden flex items-center">
      {/* Background Image — desktop only */}
      <div 
        className="absolute inset-0 hidden lg:block"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Dark Overlay — desktop only */}
      <div 
        className="absolute inset-0 hidden lg:block"
        style={{
          backgroundImage: `linear-gradient(to right, transparent -11%, rgba(34, 34, 34, 0.9) 30%, #222222 50%)`,
        }}
      />

      {/* Dashed curve decoration - hidden on mobile */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" preserveAspectRatio="none">
        <path
          d="M 400 0 C 200 200, 600 400, 400 800"
          transform="translate(200, 0)"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeDasharray="8 8"
          className="opacity-20"
        />
      </svg>

      {/* Brighter concentrated top glow */}
      <div className="absolute top-0 left-0 right-0 h-80 lg:h-[500px] bg-radial from-[#FFE2A0]/60 via-transparent to-transparent blur-3xl opacity-100 lg:opacity-70 pointer-events-none -translate-y-1/2" />

      <div className="w-full relative z-10">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-16 grid grid-cols-1 lg:grid-cols-2 min-h-screen gap-12 lg:gap-20">
          
          {/* Left Side — Headline (Desktop Only) */}
          <div className="hidden lg:flex flex-col justify-end pb-24 xl:pb-32 motion-preset-slide-right motion-duration-800">
            <h1 className="font-['Playfair_Display'] text-[60px] xl:text-[80px] font-bold text-[#FBFAF8] leading-tight max-w-xl">
              Reset Your <br />
              <span className="text-[#FFE2A0]">Password.</span>
            </h1>
          </div>

          {/* Right Side — Form */}
          <div className="w-full max-w-lg mx-auto lg:ml-auto flex flex-col justify-center py-20 lg:py-0 motion-preset-slide-left motion-duration-800">
            {sent ? (
              <div className="text-left">
                <div className="flex justify-start items-center mb-8">
                  <img src={inbox} className="w-16 h-16 lg:w-20 lg:h-20" alt="Inbox" />
                </div>

                <h2 className="font-['Playfair_Display'] text-white text-3xl sm:text-4xl font-bold mb-4">
                  Check your inbox<span className="text-[#FFE2A0]">.</span>
                </h2>
                <p className="text-[#FBFAF8]/70 text-sm lg:text-base mb-8 leading-relaxed">
                  We sent a password reset link to <span className="text-[#FFE2A0] font-semibold">{email}</span>. 
                  Click the link in the email to reset your password.
                </p>
                <p className="text-[#FBFAF8]/50 text-sm">
                  Didn't receive it?{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="text-[#FFE2A0] font-semibold hover:underline cursor-pointer"
                  >
                    Try again.
                  </button>
                </p>
              </div>
            ) : (
              <div>
                {/* Heading */}
                <div className="mb-8 text-left">
                  <h1 className="font-['Playfair_Display'] text-[#FBFAF8] text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
                    Forgot password<span className="text-[#FFE2A0]">?</span>
                  </h1>
                  <p className="text-[#FBFAF8]/70 text-xs sm:text-sm lg:text-base">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[#FBFAF8]/70 text-xs sm:text-sm mb-2 block font-medium">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendLink()}
                      placeholder="eg. juan.dc@gmail.com"
                      className="w-full bg-[#1A1A1A] border-2 border-[#373737] text-white placeholder-[#FBFAF8]/20 px-4 sm:px-5 py-3 sm:py-4 rounded-xl outline-none focus:border-[#FFE2A0]/50 transition-all text-sm sm:text-base"
                    />
                  </div>

                  <button
                    onClick={handleSendLink}
                    disabled={loading || !email}
                    className="w-full bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-bold py-3 sm:py-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-[#FFE2A0]/10 mt-4 active:scale-[0.98] text-sm sm:text-base mb-6"
                  >
                    {loading ? 'Sending link...' : 'Send Reset Link'}
                  </button>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mt-3">
                      <span className="text-red-400 text-sm">⚠</span>
                      <p className="text-red-400 text-xs leading-snug">{error}</p>
                    </div>
                  )}

                  <p className="text-[#FBFAF8]/60 text-left text-sm mt-6">
                    Remember your password?{' '}
                    <Link to="/Signin">
                      <span className="text-[#FFE2A0] font-semibold cursor-pointer hover:underline">Sign in</span>
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;