import { X, Printer, CheckCircle2 } from 'lucide-react'
import { CustomerSummary } from '@/lib/api'

interface ReceiptModalProps {
  orderData: {
    id: string;
    total: number;
    discount: number;
    finalTotal: number;
    paymentMethod: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    customer: CustomerSummary | null;
  }
  onClose: () => void
}

export function ReceiptModal({ orderData, onClose }: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 print:shadow-none print:rounded-none px-8 py-10">
        
        <div className="flex flex-col items-center text-center mb-8">
            <div className="h-16 w-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Продажа завершена</h2>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Чек сформирован успешно</p>
        </div>

        {/* Receipt Visual */}
        <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100 border-dashed space-y-4">
            <div className="flex justify-center mb-4">
                <h3 className="font-heading font-black text-xl tracking-tighter italic">florify</h3>
            </div>
            
            <div className="space-y-2 pb-4 border-b border-dashed border-neutral-200">
                {orderData.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-bold text-neutral-600">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{item.price * item.quantity} ₽</span>
                    </div>
                ))}
            </div>

            <div className="space-y-1.5 py-4 border-b border-dashed border-neutral-200">
                <div className="flex justify-between text-xs font-bold text-neutral-400 uppercase tracking-tight">
                    <span>Сумма:</span>
                    <span className="text-neutral-600">{orderData.total} ₽</span>
                </div>
                {orderData.discount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-[var(--color-brand)] uppercase tracking-tight">
                        <span>Скидка (баллы):</span>
                        <span>-{orderData.discount} ₽</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center py-2">
                <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">Итого:</span>
                <span className="text-2xl font-black text-neutral-900">{orderData.finalTotal} ₽</span>
            </div>

            <div className="pt-4 text-center">
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Способ оплаты: {orderData.paymentMethod === 'CASH' ? 'Наличные' : 'Карта'}</p>
                <p className="text-[9px] font-bold text-neutral-300 mt-1 italic">Спасибо за покупку!</p>
            </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-8 print:hidden">
            <button 
                onClick={handlePrint}
                className="h-12 bg-neutral-100 text-neutral-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all"
            >
                <Printer size={16} />
                Печать
            </button>
            <button 
                onClick={onClose}
                className="h-12 bg-[var(--color-brand)] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-[var(--color-brand)]/20"
            >
                Готово
            </button>
        </div>

        <button 
          onClick={onClose}
          className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest hover:text-neutral-600 transition-colors print:hidden"
        >
          <X size={12} />
          Закрыть
        </button>

      </div>
    </div>
  )
}
