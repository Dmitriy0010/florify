import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems())
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-md bg-[var(--color-brand)] flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-xl leading-none">F</span>
            </div>
            <span className="font-display font-semibold text-xl tracking-tight">
              florify
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/catalog" 
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors"
            >
              Каталог
            </Link>
            <Link 
              to="/catalog?categoryId=6476b7e6-7ec9-467b-9602-555e00318357" 
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors"
            >
              Букеты
            </Link>
            <Link 
              to="/catalog?categoryId=7e7e7e7e-7e7e-7e7e-7e7e-7e7e7e7e7e7e" 
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors"
            >
              Розы
            </Link>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)]">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)]"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {/* User */}
            {isAuthenticated ? (
              <Link to="/account">
                <Button variant="ghost" size="icon" className="hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)]">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth/login">
                <Button variant="ghost" className="hidden sm:flex text-sm font-medium hover:text-[var(--color-brand)]">
                  Войти
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger className="md:hidden p-2 hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)] rounded-md transition-colors">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-10">
                  <Link to="/" className="text-xl font-display font-semibold border-b pb-4">florify</Link>
                  <nav className="flex flex-col gap-4">
                    <Link to="/catalog" className="text-lg font-medium hover:text-[var(--color-brand)]">Каталог</Link>
                    <Link to="/catalog?category=bouquets" className="text-lg font-medium hover:text-[var(--color-brand)]">Букеты</Link>
                    <Link to="/catalog?category=roses" className="text-lg font-medium hover:text-[var(--color-brand)]">Розы</Link>
                    <hr className="my-2" />
                    <Link to="/account/orders" className="text-lg font-medium hover:text-[var(--color-brand)]">Мои заказы</Link>
                    <Link to="/account/profile" className="text-lg font-medium hover:text-[var(--color-brand)]">Профиль</Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
