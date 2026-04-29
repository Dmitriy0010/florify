import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  ClipboardList,
  Package,
  User,
  LayoutGrid,
  Truck,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useStoreStore } from '../store/useStoreStore';
import { useOfflineStore } from '../store/offlineStore';
import { initNetworkSync } from '../lib/network';
import { storeApi } from '../lib/storeApi';

const NAV_ITEMS = [
  { to: '/pos',       icon: ShoppingBag,  label: 'Терминал'  },
  { to: '/orders',    icon: ClipboardList, label: 'Заказы'    },
  { to: '/inventory', icon: Package,       label: 'Склад'     },
  { to: '/showcase',  icon: LayoutGrid,    label: 'Витрина'   },
  { to: '/courier',   icon: Truck,         label: 'Доставка'  },
  { to: '/profile',   icon: User,          label: 'Профиль'   },
];

export function AppShell() {
  const { displayName } = useAuthStore();
  const { currentStoreId, currentStoreName, setCurrentStore } = useStoreStore();
  const { isOnline } = useOfflineStore();

  const storesQuery = useQuery({
    queryKey: ['stores'],
    queryFn: storeApi.getAll,
    enabled: isOnline,
  });

  useEffect(() => {
    if (storesQuery.data && storesQuery.data.length > 0 && !currentStoreId) {
      const first = storesQuery.data[0];
      setCurrentStore(first.id, first.name);
    }
  }, [storesQuery.data, currentStoreId, setCurrentStore]);

  useEffect(() => {
    initNetworkSync();
  }, []);

  return (
    <div className="app-shell">
      {/* ── HEADER ─────────────────────────────────── */}
      <header className="app-header">
        {/* Left: logo + store */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--color-brand)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', flexShrink: 0,
          }}>
            <ShoppingBag size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              FLORIFY
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', marginTop: 2, lineHeight: 1 }}
                 className={isOnline ? 'text-brand' : 'text-error'}>
              {currentStoreName
                ? `${currentStoreName.toUpperCase()} • ${isOnline ? 'ОНЛАЙН' : 'ОФЛАЙН'}`
                : isOnline ? 'ОНЛАЙН' : 'ОФЛАЙН'}
            </div>
          </div>
        </div>

        {/* Right: offline indicator + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isOnline && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#FEF2F2', border: '1px solid #FEE2E2',
              borderRadius: 20, padding: '4px 10px',
            }}>
              <WifiOff size={12} color="#EF4444" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444' }}>Офлайн</span>
            </div>
          )}
          {storesQuery.isFetching && (
            <RefreshCw size={14} color="var(--color-text-tertiary)" className="spin" />
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 20,
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--color-brand-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: 'var(--color-brand)',
            }}>
              {displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {displayName || 'Профиль'}
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN ──────────────────────────────────── */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* ── BOTTOM TAB BAR ────────────────────────── */}
      <nav className="app-tabbar">
        {NAV_ITEMS.map(item => (
          <TabItem key={item.to} {...item} />
        ))}
      </nav>
    </div>
  );
}

function TabItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <NavLink
      to={to}
      className={`tab-item${isActive ? ' active' : ''}`}
      style={{ textDecoration: 'none' }}
    >
      <div className="tab-item-icon">
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span className="tab-item-label">{label}</span>
    </NavLink>
  );
}
