import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from '../../lib/api';
import { Loader2 } from 'lucide-react';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accessToken, refreshToken, user, setAuth, logout } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(!user && !!accessToken);

  useEffect(() => {
    const syncProfile = async () => {
      if (accessToken && !user) {
        try {
          const response = await AuthService.me();
          setAuth(accessToken, refreshToken || '', response.data as any);
        } catch (err) {
          console.error('Session sync failed', err);
          logout();
        } finally {
          setIsSyncing(false);
        }
      }
    };
    syncProfile();
  }, [accessToken, refreshToken, user, setAuth, logout]);

  if (!accessToken && !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  if (isSyncing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8F8F6]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-brand)] mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Синхронизация профиля...</p>
      </div>
    );
  }

  // Optional: Double check if user has standard admin roles
  if (user && !user.roles.some(r => r === 'ADMIN' || r === 'OWNER' || r === 'CASHIER')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8F8F6]">
        <h1 className="text-2xl font-black mb-2">Доступ запрещен</h1>
        <p className="text-neutral-500 mb-6">У вас нет прав администратора.</p>
        <button onClick={() => { useAuthStore.getState().logout() }} className="px-4 py-2 bg-neutral-900 text-white rounded-lg">Выйти</button>
      </div>
    );
  }

  return <>{children}</>;
}
