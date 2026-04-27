import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { accessToken, roles } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = roles.some((role) => allowedRoles.includes(role));
  if (!hasRole) {
    return <div className="center-message">Доступ запрещен для вашей роли</div>;
  }

  return <Outlet />;
}
