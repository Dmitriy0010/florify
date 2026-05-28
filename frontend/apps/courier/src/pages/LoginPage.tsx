import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, ArrowRight, Truck } from 'lucide-react';
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
      const hasAccess = login.roles.includes('COURIER') || login.roles.includes('ADMIN');
      if (!hasAccess) {
        setError('Недостаточно прав для входа в приложение курьера');
        return;
      }
      setTokens(login.accessToken, login.refreshToken);

      try {
        const me = await authApi.me();
        setUser(me.id, me.roles, `${me.firstName} ${me.lastName}`.trim());
        navigate('/deliveries', { replace: true });
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
    <div style={{
      background: 'linear-gradient(135deg, #0F0A1A 0%, #1A1128 30%, #231838 60%, #0F0A1A 100%)',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', top: '15%', left: '20%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '10%',
        width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="slide-up" style={{
        background: 'var(--color-bg-surface)',
        padding: '40px 32px',
        borderRadius: '28px',
        border: '1px solid var(--color-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.1)',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
          }}>
            <Truck color="#fff" size={32} />
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>FLORIFY</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--color-text-tertiary)', fontSize: '14px', fontWeight: 600 }}>Приложение курьера</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--color-text-tertiary)' }} />
              <input
                type="email"
                placeholder="Email"
                {...register('email')}
                style={{
                  width: '100%',
                  height: '52px',
                  padding: '12px 12px 12px 48px',
                  borderRadius: '14px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-elevated)',
                  fontWeight: 600,
                  fontSize: '15px',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            {errors.email && <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>{errors.email.message}</div>}
          </div>

          <div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--color-text-tertiary)' }} />
              <input
                type="password"
                placeholder="Пароль"
                {...register('password')}
                style={{
                  width: '100%',
                  height: '52px',
                  padding: '12px 12px 12px 48px',
                  borderRadius: '14px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-elevated)',
                  fontWeight: 600,
                  fontSize: '15px',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            {errors.password && <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>{errors.password.message}</div>}
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              textAlign: 'center',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              height: '56px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '8px',
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
              transition: 'all 0.25s',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'ВХОД...' : <>ВОЙТИ <ArrowRight size={20} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: 'var(--color-text-tertiary)', letterSpacing: '0.02em' }}>
          &copy; 2026 Florify Ecosystem. All rights reserved.
        </div>
      </div>
    </div>
  );
}
