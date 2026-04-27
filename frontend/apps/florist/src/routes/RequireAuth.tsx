import { Navigate, Outlet } from 'react-router-dom';

interface RequireAuthProps {
  allowedRoles?: string[];
}

export function RequireAuth({ allowedRoles }: RequireAuthProps) {
  // В реальности токен берется из localStorage или Zustand стора
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role') || 'FLORIST';

  if (!token) {
    // Пользователь не авторизован -> редирект на экран входа
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Пользователь авторизован, но у него нет прав на этот маршрут
    return <div>Доступ запрещен. У вас нет нужной роли.</div>;
  }

  return <Outlet />;
}

export default RequireAuth;
