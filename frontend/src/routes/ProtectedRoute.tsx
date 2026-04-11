import { Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { ROUTES } from './paths';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  session: Session | null;
  role: string | null;
  redirectPath: string;
  children: React.ReactNode;
  requireBusiness?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProtectedRoute no longer fetches the role itself.
 * Role is fetched once in AuthContext and passed in as a prop,
 * eliminating the per-mount Supabase query and the race condition
 * where an outdated role caused wrong redirects after upgrading.
 */
function ProtectedRoute({
  session,
  role,
  redirectPath,
  children,
  requireBusiness = false,
}: ProtectedRouteProps) {

  // Not logged in → send to sign-in / business-signin
  if (!session) {
    return <Navigate to={redirectPath} replace />;
  }

  // Role still loading (null) — show spinner rather than flash a wrong redirect
  if (requireBusiness && role === null) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Logged in but not a business account → send to upgrade page
  if (requireBusiness && role !== 'business') {
    return <Navigate to={ROUTES.UPGRADE_TO_BUSINESS} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;