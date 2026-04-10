import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ROUTES } from './paths';

interface ProtectedRouteProps {
  session: Session | null;
  redirectPath: string;
  children: React.ReactNode;
  requireBusiness?: boolean;
}

function ProtectedRoute({ session, redirectPath, children, requireBusiness = false }: ProtectedRouteProps) {
  const [checking, setChecking] = useState(requireBusiness);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!requireBusiness || !session) {
      setChecking(false);
      return;
    }

    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setAllowed(data?.role === 'business');
        setChecking(false);
      });
  }, [session, requireBusiness]);

  if (!session) return <Navigate to={redirectPath} replace />;
  if (checking) return <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">Loading...</div>;
  if (requireBusiness && !allowed) return <Navigate to={ROUTES.BUSINESS_SIGNIN} replace />;

  return <>{children}</>;
}

export default ProtectedRoute;