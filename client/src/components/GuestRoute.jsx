import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePathForRole } from '../utils/roleHome';

/** Login and register only — send signed-in users to their home. */
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading…</div>;
  }

  if (user) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return children;
}