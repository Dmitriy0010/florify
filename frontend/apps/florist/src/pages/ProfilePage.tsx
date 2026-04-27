import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/authApi';
import { useAuthStore } from '../store/authStore';
import { timesheetApi } from '../lib/timesheetApi';
import { usePWAInstall } from '../lib/usePWAInstall';
import { useOfflineStore } from '../store/offlineStore';
import { enqueueMutation } from '../lib/offlineQueue';

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { displayName, refreshToken, logout, userId } = useAuthStore();
  const isOnline = useOfflineStore((state) => state.isOnline);
  const { canInstall, install } = usePWAInstall();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const month = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const timesheetQuery = useQuery({
    queryKey: ['timesheet', userId, month],
    queryFn: () => timesheetApi.list(userId || '', month),
    enabled: Boolean(userId),
  });

  const onLogout = async () => {
    await authApi.logout(refreshToken);
    logout();
    navigate('/login', { replace: true });
  };

  const onChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    await authApi.changePassword({ currentPassword, newPassword });
    setCurrentPassword('');
    setNewPassword('');
  };

  const onCheckin = async () => {
    if (!userId) return;
    if (isOnline) {
      await timesheetApi.checkin(userId);
    } else {
      await enqueueMutation({ type: 'clock-in', payload: { employeeId: userId } });
    }
    queryClient.invalidateQueries({ queryKey: ['timesheet', userId, month] });
  };

  const onCheckout = async () => {
    if (!userId) return;
    if (isOnline) {
      await timesheetApi.checkout(userId);
    } else {
      await enqueueMutation({ type: 'clock-out', payload: { employeeId: userId } });
    }
    queryClient.invalidateQueries({ queryKey: ['timesheet', userId, month] });
  };

  return (
    <div className="detail-page">
      <h2>Профиль</h2>
      <p>{displayName || 'Флорист'}</p>
      <p className="order-meta">ID: {userId}</p>

      <h3>Сменить пароль</h3>
      <input
        type="password"
        placeholder="Текущий пароль"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
      />
      <input
        type="password"
        placeholder="Новый пароль"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
      />
      <button className="secondary-btn" onClick={onChangePassword}>
        Сменить пароль
      </button>

      <h3>Табель</h3>
      <div className="modal-actions">
        <button className="secondary-btn" onClick={onCheckin}>
          Начать смену
        </button>
        <button className="secondary-btn" onClick={onCheckout}>
          Завершить смену
        </button>
      </div>
      <div className="stack-list">
        {timesheetQuery.data?.slice(0, 8).map((entry) => (
          <div key={entry.id} className="list-row">
            <span>{entry.date ?? '—'}</span>
            <span>{entry.checkInAt ? new Date(entry.checkInAt).toLocaleTimeString() : '-'}</span>
            <span>{entry.checkOutAt ? new Date(entry.checkOutAt).toLocaleTimeString() : '-'}</span>
          </div>
        ))}
      </div>

      {canInstall ? (
        <button className="primary-btn" onClick={install}>
          Установить приложение
        </button>
      ) : null}
      <button className="primary-btn" onClick={onLogout}>
        Выйти
      </button>
    </div>
  );
}
