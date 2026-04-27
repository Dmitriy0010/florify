import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Имя должно быть не менее 2 символов'),
  lastName: z.string().min(2, 'Фамилия должна быть не менее 2 символов'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Введите корректный номер (+79991234567)'),
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((state) => state.setTokens)
  const setUser = useAuthStore((state) => state.setUser)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const response = await authApi.register(data)
      setTokens(response.accessToken, response.refreshToken)
      
      const userProfile = await authApi.getMe()
      setUser(userProfile)
      
      toast.success('Добро пожаловать!', {
        description: `Ваш аккаунт во florify успешно создан, ${userProfile.firstName}.`,
      })
      
      navigate('/')
    } catch (error: any) {
      toast.error('Ошибка регистрации', {
        description: error.response?.data?.message || 'Не удалось создать аккаунт. Попробуйте снова.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Создать аккаунт" 
      subtitle="Начните дарить радость уже сегодня. Регистрация займет меньше минуты."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm font-semibold text-[var(--color-text-primary)]">Имя</Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-brand)] transition-colors">
                <User className="h-4.5 w-4.5" />
              </div>
              <Input
                id="firstName"
                placeholder="Иван"
                className="pl-11 h-12 bg-neutral-50 border-[var(--color-border)] focus:bg-white transition-all rounded-xl"
                {...register('firstName')}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm font-semibold text-[var(--color-text-primary)]">Фамилия</Label>
            <Input
              id="lastName"
              placeholder="Иванов"
              className="h-12 bg-neutral-50 border-[var(--color-border)] focus:bg-white transition-all rounded-xl"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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
            <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-semibold text-[var(--color-text-primary)]">Номер телефона</Label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-brand)] transition-colors">
              <Phone className="h-4.5 w-4.5" />
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 (999) 000-00-00"
              className="pl-11 h-12 bg-neutral-50 border-[var(--color-border)] focus:bg-white transition-all rounded-xl"
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" title="Password" className="text-sm font-semibold text-[var(--color-text-primary)]">Пароль</Label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-brand)] transition-colors">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Минимум 8 символов"
              className="pl-11 h-12 bg-neutral-50 border-[var(--color-border)] focus:bg-white transition-all rounded-xl"
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="brand"
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-[var(--color-brand)]/10 hover:shadow-[var(--color-brand)]/20 transition-all font-display"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Создать аккаунт
                <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-[var(--color-text-secondary)] pt-4">
          Уже есть аккаунт?{' '}
          <Link to="/auth/login" className="font-bold text-[var(--color-brand)] hover:brightness-90 hover:underline underline-offset-4 decoration-2 transition-all">
            Войти
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
