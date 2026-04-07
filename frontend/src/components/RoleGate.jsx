import { useAuth } from '../context/AuthContext';

/**
 * Show children only if current user role is in `roles`.
 */
export function RoleGate({ roles = [], children, fallback = null }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return fallback;
  return children;
}
