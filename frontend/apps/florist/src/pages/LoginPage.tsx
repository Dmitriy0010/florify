import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
      const hasAccess = login.roles.includes('FLORIST') || login.roles.includes('CASHIER');
      if (!hasAccess) {
        setError('Недостаточно прав для входа в приложение флориста');
        return;
      }
      setTokens(login.accessToken, login.refreshToken);
      const me = await authApi.me();
      setUser(me.id, me.roles, `${me.firstName} ${me.lastName}`.trim());
      navigate('/orders', { replace: true });
    } catch {
      setError('Не удалось войти. Проверьте логин и пароль.');
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit(onSubmit)}>
        <h1>Florify — Флорист</h1>
        <label>
          Email
          <input type="email" {...register('email')} />
          {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
        </label>

        <label>
          Пароль
          <input type="password" {...register('password')} />
          {errors.password ? <span className="field-error">{errors.password.message}</span> : null}
        </label>

        {error ? <div className="form-error">{error}</div> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
