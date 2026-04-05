import { Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  session: Session | null;
  redirectPath: string;
  children: React.ReactNode;
}

function ProtectedRoute({ session, redirectPath, children }: ProtectedRouteProps) {
  if (!session) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;