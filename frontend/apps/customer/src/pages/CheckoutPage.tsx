import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCartStore } from '@/store/cartStore'
import { ordersApi } from '@/api/orders'
import { cn } from '@/lib/utils'

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Введите имя'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  address: z.string().min(5, 'Введите адрес доставки'),
  deliveryType: z.enum(['DELIVERY', 'PICKUP']),
  paymentMethod: z.enum(['CARD', 'CASH', 'ONLINE']),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const totalPrice = getTotalPrice()
  const shipping = totalPrice > 5000 || items.length === 0 ? 0 : 500
  const finalPrice = totalPrice + shipping

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryType: 'DELIVERY',
      paymentMethod: 'ONLINE',
    }
  })

  const deliveryType = watch('deliveryType')

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error('Ваша корзина пуста')
      return
    }

    setIsLoading(true)
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        lineTotal: item.price * item.quantity
      }))

      const response = await ordersApi.createOrder({
        items: orderItems,
        guestName: data.firstName,
        guestPhone: data.phone,
        type: data.deliveryType,
        source: 'WEBSITE',
        paymentMethod: data.paymentMethod,
        deliveryAddress: data.deliveryType === 'DELIVERY' ? data.address : 'Самовывоз',
      })

      clearCart()
      toast.success('Заказ успешно оформлен!')
      navigate(`/order/${response.id}`)
    } catch (error: any) {
      toast.error('Ошибка при оформлении заказа', {
        description: error.response?.data?.message || 'Попробуйте позже',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="container-custom py-12 md:py-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-12">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full shadow-sm bg-white"
          onClick={() => navigate('/cart')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-4xl font-display font-bold tracking-tight">Оформление заказа</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Checkout Form */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Step 1: Contact Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="text-xl font-bold">Контактные данные</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-semibold text-sm">Ваше имя</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input 
                    id="firstName" 
                    placeholder="Иван" 
                    className="pl-10 h-12 rounded-xl"
                    {...register('firstName')}
                  />
                </div>
                {errors.firstName && <p className="text-xs text-red-500 font-medium">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold text-sm">Телефон</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input 
                    id="phone" 
                    placeholder="+7 (999) 000-00-00" 
                    className="pl-10 h-12 rounded-xl"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
              </div>
            </div>
          </section>

          {/* Step 2: Delivery */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center font-bold text-sm">2</div>
              <h2 className="text-xl font-bold">Доставка</h2>
            </div>

            <RadioGroup defaultValue="DELIVERY" className="grid grid-cols-2 gap-4" onValueChange={(val) => register('deliveryType').onChange({ target: { value: val, name: 'deliveryType' } })}>
              <label className={cn(
                "flex flex-col gap-2 p-6 rounded-2xl border-2 cursor-pointer transition-all",
                deliveryType === 'DELIVERY' ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]/20" : "border-gray-100 bg-white"
              )}>
                <RadioGroupItem value="DELIVERY" className="sr-only" />
                <MapPin className={cn("h-6 w-6", deliveryType === 'DELIVERY' ? "text-[var(--color-brand)]" : "text-gray-400")} />
                <span className="font-bold">Доставка курьером</span>
                <span className="text-xs text-neutral-500 font-medium">Бесплатно от 5000 ₽</span>
              </label>
              <label className={cn(
                "flex flex-col gap-2 p-6 rounded-2xl border-2 cursor-pointer transition-all",
                deliveryType === 'PICKUP' ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]/20" : "border-gray-100 bg-white"
              )}>
                <RadioGroupItem value="PICKUP" className="sr-only" />
                <Calendar className={cn("h-6 w-6", deliveryType === 'PICKUP' ? "text-[var(--color-brand)]" : "text-gray-400")} />
                <span className="font-bold">Самовывоз</span>
                <span className="text-xs text-neutral-500 font-medium">г. Москва, ул. Арбат 1</span>
              </label>
            </RadioGroup>

            {deliveryType === 'DELIVERY' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="address" className="font-semibold text-sm">Адрес доставки</Label>
                <Input 
                  id="address" 
                  placeholder="Улица, дом, квартира" 
                  className="h-12 rounded-xl"
                  {...register('address')}
                />
                {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>}
              </div>
            )}
          </section>

          {/* Step 3: Payment */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center font-bold text-sm">3</div>
              <h2 className="text-xl font-bold">Оплата</h2>
            </div>
            
            <RadioGroup defaultValue="ONLINE" className="space-y-3">
              {['ONLINE', 'CARD', 'CASH'].map((method) => (
                 <label 
                  key={method}
                  className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 bg-white hover:border-[var(--color-brand)] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value={method} className="text-[var(--color-brand)]" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">
                        {method === 'ONLINE' && 'Оплата онлайн'}
                        {method === 'CARD' && 'Картой при получении'}
                        {method === 'CASH' && 'Наличными при получении'}
                      </p>
                      <p className="text-xs text-neutral-400 font-medium">
                         {method === 'ONLINE' && 'Apple Pay, Google Pay, Карты'}
                         {method === 'CARD' && 'Курьер приедет с терминалом'}
                         {method === 'CASH' && 'Пожалуйста, подготовьте сдачу'}
                      </p>
                    </div>
                  </div>
                  <CreditCard className="h-5 w-5 text-neutral-300 group-hover:text-[var(--color-brand)] transition-colors" />
                </label>
              ))}
            </RadioGroup>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-100/50 space-y-6">
              <h2 className="text-xl font-bold">Ваш заказ</h2>
              
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500 font-medium line-clamp-1 flex-1 pr-4">
                      {item.name} <span className="text-neutral-300 ml-1">×{item.quantity}</span>
                    </span>
                    <span className="font-bold">{item.price * item.quantity} ₽</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm font-medium text-neutral-500">
                  <span>Доставка:</span>
                  <span className={shipping === 0 ? "text-green-600 font-bold" : ""}>
                    {shipping === 0 ? 'Бесплатно' : `${shipping} ₽`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-black pt-2">
                  <span className="uppercase tracking-widest text-[10px] text-neutral-400 self-end mb-1">Итоговая сумма:</span>
                  <span className="text-3xl font-display">{finalPrice} <span className="text-lg text-[var(--color-brand)]">₽</span></span>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-[var(--color-brand)]/20 hover:shadow-[var(--color-brand)]/30 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Купить букет'
                )}
              </Button>

              <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                  Безопасная оплата • Данные зашифрованы
                </p>
              </div>
           </div>
        </div>
      </form>
    </div>
  )
}