import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { authApi } from '../lib/authApi';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    setError(null);
    try {
      const login = await authApi.login(values);
      const hasAccess = login.roles.includes('FLORIST') || login.roles.includes('CASHIER') || login.roles.includes('ADMIN');
      if (!hasAccess) {
        setError('Недостаточно прав для входа в приложение флориста');
        return;
      }
      setTokens(login.accessToken, login.refreshToken);

      try {
        const me = await authApi.me();
        setUser(me.id, me.roles, `${me.firstName} ${me.lastName}`.trim());
        navigate('/pos', { replace: true });
      } catch (meError) {
        console.error('Failed to fetch profile:', meError);
        setError('Сессия создана, но не удалось получить данные профиля.');
      }
    } catch (loginError: any) {
      if (loginError.response?.status === 401) {
        setError('Неверный email или пароль');
      } else {
        setError('Ошибка сервера при входе');
      }
    }
  };

  return (
    <div className="login-page" style={{ 
      background: 'linear-gradient(135deg, #3D7A5E 0%, #1a2e26 100%)', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="login-card" style={{ 
        background: '#fff', 
        padding: '40px', 
        borderRadius: '24px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: 'var(--color-brand)', 
            borderRadius: '16px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ShieldCheck color="#fff" size={32} />
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#1f2937' }}>FLORIFY</h1>
          <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>Терминал флориста</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '18px' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#999' }} />
              <input 
                type="email" 
                placeholder="Email"
                {...register('email')} 
                style={{ 
                  width: '100%', 
                  height: '52px', 
                  padding: '12px 12px 12px 48px', 
                  borderRadius: '12px', 
                  border: '2px solid #eee', 
                  background: '#f9f9f9',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              />
            </div>
            {errors.email && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>{errors.email.message}</div>}
          </div>

          <div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#999' }} />
              <input 
                type="password" 
                placeholder="Пароль"
                {...register('password')} 
                style={{ 
                  width: '100%', 
                  height: '52px', 
                  padding: '12px 12px 12px 48px', 
                  borderRadius: '12px', 
                  border: '2px solid #eee', 
                  background: '#f9f9f9',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              />
            </div>
            {errors.password && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>{errors.password.message}</div>}
          </div>

          {error && (
            <div style={{ 
              background: '#fef2f2', 
              color: '#ef4444', 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              fontWeight: 600,
              textAlign: 'center',
              border: '1px solid #fee2e2'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              height: '56px', 
              background: 'var(--color-brand)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '16px', 
              fontWeight: 800, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '10px'
            }}
          >
            {isSubmitting ? 'ВХОД...' : <>ВОЙТИ <ArrowRight size={20} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#999' }}>
          &copy; 2026 Florify Ecosystem. All rights reserved.
        </div>
      </div>
    </div>
  );
}
