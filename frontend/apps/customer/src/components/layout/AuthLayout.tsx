import React from 'react'
import { Link } from 'react-router-dom'
import { Flower2 } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  imageAlt?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Visual Side (Left) - Hidden on small screens */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[var(--color-bg-sunken)]">
        <img
          src="/assets/auth-bg.png"
          alt="Premium Floral Background"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[10s] hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
        
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transition-all group-hover:bg-white/30">
              <Flower2 className="text-white h-6 w-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white drop-shadow-sm">florify</span>
          </Link>
          
          <div className="max-w-md space-y-4">
            <h2 className="text-5xl font-display font-bold leading-tight drop-shadow-md">
              Искусство удивлять <br />каждым лепестком
            </h2>
            <p className="text-lg text-white/90 font-medium">
              Присоединяйтесь к нашей программе лояльности и получайте персональные предложения на лучшие авторские букеты.
            </p>
          </div>
          
          <div className="flex gap-4 text-sm font-medium text-white/70">
            <span>© {new Date().getFullYear()} florify</span>
            <span>•</span>
            <Link to="/legal" className="hover:text-white transition-colors">Правовая информация</Link>
          </div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24 xl:px-32 bg-white relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center">
              <Flower2 className="text-white h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[var(--color-text-primary)]">florify</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-3">
            <h1 className="text-4xl font-display font-bold tracking-tight text-[var(--color-text-primary)]">
              {title}
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg">
              {subtitle}
            </p>
          </div>

          <div className="pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
