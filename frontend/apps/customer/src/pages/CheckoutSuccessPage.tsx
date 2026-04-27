import { useParams, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CheckoutSuccessPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="container-custom py-24 md:py-32 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-1000">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-[var(--color-brand)] opacity-20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative h-28 w-28 bg-[var(--color-brand)] rounded-full flex items-center justify-center text-white shadow-2xl shadow-[var(--color-brand)]/40">
          <CheckCircle2 className="h-16 w-16" />
        </div>
      </div>

      <div className="space-y-4 max-w-xl">
        <h1 className="text-5xl font-display font-black tracking-tight text-[var(--color-text-primary)]">
          Заказ оформлен!
        </h1>
        <p className="text-xl text-[var(--color-text-secondary)]">
          Спасибо за ваш выбор. Мы уже передали ваш заказ флористу, чтобы он начал собирать идеальный букет.
        </p>
      </div>

      <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 w-full max-w-md space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em]">Номер заказа</p>
          <p className="text-2xl font-display font-bold text-[var(--color-brand)]">#{id?.slice(-6).toUpperCase() || 'ERROR'}</p>
        </div>
        
        <div className="h-px bg-dashed border-t border-gray-200" />
        
        <div className="text-sm font-medium text-neutral-500 leading-relaxed">
          Мы отправили детали заказа и информацию о доставке на ваш номер телефона. 
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-[var(--color-brand)]/20 transition-all group"
            onClick={() => navigate(`/order/${id}`)}
          >
            <Package className="mr-2 h-5 w-5" />
            Отследить заказ
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="ghost" 
            className="w-full h-12 rounded-2xl font-bold text-neutral-400 hover:text-[var(--color-brand)]"
            asChild
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Вернуться на главную
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 flex items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 rounded-full border border-gray-100 flex items-center justify-center text-[var(--color-brand)] mb-2 font-black text-xs">1</div>
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Сборка</span>
        </div>
        <div className="w-12 h-px bg-gray-100" />
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 rounded-full border border-gray-100 flex items-center justify-center text-neutral-300 mb-2 font-black text-xs">2</div>
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-300">Доставка</span>
        </div>
        <div className="w-12 h-px bg-gray-100" />
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 rounded-full border border-gray-100 flex items-center justify-center text-neutral-300 mb-2 font-black text-xs">3</div>
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-300">Вручение</span>
        </div>
      </div>
    </div>
  )
}