import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Navigation2,
  ClipboardList,
  User,
  RefreshCw,
  PlayCircle,
  Clock,
  Truck,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useShiftStore } from '../store/shiftStore';
import { timesheetApi } from '../lib/timesheetApi';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const NAV_ITEMS = [
  { to: '/deliveries', icon: Navigation2, label: 'Доставки' },
  { to: '/history',    icon: ClipboardList, label: 'История' },
  { to: '/profile',    icon: User, label: 'Профиль' },
];

export function AppShell() {
  const { displayName, userId } = useAuthStore();
  const { isShiftOpen, shiftStart: shiftStartIso, openShift } = useShiftStore();

  const startShiftMutation = useMutation({
    mutationFn: () =>
      timesheetApi.checkin(userId ?? '').catch(() => ({ time: new Date().toISOString() })),
    onSuccess: () => {
      openShift(new Date().toISOString());
    },
  });

  // Prevent pull-to-refresh on mobile
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    return () => { document.body.style.overscrollBehavior = ''; };
  }, []);

  return (
    <div className="app-shell">
      {/* ── HEADER ─────────────────────────────────── */}
      <header className="app-header">
        {/* Left: logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
          }}>
            <Truck size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              FLORIFY
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', marginTop: 3, lineHeight: 1, color: 'var(--color-brand)' }}>
              КУРЬЕР
            </div>
          </div>
        </div>

        {/* Right: shift badge + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isShiftOpen && shiftStartIso && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--color-brand-light)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: 20, padding: '4px 12px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)' }} className="pulse" />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-brand)' }}>
                С {format(new Date(shiftStartIso), 'HH:mm', { locale: ru })}
              </span>
            </div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 20,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-elevated)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: 'white',
            }}>
              {displayName?.[0]?.toUpperCase() || 'K'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {displayName || 'Курьер'}
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

/* ── Shift Gate Screen — Gorgeous dark design ────────── */
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
    }}>
      <div className="slide-up" style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 28,
        padding: '44px 32px',
        maxWidth: 380,
        width: '100%',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gradient glow effect */}
        <div style={{
          position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Avatar */}
        <div className="float" style={{
          width: 80, height: 80,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 800, color: 'white',
          marginBottom: 8,
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
          position: 'relative',
        }}>
          {displayName?.[0]?.toUpperCase() || 'K'}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          {displayName || 'Курьер'}
        </h2>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'capitalize', margin: 0 }}>
          {today}
        </p>

        <div style={{ width: '100%', height: 1, background: 'var(--color-border)', margin: '16px 0' }} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
          borderRadius: 14,
          marginBottom: 8,
          width: '100%',
        }}>
          <Clock size={16} color="#F59E0B" />
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', margin: 0 }}>Смена не открыта</p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0, marginTop: 2 }}>Откройте смену для доступа к доставкам</p>
          </div>
        </div>

        <button
          onClick={onStartShift}
          disabled={isPending}
          style={{
            width: '100%',
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
            border: 0,
            color: 'white',
            fontSize: 14,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            cursor: isPending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
            transition: 'all 0.25s',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? (
            <RefreshCw size={18} className="spin" />
          ) : (
            <PlayCircle size={18} />
          )}
          {isPending ? 'Открываем...' : 'Начать смену'}
        </button>

        <p style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 8, lineHeight: 1.4 }}>
          После открытия смены вы сможете принимать и доставлять заказы
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
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span className="tab-item-label">{label}</span>
    </NavLink>
  );
}
