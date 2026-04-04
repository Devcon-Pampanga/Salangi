import { Navigate } from 'react-router-dom';
import { ROUTES } from './paths';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;