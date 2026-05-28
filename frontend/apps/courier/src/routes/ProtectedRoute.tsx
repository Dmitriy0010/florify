import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute() {
  const { accessToken, roles } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = roles.some((role) => ['COURIER', 'ADMIN', 'OWNER'].includes(role));
  if (!hasRole) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--color-bg-canvas)',
        color: 'var(--color-text-secondary)', fontSize: 16, fontWeight: 600,
        textAlign: 'center', padding: 32,
      }}>
        Доступ запрещён. Требуется роль COURIER.
      </div>
    );
  }

  return <Outlet />;
}
