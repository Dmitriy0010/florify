import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  User,
  LogOut,
  Shield,
  Clock,
  PlayCircle,
  StopCircle,
  Navigation2,
  Truck,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useShiftStore } from '../store/shiftStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { timesheetApi } from '../lib/timesheetApi';

export default function ProfilePage() {
  const { displayName, roles, userId, logout } = useAuthStore();
  const { isShiftOpen, shiftStart: shiftStartIso, openShift, closeShift } = useShiftStore();
  const navigate = useNavigate();

  const shiftActive = isShiftOpen;
  const shiftStart = shiftStartIso ? new Date(shiftStartIso) : null;
  const today = format(new Date(), 'EEEE, d MMMM', { locale: ru });

  const startShift = useMutation({
    mutationFn: () => timesheetApi.checkin(userId ?? '').catch(() => ({ time: new Date().toISOString() })),
    onSuccess: () => { openShift(new Date().toISOString()); },
  });

  const endShift = useMutation({
    mutationFn: () => timesheetApi.checkout(userId ?? '').catch(() => ({ time: new Date().toISOString() })),
    onSuccess: () => { closeShift(); },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }}
         className="fade-in">

      {/* Header */}
      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16, padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-secondary)',
          }}>
            <User size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Профиль
            </h1>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {today}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}
           className="no-scrollbar">

        {/* Profile card */}
        <div style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 18, padding: '24px',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 72, height: 72,
            borderRadius: 22,
            background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white',
            flexShrink: 0,
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
          }}>
            {displayName?.[0]?.toUpperCase() || 'K'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              {displayName || 'Курьер'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {roles.map(role => (
                <span key={role} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 20,
                  fontSize: 11, fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  <Shield size={11} /> {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Shift section */}
        <div style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16, padding: '16px 20px',
        }}>
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
                    Начало: {shiftStart ? format(shiftStart, 'HH:mm') : '--:--'}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Смена не открыта</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>Нажмите «Начать» чтобы начать работу</div>
                </>
              )}
            </div>

            {shiftActive ? (
              <button
                onClick={() => endShift.mutate()}
                disabled={endShift.isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#EF4444', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}>
                <StopCircle size={16} /> Завершить
              </button>
            ) : (
              <button
                onClick={() => startShift.mutate()}
                disabled={startShift.isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 12,
                  background: 'var(--color-brand)', border: 0,
                  color: 'white', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                }}>
                <PlayCircle size={16} /> Начать
              </button>
            )}
          </div>
        </div>

        {/* Quick menu */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <MenuCard
            icon={<Navigation2 size={20} />}
            label="Доставки"
            sub="Активные задачи"
            onClick={() => navigate('/deliveries')}
          />
          <MenuCard
            icon={<Truck size={20} />}
            label="История"
            sub="Выполненные"
            onClick={() => navigate('/history')}
          />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px 24px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: 14,
            color: '#EF4444',
            fontSize: 14, fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
            width: '100%',
            fontFamily: 'inherit',
          }}
        >
          <LogOut size={18} /> Выход из системы
        </button>

        <div style={{ textAlign: 'center', padding: '8px 0 24px', opacity: 0.15, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Florify Courier v1.0
        </div>
      </div>
    </div>
  );
}

function MenuCard({ icon, label, sub, onClick }: {
  icon: React.ReactNode; label: string; sub: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px',
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      cursor: 'pointer',
      transition: 'all 0.15s',
      fontFamily: 'inherit',
      textAlign: 'left',
      width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-secondary)',
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{label}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <ChevronRight size={16} color="var(--color-text-tertiary)" />
    </button>
  );
}
