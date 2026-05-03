import { Link, Outlet, useLocation } from 'react-router-dom'
import { Package, Trophy, User, LogOut, ChevronRight, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  {
    title: 'Мои заказы',
    href: '/account/orders',
    icon: Package,
  },
  {
    title: 'Избранное',
    href: '/account/favorites',
    icon: Heart,
  },
  {
    title: 'Лояльность',
    href: '/account/loyalty',
    icon: Trophy,
  },
  {
    title: 'Профиль',
    href: '/account/profile',
    icon: User,
  },
]

export function AccountLayout() {
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] flex items-center justify-center font-bold text-lg">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text-primary)] truncate max-w-[140px]">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] truncate max-w-[140px]">
                  {user?.email}
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-neutral-50 hover:text-[var(--color-text-primary)]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn('h-4.5 w-4.5', isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]')} />
                      {item.title}
                    </div>
                    <ChevronRight className={cn('h-4 w-4 opacity-0 transition-opacity', isActive && 'opacity-100')} />
                  </Link>
                )
              })}
              
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-all"
              >
                <LogOut className="h-4.5 w-4.5" />
                Выйти
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
