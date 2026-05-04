import { useState } from 'react'
import { Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react'
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

  const handleSimulate = async () => {
    try {
      setIsSimulating(true)
      await paymentApi.simulateSuccess(orderId)
      setStatus('SUCCESS')
      toast.success('Оплата прошла успешно!')
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      toast.error('Ошибка при симуляции оплаты')
      setIsSimulating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-neutral-900">Оплата СБП</h3>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Заказ #{orderNumber}</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-neutral-200 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8 flex flex-col items-center">
          {/* Amount */}
          <div className="w-full bg-neutral-50 rounded-2xl p-4 mb-6 text-center border border-neutral-100">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Сумма к оплате</p>
            <p className="text-3xl font-black text-neutral-900">{amount.toLocaleString()} ₽</p>
          </div>

          {/* QR Code Area */}
          <div className="relative group">
            <div className={cn(
              "p-6 bg-white rounded-3xl border-2 transition-all duration-500",
              status === 'SUCCESS' ? "border-emerald-500 bg-emerald-50" : "border-neutral-100 group-hover:border-neutral-200"
            )}>
              {status === 'SUCCESS' ? (
                <div className="w-[180px] h-[180px] flex flex-col items-center justify-center text-emerald-500 animate-in zoom-in duration-500">
                  <CheckCircle2 size={64} strokeWidth={3} />
                  <p className="text-xs font-black uppercase tracking-widest mt-4">Оплачено</p>
                </div>
              ) : (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`}
                  alt="QR Code"
                  width={180}
                  height={180}
                  className="rounded-lg mix-blend-multiply"
                />
              )}
            </div>

            {/* Status overlay */}
            {status === 'PENDING' && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 bg-neutral-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                <Loader2 size={10} className="animate-spin" />
                Ожидание оплаты...
              </div>
            )}
          </div>

          <div className="mt-10 text-center space-y-4 w-full">
            <p className="text-[10px] font-bold text-neutral-400 max-w-[240px] mx-auto leading-relaxed">
              Откройте мобильное приложение банка из списка СБП и отсканируйте код выше
            </p>

            {/* Debug Simulator */}
            <div className="pt-4 border-t border-neutral-100 w-full">
              <button
                type="button"
                onClick={handleSimulate}
                disabled={isSimulating || status === 'SUCCESS'}
                className="w-full h-11 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSimulating ? <Loader2 size={14} className="animate-spin" /> : <AlertCircle size={14} />}
                Имитировать оплату (DEBUG)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
