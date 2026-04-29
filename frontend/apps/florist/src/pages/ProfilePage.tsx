import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  LogOut,
  Shield,
  Clock,
  ChevronRight,
  PlayCircle,
  StopCircle,
  ShoppingBag,
  Package,
  ClipboardList,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { timesheetApi } from '../lib/timesheetApi';

export default function ProfilePage() {
  const { displayName, roles, userId, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [shiftStart, setShiftStart] = useState<Date | null>(() => {
    const s = localStorage.getItem('florify_shift_start');
    return s ? new Date(s) : null;
  });

  const shiftActive = !!shiftStart;
  const today = format(new Date(), 'EEEE, d MMMM', { locale: ru });

  /* mutations */
  const startShift = useMutation({
    mutationFn: () => timesheetApi.checkin(userId ?? '').catch(() => ({ time: new Date().toISOString() })),
    onSuccess: () => {
      const now = new Date();
      setShiftStart(now);
      localStorage.setItem('florify_shift_start', now.toISOString());
    },
  });

  const endShift = useMutation({
    mutationFn: () => timesheetApi.checkout(userId ?? '').catch(() => ({ time: new Date().toISOString() })),
    onSuccess: () => {
      setShiftStart(null);
      localStorage.removeItem('florify_shift_start');
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* Today's sales from orders */
  const { data: todayOrders = [] } = useQuery({
    queryKey: ['orders', 'today', 'COMPLETED'],
    queryFn: async () => {
      try {
        const { ordersApi } = await import('../lib/ordersApi');
        return ordersApi.getKanban('COMPLETED', 200);
      } catch { return []; }
    },
  });
  const todaySales = Array.isArray(todayOrders)
    ? todayOrders.filter((o: any) => {
        const d = new Date(o.createdAt || 0);
        const now = new Date();
        return d.getFullYear() === now.getFullYear()
            && d.getMonth() === now.getMonth()
            && d.getDate() === now.getDate();
      })
    : [];
  const todayRevenue = todaySales.reduce((s: number, o: any) => s + (o.finalAmount ?? 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }}
         className="fade-in">

      {/* ── PAGE HEADER ── */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'var(--color-text-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Профиль
            </h1>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 3, display: 'block' }}>
              {today}
            </span>
          </div>
        </div>
        {/* Quick nav */}
        <div style={{ display: 'flex', gap: 8 }}>
          <QuickLink to="/pos"    label="Терминал" icon={<ShoppingBag  size={14}/>}/>
          <QuickLink to="/orders" label="Заказы"   icon={<ClipboardList size={14}/>}/>
          <QuickLink to="/inventory" label="Склад" icon={<Package size={14}/>}/>
        </div>
      </div>

      {/* ── SCROLL CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}
           className="no-scrollbar">

        {/* Profile card */}
        <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 64, height: 64,
            background: 'var(--color-brand-light)',
            border: '2px solid var(--color-brand)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: 'var(--color-brand)',
            flexShrink: 0,
          }}>
            {displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              {displayName || 'Пользователь'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {roles.map(role => (
                <span key={role} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px',
                  background: 'var(--color-bg-sunken)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 20,
                  fontSize: 11, fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  <Shield size={11}/> {role}
                </span>
              ))}
            </div>
          </div>
          {/* Today stats */}
          <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {todaySales.length}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>продаж</div>
            </div>
            <div style={{ width: 1, background: 'var(--color-border)' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-brand)', fontVariantNumeric: 'tabular-nums' }}>
                {todayRevenue.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>выручка</div>
            </div>
          </div>
        </div>

        {/* ── SHIFT SECTION ── */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Clock size={16} color="var(--color-text-secondary)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Смена</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {shiftActive ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} className="pulse" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-success)' }}>Смена открыта</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                    Начало: {shiftStart ? format(shiftStart, 'HH:mm') : '--:--'} · Сегодня {today}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Смена не открыта</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>Нажмите «Начать смену» чтобы начать работу</div>
                </>
              )}
            </div>

            {shiftActive ? (
              <button
                onClick={() => endShift.mutate()}
                disabled={endShift.isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 10,
                  background: '#FEF2F2', border: '1px solid #FEE2E2',
                  color: '#EF4444', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                <StopCircle size={16} /> Завершить смену
              </button>
            ) : (
              <button
                onClick={() => startShift.mutate()}
                disabled={startShift.isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 10,
                  background: 'var(--color-brand)', border: 0,
                  color: 'white', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                <PlayCircle size={16} /> Начать смену
              </button>
            )}
          </div>
        </div>

        {/* ── MENU ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MenuCard icon={<ShoppingBag size={20}/>}  label="Терминал продаж"  sub="Открыть кассу"       to="/pos"       />
          <MenuCard icon={<Package size={20}/>}       label="Склад"           sub="Остатки и списание"  to="/inventory" />
          <MenuCard icon={<ClipboardList size={20}/>} label="Заказы"          sub="Канбан доски"        to="/orders"    />
          <MenuCard icon={<Shield size={20}/>}        label="Безопасность"    sub="Сменить пароль"      to="/profile"   disabled />
        </div>

        {/* ── LOGOUT ── */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px 24px',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: 12,
            color: '#EF4444',
            fontSize: 14, fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
            width: '100%',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EF4444'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
        >
          <LogOut size={18} /> Выход из системы
        </button>

        <div style={{ textAlign: 'center', padding: '8px 0 24px', opacity: 0.2, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Florify PWA v1.0
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '6px 12px', borderRadius: 8,
      border: '1px solid var(--color-border)', background: 'white',
      color: 'var(--color-text-secondary)',
      fontSize: 12, fontWeight: 600, textDecoration: 'none',
      transition: 'all 0.15s',
    }}>
      {icon} {label}
    </Link>
  );
}

function MenuCard({ icon, label, sub, to, disabled }: {
  icon: React.ReactNode; label: string; sub: string; to: string; disabled?: boolean;
}) {
  return (
    <Link to={disabled ? '#' : to} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px',
      background: 'white',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      textDecoration: 'none',
      opacity: disabled ? 0.4 : 1,
      transition: 'all 0.15s',
      pointerEvents: disabled ? 'none' : 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, background: 'var(--color-bg-sunken)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{label}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <ChevronRight size={16} color="var(--color-text-tertiary)" />
    </Link>
  );
}
