import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@florify.ru');
  const [password, setPassword] = useState('admin123'); // Подставлено для теста
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/v1/auth/login', {
        email,
        password,
        deviceInfo: navigator.userAgent
      });
      
      const { accessToken, refreshToken } = res.data;

      const meRes = await apiClient.get('/v1/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const user = meRes.data;

      const hasAdminRole = user.roles.some((r: string) => 
        ['ADMIN', 'OWNER', 'CASHIER'].includes(r)
      );

      if (!hasAdminRole) {
         toast.error('У вас нет доступа к админ-панели');
         setLoading(false);
         return;
      }

      setAuth(accessToken, refreshToken, user);
      toast.success('Вы успешно вошли');
      navigate('/admin/dashboard');

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F6]">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 w-full max-w-sm">
        <h1 className="text-2xl font-black text-center mb-6 text-neutral-900 tracking-tight">Вход в систему</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all font-medium text-neutral-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Пароль</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all font-medium text-neutral-900"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full bg-[var(--color-brand)] text-white font-bold py-3 rounded-xl hover:bg-[var(--color-brand-hover)] transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Проверка...' : 'Войти в панель'}
          </button>
        </form>
      </div>
    </div>
  );
}
