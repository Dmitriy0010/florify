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
  PlayCircle,
  Clock,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useStoreStore } from '../store/useStoreStore';
import { useOfflineStore } from '../store/offlineStore';
import { useShiftStore } from '../store/shiftStore';
import { initNetworkSync } from '../lib/network';
import { storeApi } from '../lib/storeApi';
import { timesheetApi } from '../lib/timesheetApi';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const NAV_ITEMS = [
  { to: '/pos',       icon: ShoppingBag,  label: 'Терминал'  },
  { to: '/orders',    icon: ClipboardList, label: 'Заказы'    },
  { to: '/inventory', icon: Package,       label: 'Склад'     },
  { to: '/showcase',  icon: LayoutGrid,    label: 'Витрина'   },
  { to: '/courier',   icon: Truck,         label: 'Доставка'  },
  { to: '/profile',   icon: User,          label: 'Профиль'   },
];

export function AppShell() {
  const { displayName, userId } = useAuthStore();
  const { currentStoreId, currentStoreName, setCurrentStore } = useStoreStore();
  const { isOnline } = useOfflineStore();
  const { isShiftOpen, shiftStart: shiftStartIso, openShift } = useShiftStore();

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

  const startShiftMutation = useMutation({
    mutationFn: () =>
      timesheetApi.checkin(userId ?? '').catch(() => ({ time: new Date().toISOString() })),
    onSuccess: () => {
      openShift(new Date().toISOString());
    },
  });

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

        {/* Right: shift badge + offline indicator + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isShiftOpen && shiftStartIso && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--color-brand-light)',
              border: '1px solid var(--color-brand)',
              borderRadius: 20, padding: '4px 12px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-brand)' }}>
                Смена с {format(new Date(shiftStartIso), 'HH:mm', { locale: ru })}
              </span>
            </div>
          )}
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
        {!isShiftOpen ? (
          <ShiftGate
            displayName={displayName}
            isPending={startShiftMutation.isPending}
            onStartShift={() => startShiftMutation.mutate()}
          />
        ) : (
          <Outlet />
        )}
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

/* ── Shift Gate Screen ─────────────────────────────────────────── */
function ShiftGate({
  displayName,
  isPending,
  onStartShift,
}: {
  displayName: string | null;
  isPending: boolean;
  onStartShift: () => void;
}) {
  const today = format(new Date(), 'EEEE, d MMMM', { locale: ru });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 24,
      background: 'var(--color-bg)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '40px 32px',
        maxWidth: 380,
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72,
          borderRadius: 20,
          background: 'var(--color-brand-light)',
          border: '2px solid var(--color-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: 'var(--color-brand)',
          marginBottom: 8,
        }}>
          {displayName?.[0]?.toUpperCase() || 'F'}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          {displayName || 'Флорист'}
        </h2>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'capitalize', margin: 0 }}>
          {today}
        </p>

        <div style={{
          width: '100%', height: 1,
          background: 'var(--color-border)',
          margin: '16px 0',
        }} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          background: '#FFF8EB',
          border: '1px solid #F59E0B40',
          borderRadius: 12,
          marginBottom: 8,
        }}>
          <Clock size={16} color="#F59E0B" />
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: 0 }}>Смена не открыта</p>
            <p style={{ fontSize: 11, color: '#B45309', margin: 0, marginTop: 2 }}>Для начала работы откройте смену</p>
          </div>
        </div>

        <button
          onClick={onStartShift}
          disabled={isPending}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 14,
            background: 'var(--color-brand)',
            border: 0,
            color: 'white',
            fontSize: 13,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            cursor: isPending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 8px 20px rgba(61,122,94,0.3)',
            transition: 'all 0.2s',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? (
            <RefreshCw size={18} className="spin" />
          ) : (
            <PlayCircle size={18} />
          )}
          {isPending ? 'Открываем смену...' : 'Начать смену'}
        </button>

        <p style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
          После открытия смены вы получите доступ ко всем функциям
        </p>
      </div>
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
