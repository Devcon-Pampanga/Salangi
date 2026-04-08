import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

//bg
import bg from '@assets/images/bg.png';

//icons
import verify from '@assets/png-files/verify.png';

function EmailConfirmed() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (tokenHash && type) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })
        .then(({ error }) => {
          setStatus(error ? 'error' : 'success');
        });
    } else {
      setStatus('success');
    }
  }, [searchParams]);

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
          Welcome to <br />
          <span className="text-[#FFE2A0]">Salangi</span>
        </h1>
      </div>

      {/* Right side — Status Message */}
      <div className="w-1/2 flex items-center justify-center px-16 z-10">
        <div className="w-full max-w-md text-center">
          {status === 'loading' && (
            <div className="motion-preset-fade">
              <div className="text-6xl mb-6">⏳</div>
              <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
                Verifying...
              </h2>
              <p className="text-gray-400 text-sm">Please wait while we confirm your email.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="motion-preset-bounce">
              <div className="text-6xl mb-6">
                <img src = {verify} />
              </div>
              <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Link
                to="/sign-in"
                className="w-full block bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors shadow-lg"
              >
                SIGN IN NOW
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="motion-preset-shake">
              <div className="text-6xl mb-6">❌</div>
              <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                The link may have expired or already been used.
              </p>
              <Link
                to="/sign-up"
                className="w-full block bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors"
              >
                REGISTER AGAIN
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailConfirmed;