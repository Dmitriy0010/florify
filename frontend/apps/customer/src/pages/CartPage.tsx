import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cartStore'
import { cn } from '@/lib/utils'

export function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore()
  
  const subtotal = getTotalPrice()
  const shipping = subtotal > 5000 ? 0 : 500
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="container-custom py-24 text-center space-y-8 animate-in fade-in duration-700">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)]">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-display font-bold tracking-tight">Ваша корзина пуста</h1>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-md mx-auto">
            Кажется, вы еще не выбрали цветы. Загляните в наш каталог, чтобы найти идеальный букет.
          </p>
        </div>
        <Button 
          size="lg" 
          className="rounded-full px-12 h-14 text-base font-semibold"
          onClick={() => navigate('/catalog')}
        >
          Перейти в каталог
        </Button>
      </div>
    )
  }

  return (
    <div className="container-custom py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl font-display font-bold mb-12 tracking-tight">Ваша корзина</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-8">
          {items.map((item) => (
            <div 
              key={item.productId} 
              className="group flex flex-col sm:flex-row gap-6 pb-8 border-b border-gray-100 last:border-0 transition-all hover:bg-neutral-50/30 p-4 rounded-3xl"
            >
              {/* Product Image */}
              <div className="h-40 w-full sm:w-40 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-sm transition-transform group-hover:scale-[1.02] duration-500">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1548510318-920d7722a10f?auto=format&fit=crop&q=80&w=200'} 
                  alt={item.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold leading-snug group-hover:text-[var(--color-brand)] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-tertiary)] font-medium">Букет авторский</p>
                  </div>
                  <p className="text-xl font-display font-bold text-[var(--color-text-primary)]">
                    {item.price} ₽
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-full p-1 shadow-sm">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-full hover:bg-gray-50"
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-full hover:bg-gray-50"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-red-500 rounded-full h-10 px-4 transition-colors"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Удалить</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-100/50 space-y-6 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-light)]/20 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <h2 className="text-2xl font-bold relative z-10">Сумма заказа</h2>
            
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-sm font-medium text-[var(--color-text-secondary)]">
                <span>Товары:</span>
                <span>{subtotal} ₽</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-[var(--color-text-secondary)]">
                <span>Доставка:</span>
                <span className={shipping === 0 ? "text-green-600 font-bold" : ""}>
                  {shipping === 0 ? 'Бесплатно' : `${shipping} ₽`}
                </span>
              </div>
              
              <div className="pt-6 border-t border-dashed border-gray-200 flex justify-between items-end">
                <span className="text-sm font-bold uppercase tracking-widest text-neutral-400">Итого:</span>
                <span className="text-3xl font-display font-black text-[var(--color-text-primary)]">
                  {total} <span className="text-lg text-[var(--color-brand)]">₽</span>
                </span>
              </div>
            </div>
            
            <Button 
              className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-[var(--color-brand)]/20 hover:shadow-[var(--color-brand)]/30 transition-all group"
              onClick={() => navigate('/checkout')}
            >
              Оформить заказ
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="bg-neutral-50 rounded-2xl p-4 text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-relaxed text-center">
              Бесплатная доставка при заказе от 5,000 ₽ • Начисление бонусов (3%)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}