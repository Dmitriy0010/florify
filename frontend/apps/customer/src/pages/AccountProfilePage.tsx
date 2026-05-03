import { useAuthStore } from '@/store/authStore'
import { User, Mail, Phone, MapPin, ShieldCheck, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function AccountProfilePage() {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand)]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-[var(--color-text-primary)]">Личные данные</h1>
      </div>

      <div className="grid gap-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] flex items-center justify-center font-bold text-2xl shadow-inner shadow-[var(--color-brand)]/5">
              {user.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-[var(--color-text-tertiary)] flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Верифицированный клиент
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Имя</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
                <Input value={user.firstName} disabled className="pl-10 h-11 bg-neutral-50/50 border-neutral-100 rounded-xl font-medium" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Фамилия</Label>
              <Input value={user.lastName} disabled className="h-11 bg-neutral-50/50 border-neutral-100 rounded-xl font-medium" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
                <Input value={user.email} disabled className="pl-10 h-11 bg-neutral-50/50 border-neutral-100 rounded-xl font-medium" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Телефон</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
                <Input value={user.phone} disabled className="pl-10 h-11 bg-neutral-50/50 border-neutral-100 rounded-xl font-medium" />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-neutral-50 flex justify-end">
            <Button variant="outline" className="rounded-xl px-6 border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand-light)]" disabled>
              Редактировать данные
            </Button>
          </div>
        </div>

        {/* Security & Preferences Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[var(--color-text-primary)]">Безопасность</h3>
              <p className="text-sm text-[var(--color-text-tertiary)]">Измените пароль или настройте двухфакторную аутентификацию для защиты аккаунта.</p>
              <Button variant="ghost" className="p-0 h-auto text-[var(--color-brand)] font-bold text-sm hover:bg-transparent">Изменить пароль →</Button>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
              <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[var(--color-text-primary)]">Адреса доставки</h3>
              <p className="text-sm text-[var(--color-text-tertiary)]">Управляйте списком ваших адресов для быстрого оформления будущих заказов.</p>
              <Button variant="ghost" className="p-0 h-auto text-[var(--color-brand)] font-bold text-sm hover:bg-transparent">Мои адреса →</Button>
           </div>
        </div>
      </div>
    </div>
  )
}
