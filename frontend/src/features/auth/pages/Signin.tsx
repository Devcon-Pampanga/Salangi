import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import axios from 'axios';
import { ROUTES } from '../../../routes/paths';

//bg
import bg from '@assets/images/bg.png';

//icons
import salangiLogo from '@assets/png-files/salangi-logo.png'

function Signin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [showTos, setShowTos] = useState(false);
  const [tosError, setTosError] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!tosAccepted) {
      setTosError(true);
      return;
    }
    setTosError(false);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSignIn = async () => {
    setError('');
    if (!tosAccepted) {
      setTosError(true);
      return;
    }
    setTosError(false);
    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({ email, password });
      if (supabaseError) throw supabaseError;

      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        setError('Please verify your email before signing in. Check your inbox.');
        return;
      }

      // Register session on backend — invalidates any concurrent sessions
      try {
        const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
        const res = await axios.post(
          `${apiUrl}/api/auth/session-login`,
          {},
          { headers: { Authorization: `Bearer ${data.session!.access_token}` } }
        );
        localStorage.setItem('session_token', res.data.session_token);
      } catch (sessionErr) {
        console.warn('Session registration failed:', sessionErr);
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('user_id', data.user.id)
        .single();

      if (userData?.is_admin) {
        navigate(ROUTES.ADMIN_DASHBOARD);
        return;
      }

      const meta = data.user.user_metadata;
      localStorage.setItem('user', JSON.stringify({
        user_id:     data.user.id,
        first_name:  meta?.first_name ?? meta?.full_name?.split(' ')[0] ?? '',
        last_name:   meta?.last_name  ?? meta?.full_name?.split(' ')[1] ?? '',
        email:       data.user.email,
        profile_pic: meta?.avatar_url ?? null,
      }));

      navigate('/home-page');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center lg:justify-start overflow-x-hidden overflow-y-auto bg-[#222222]">
      {/* Background Image - Desktop Only */}
      <div 
        className="absolute inset-0 hidden lg:block bg-cover bg-center opacity-100"
        style={{ backgroundImage: `url(${bg})` }}
      />
      
      {/* Dynamic gradient for desktop */}
      <div 
        className="absolute inset-0 hidden lg:block"
        style={{
          backgroundImage: `linear-gradient(to right, transparent -11%, rgba(34, 34, 34, 0.9) 30%, #222222 50%)`,
        }}
      />

      {/* Dashed curve decoration */}
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

      {/* Header with Actions and Logo on the right */}
      <div className="absolute top-0 left-0 right-0 px-4 lg:px-8 py-6 flex items-center justify-end gap-4 lg:gap-6 z-50">
        
        <img src={salangiLogo} alt="Salangi Logo" className="w-10 h-10 lg:w-16 lg:h-16 shrink-0" />
      </div>

      {/* Brighter concentrated top glow for all screen sizes */}
      <div className="absolute top-0 left-0 right-0 h-80 lg:h-[500px] bg-radial from-[#FFE2A0]/60 via-transparent to-transparent blur-3xl opacity-100 lg:opacity-70 pointer-events-none -translate-y-1/2" />

      <div className="w-full relative z-10">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-16 grid grid-cols-1 lg:grid-cols-2 min-h-screen gap-12 lg:gap-20">
          
          {/* Left Side — Headline (Desktop Only) */}
          <div className="hidden lg:flex flex-col justify-end pb-24 xl:pb-32 motion-preset-slide-right motion-duration-800">
            <h1 className="font-['Playfair_Display'] text-[60px] xl:text-[80px] font-bold text-[#FBFAF8] leading-tight max-w-xl">
              Continue your Pampanga <span className="text-[#FFE2A0]">Journey</span>
            </h1>
          </div>

          {/* Right Side — Form */}
          <div className="w-full max-w-md mx-auto lg:ml-auto flex flex-col justify-center py-24 lg:py-0 motion-preset-slide-left motion-duration-800">
            
            {/* Heading */}
            <div className="mb-6 lg:mb-10 text-left pt-6 lg:pt-0">
              <h1 className="font-['Playfair_Display'] text-[#FBFAF8] text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
                Sign in<span className="text-[#FFE2A0]">.</span>
              </h1>
              <p className="text-[#FBFAF8]/70 text-xs sm:text-sm lg:text-base">Continue exploring local businesses and experiences.</p>
            </div>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[#FBFAF8] text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                  placeholder="juan.dc@gmail.com"
                  className="bg-[#2E2E2E]/80 text-white placeholder-gray-500 px-4 py-3.5 rounded-xl border border-white/5 focus:ring-1 focus:ring-[#FFE2A0] outline-none transition-all w-full"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[#FBFAF8] text-sm font-medium">Password</label>
                  <Link to="/forgot-password" title="Forgot password" className="text-[#FFE2A0] text-xs hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                    placeholder="**********"
                    className="w-full bg-[#2E2E2E]/80 text-white placeholder-gray-500 px-4 py-3.5 rounded-xl border border-white/5 focus:ring-1 focus:ring-[#FFE2A0] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Status Messages */}
                {error && (
                  <div className="mt-2 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    <p className="text-red-400 text-xs leading-normal">{error}</p>
                  </div>
                )}
              </div>

              {/* Action Section */}
              <div className="pt-4 space-y-6">
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full py-4 bg-[#FFE2A0] hover:bg-[#fcd789] active:bg-[#f5cc70] rounded-xl cursor-pointer font-bold text-[#222222] text-base transition-all shadow-lg shadow-amber-950/20 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[#FBFAF8]/30 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* ToS Checkbox */}
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={tosAccepted}
                        onChange={e => { setTosAccepted(e.target.checked); if (e.target.checked) setTosError(false); }}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${tosAccepted ? 'bg-[#FFE2A0] border-[#FFE2A0]' : tosError ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-[#2E2E2E]/80'}`}>
                        {tosAccepted && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-[#FBFAF8]/60 text-xs leading-relaxed">
                      I agree to Salangi's{' '}
                      <button
                        type="button"
                        onClick={() => setShowTos(true)}
                        className="text-[#FFE2A0] underline underline-offset-2 hover:text-[#fcd789] transition-colors font-medium"
                      >
                        Terms of Service
                      </button>
                      , including the right for Salangi to feature my account or listed business in social media marketing.
                    </span>
                  </label>
                  {tosError && (
                    <p className="text-red-400 text-xs pl-7">Please accept the Terms of Service to continue.</p>
                  )}
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  type="button"
                  className={`w-full py-3.5 border rounded-xl cursor-pointer font-semibold text-[#FBFAF8] text-sm transition-all flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] ${tosAccepted ? 'bg-[#2E2E2E]/80 hover:bg-[#3a3a3a] border-white/10' : 'bg-[#2E2E2E]/40 border-white/5 opacity-60'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.5 35.7 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
                  Continue with Google
                </button>

                {/* ToS Modal */}
                {showTos && (
                  <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowTos(false)}>
                    <div
                      className="bg-[#1A1612] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                        <div>
                          <h3 className="text-[#FBFAF8] font-['Playfair_Display'] text-lg font-bold">Terms of Service</h3>
                          <p className="text-[#FBFAF8]/40 text-xs mt-0.5">Effective May 17, 2026 · Version 1.0</p>
                        </div>
                        <button onClick={() => setShowTos(false)} className="text-[#FBFAF8]/40 hover:text-[#FBFAF8] transition-colors p-1">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <div className="overflow-y-auto px-5 py-4 space-y-5 text-[#FBFAF8]/60 text-xs leading-relaxed">
                        <div className="bg-[#C85B28]/10 border border-[#C85B28]/20 rounded-xl px-4 py-3">
                          <p className="text-[#FFE2A0] text-xs"><span className="font-semibold">Summary:</span> By signing in, you agree to be respectful, honest, and not misuse the platform. Business owners are responsible for the accuracy of their listings. Salangi may feature your business in social media marketing.</p>
                        </div>
                        {[
                          { num: '01', title: 'Acceptance of Terms', body: 'By accessing or using Salangi, you agree to be bound by these Terms of Service. We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.' },
                          { num: '02', title: 'Description of Service', body: 'Salangi is a community discovery platform that helps locals and tourists explore authentic Kapampangan food, crafts, cafés, events, and local businesses across Pampanga, Philippines.' },
                          { num: '03', title: 'User Accounts', body: 'You agree to provide accurate information, maintain the security of your credentials, and be responsible for all activity that occurs under your account. We reserve the right to suspend accounts that violate these Terms.' },
                          { num: '04', title: 'Business Listings', body: 'Business owners must ensure all listing information is accurate and up to date. Listings are subject to admin review and approval. Salangi reserves the right to remove listings containing false or harmful information.' },
                          { num: '05', title: 'User Content', body: 'By submitting reviews, photos, or other content, you grant Salangi a non-exclusive, royalty-free license to use and display that content on the Platform. Reviews must reflect genuine, firsthand experiences.' },
                          { num: '06', title: 'Prohibited Conduct', body: 'You agree not to submit false reviews, harass other users, use the Platform for unlawful purposes, attempt unauthorized access, scrape data without consent, post spam, impersonate others, or interfere with the Platform.' },
                          { num: '07', title: 'Privacy & Data', body: 'Salangi collects account data, session tokens, and aggregated analytics. We do not sell your personal data to third parties.' },
                          { num: '08', title: 'Social Media Marketing', body: 'By listing your business on Salangi, you grant Salangi the right to feature your business — including its name, photos, description, and location — in social media marketing on platforms including Facebook, Instagram, and TikTok. You may contact us to opt out at any time.' },
                          { num: '09', title: 'Disclaimers & Liability', body: 'Salangi is provided "as is." We make no warranties regarding the accuracy of listings. These Terms are governed by the laws of the Republic of the Philippines.' },
                        ].map(s => (
                          <div key={s.num}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-medium text-[#C85B28] bg-[#C85B28]/10 border border-[#C85B28]/20 rounded px-1.5 py-0.5">{s.num}</span>
                              <span className="text-[#FBFAF8]/80 font-medium text-xs">{s.title}</span>
                            </div>
                            <p>{s.body}</p>
                          </div>
                        ))}
                        <p className="text-[#FBFAF8]/30 text-center text-[10px] pb-1">Built with ❤️ for authentic Kapampangan local businesses · Pampanga, Philippines</p>
                      </div>
                      <div className="px-5 py-4 border-t border-white/10 shrink-0">
                        <button
                          onClick={() => { setTosAccepted(true); setTosError(false); setShowTos(false); }}
                          className="w-full py-3 bg-[#FFE2A0] hover:bg-[#fcd789] active:bg-[#f5cc70] rounded-xl font-bold text-[#222222] text-sm transition-all"
                        >
                          I Accept the Terms of Service
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[#FBFAF8]/60 text-left text-sm">
                  Don't have an account?{' '}
                  <Link to="/sign-up">
                    <span className="text-[#FFE2A0] font-semibold cursor-pointer hover:underline">Sign up</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;