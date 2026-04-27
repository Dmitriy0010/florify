import React, { useState } from 'react'
import { X, Gift, AlertTriangle, Save, Loader2 } from 'lucide-react'
import { Employee } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface EmployeeAdjustmentModalProps {
  employee: Employee
  type: 'BONUS' | 'FINE'
  onClose: () => void
  onSuccess: () => void
}

import { SalaryService } from '@/lib/api'

export function EmployeeAdjustmentModal({ employee, type, onClose, onSuccess }: EmployeeAdjustmentModalProps) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !reason) {
      toast.error('Заполните сумму и причину')
      return
    }

    setLoading(true)
    try {
      // Find the last statement (usually the DRAFT for current month)
      const res = await SalaryService.getStatements({ employeeId: employee.id, size: 1 })
      const lastStmt = res.data.data?.[0]
      
      if (!lastStmt) {
        toast.error('Расчетный лист не найден. Сначала выполните расчет.')
        return
      }

      const adjustment = type === 'BONUS' 
        ? { manualBonus: Number(amount) } 
        : { deductions: Number(amount) }

      await SalaryService.adjust(lastStmt.id, adjustment)
      
      toast.success(type === 'BONUS' ? 'Премия начислена' : 'Штраф зафиксирован')
      onSuccess()
    } catch (err: any) {
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[1.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={cn(
               "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm",
               type === 'BONUS' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
             )}>
                {type === 'BONUS' ? <Gift size={20} /> : <AlertTriangle size={20} />}
             </div>
             <div>
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">
                   {type === 'BONUS' ? 'Начисление премии' : 'Применение штрафа'}
                </h3>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[200px]">
                   {employee.firstName} {employee.lastName}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-50 text-neutral-400">
             <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Сумма (₽)</label>
              <input 
                autoFocus
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full h-12 px-4 bg-neutral-50 rounded-xl border border-neutral-100 text-sm font-bold focus:border-neutral-200 outline-none transition-all"
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Причина / Комментарий</label>
              <textarea 
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={type === 'BONUS' ? "За перевыполнение плана..." : "За опоздание..."}
                className="w-full h-24 p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-sm font-bold focus:border-neutral-200 outline-none transition-all resize-none"
              />
           </div>

           <button 
             disabled={loading}
             className={cn(
               "w-full h-12 rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg",
               type === 'BONUS' ? "bg-green-600 hover:bg-green-700 shadow-green-600/10" : "bg-red-600 hover:bg-red-700 shadow-red-600/10"
             )}
           >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Подтвердить
           </button>
        </form>
      </div>
    </div>
  )
}
