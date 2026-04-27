import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import { initNetworkSync } from '../lib/network';
import { flushOfflineQueue } from '../lib/offlineQueue';

export function AppShell() {
  const displayName = useAuthStore((state) => state.displayName);
  const { isOnline, pendingCount, lastSyncAt, isFlushing, setOnline } = useOfflineStore();
  const isFetching = useIsFetching({ queryKey: ['kanban'] }) > 0;

  useEffect(() => {
    initNetworkSync();
  }, []);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [setOnline]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">🌿 Florify</div>
        <div className="topbar-right">
          <span>{displayName || 'Флорист'}</span>
          <span className={`network-pill ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Онлайн' : 'Офлайн'}
          </span>
          {isFetching ? <span className="refresh-dot" aria-label="refreshing" /> : null}
          {pendingCount > 0 ? <span className="pending-pill">{pendingCount} ожидают</span> : null}
          {isFlushing ? <span className="pending-pill">Синхронизация...</span> : null}
        </div>
      </header>

      {!isOnline ? (
        <div className="offline-banner">Офлайн-режим. Изменения отправятся автоматически при сети.</div>
      ) : null}
      {isOnline && pendingCount > 0 ? (
        <div className="offline-banner">
          Очередь ждёт отправки. <button className="link-btn" onClick={() => void flushOfflineQueue()}>Синхронизировать</button>
        </div>
      ) : null}
      {lastSyncAt ? (
        <div className="sync-info">Последняя синхронизация: {lastSyncAt.toLocaleTimeString()}</div>
      ) : null}

      <main className="content">
        <Outlet />
      </main>

      <nav className="tabbar">
        <NavLink to="/orders" className="tab-link">
          Заказы
        </NavLink>
        <NavLink to="/inventory" className="tab-link">
          Склад
        </NavLink>
        <NavLink to="/profile" className="tab-link">
          Профиль
        </NavLink>
      </nav>
    </div>
  );
}
