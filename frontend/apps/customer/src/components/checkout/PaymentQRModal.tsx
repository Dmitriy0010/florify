import { useState, useEffect } from 'react'
import { Loader2, X, CheckCircle2, ShieldCheck, Smartphone, Zap } from 'lucide-react'
import { paymentApi } from '@/api/payment'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PaymentQRModalProps {
  orderId: string
  orderNumber: string
  amount: number
  qrData: string
  onSuccess: () => void
  onClose: () => void
}

export function PaymentQRModal({ orderId, orderNumber, amount, qrData, onSuccess, onClose }: PaymentQRModalProps) {
  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'ERROR'>('PENDING')
  const [isSimulating, setIsSimulating] = useState(false)
  const [dots, setDots] = useState(1)

  // Animated waiting dots
  useEffect(() => {
    if (status !== 'PENDING') return
    const interval = setInterval(() => setDots(d => (d % 3) + 1), 600)
    return () => clearInterval(interval)
  }, [status])

  const handleSimulate = async () => {
    try {
      setIsSimulating(true)
      await paymentApi.simulateSuccess(orderId)
      setStatus('SUCCESS')
      toast.success('Оплата прошла успешно! 🎉')
      setTimeout(() => onSuccess(), 2200)
    } catch {
      toast.error('Ошибка при симуляции оплаты')
      setIsSimulating(false)
    }
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=1a1a2e&bgcolor=ffffff&margin=2`

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ borderRadius: '2rem' }}
      >
        {/* Gradient glow background */}
        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-400 opacity-30 blur-xl" />

        <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl">

          {/* Header gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

          {/* Header */}
          <div className="px-8 pt-7 pb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Zap size={14} className="text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Оплата СБП</h3>
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Заказ #{orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="px-8 pb-8 space-y-6">

            {/* Amount card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Сумма к оплате</p>
              <p className="text-4xl font-black tracking-tight">
                {amount.toLocaleString('ru-RU')}
                <span className="text-2xl text-emerald-400 ml-1">₽</span>
              </p>
            </div>

            {/* QR / Success area */}
            {status === 'SUCCESS' ? (
              <div className="flex flex-col items-center py-4 animate-in zoom-in duration-500">
                <div className="relative">
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200">
                    <CheckCircle2 size={56} className="text-white" strokeWidth={2} />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
                </div>
                <p className="text-xl font-black text-gray-900 mt-5">Оплата прошла!</p>
                <p className="text-sm text-gray-400 mt-1">Перенаправляем вас к заказу...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                {/* QR code with animated border */}
                <div className="relative">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-[spin_4s_linear_infinite] opacity-60 blur-sm" />
                  <div className="relative p-3 bg-white rounded-2xl shadow-lg">
                    <img
                      src={qrImageUrl}
                      alt="QR Code для оплаты"
                      width={200}
                      height={200}
                      className="rounded-xl block"
                    />
                  </div>
                </div>

                {/* Waiting status */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                  <Loader2 size={12} className="animate-spin text-teal-500" />
                  <span className="text-[11px] font-bold text-slate-500">
                    Ожидание оплаты{'.'.repeat(dots)}
                  </span>
                </div>

                {/* Steps */}
                <div className="w-full space-y-2.5">
                  {[
                    { icon: Smartphone, text: 'Откройте приложение банка' },
                    { icon: ShieldCheck, text: 'Отсканируйте QR-код камерой' },
                    { icon: CheckCircle2, text: 'Подтвердите платёж' },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3 text-[12px] text-slate-500">
                      <div className="h-6 w-6 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                        <Icon size={12} className="text-teal-500" strokeWidth={2.5} />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug simulator */}
            {status === 'PENDING' && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className={cn(
                    "w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 border border-amber-100",
                    "hover:from-amber-100 hover:to-orange-100 hover:shadow-md hover:shadow-amber-100",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isSimulating
                    ? <><Loader2 size={14} className="animate-spin" /> Обрабатываем оплату...</>
                    : <><Zap size={14} /> Симулировать оплату (DEMO)</>
                  }
                </button>
                <p className="text-center text-[10px] text-gray-300 mt-2 font-medium">
                  Только для демонстрации в рамках дипломного проекта
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
