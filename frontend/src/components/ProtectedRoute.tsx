import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const [checking, setChecking] = useState(!token);
  const [allowed, setAllowed] = useState(!!token);

  useEffect(() => {
    if (token) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Store user info from OAuth session
        const user = data.session.user;
        const nameParts = (user.user_metadata?.full_name ?? '').split(' ');
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('user', JSON.stringify({
          user_id: user.id,
          first_name: nameParts[0] ?? '',
          last_name: nameParts.slice(1).join(' ') ?? '',
          email: user.email,
          profile_pic: user.user_metadata?.avatar_url ?? null,
        }));
        setAllowed(true);
      } else {
        setAllowed(false);
      }
      setChecking(false);
    });
  }, [token]);

  if (checking) return null; // or a loading spinner

  if (!allowed) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;