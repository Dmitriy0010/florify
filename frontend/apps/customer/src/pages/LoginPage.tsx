import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((state) => state.setTokens)
  const setUser = useAuthStore((state) => state.setUser)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(data)
      setTokens(response.accessToken, response.refreshToken)
      
      const userProfile = await authApi.getMe()
      setUser(userProfile)
      
      toast.success('С возвращением!', {
        description: `Мы рады видеть вас снова, ${userProfile.firstName}.`,
      })
      
      navigate('/')
    } catch (error: any) {
      toast.error('Ошибка входа', {
        description: error.response?.data?.message || 'Неверные учетные данные',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="С возвращением" 
      subtitle="Войдите в личный кабинет, чтобы продолжить покупки."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-[var(--color-text-primary)]">Email адрес</Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-brand)] transition-colors">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-11 h-12 bg-neutral-50 border-[var(--color-border)] focus:bg-white transition-all rounded-xl"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-destructive mt-1 ml-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" title="Password" className="text-sm font-semibold text-[var(--color-text-primary)]">Пароль</Label>
              <Link to="/auth/forgot" className="text-xs font-medium text-[var(--color-brand)] hover:brightness-90 transition-all">
                Забыли пароль?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-brand)] transition-colors">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-11 h-12 bg-neutral-50 border-[var(--color-border)] focus:bg-white transition-all rounded-xl"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-destructive mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="brand"
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-[var(--color-brand)]/10 hover:shadow-[var(--color-brand)]/20 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Войти в аккаунт
                <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </>
            )}
          </Button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-[var(--color-text-tertiary)]">
            <span className="bg-white px-4">ИЛИ</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button 
            variant="outline" 
            className="h-12 border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            onClick={() => navigate('/catalog')}
          >
            Продолжить как гость
          </Button>
        </div>

        <p className="text-center text-sm text-[var(--color-text-secondary)] pt-4">
          Еще нет аккаунта?{' '}
          <Link to="/auth/register" className="font-bold text-[var(--color-brand)] hover:brightness-90 hover:underline underline-offset-4 decoration-2 transition-all">
            Создать профиль
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
