import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import bg from '@assets/images/bg.png';

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
      // Already verified or direct visit
      setStatus('success');
    }
  }, [searchParams]);

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
          Welcome to <br />
          <span className="text-[#FFE2A0]">Salangi</span>
        </h1>
      </div>

      <div className="w-1/2 bg-[#1a1a1a] flex items-center justify-center px-16">
        <div className="w-full max-w-md text-center">
          {status === 'loading' && (
            <>
              <div className="text-6xl mb-6">⏳</div>
              <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
                Verifying...
              </h2>
              <p className="text-gray-400 text-sm">Please wait while we confirm your email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-6">✅</div>
              <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Link
                to="/sign-in"
                className="w-full block bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors"
              >
                SIGN IN NOW
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-6">❌</div>
              <h2 className="font-['Playfair_Display'] text-white text-4xl font-bold mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                The link may have expired or already been used. Please register again.
              </p>
              <Link
                to="/sign-up"
                className="w-full block bg-[#FFE2A0] hover:bg-[#fcd789] text-[#222222] font-semibold py-3 rounded-lg transition-colors"
              >
                REGISTER AGAIN
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailConfirmed;