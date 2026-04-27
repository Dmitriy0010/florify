import React, { useState, useEffect } from 'react'
import { 
  X, 
  Wallet, 
  Percent, 
  TrendingUp, 
  Save,
  Loader2,
  Settings2
} from 'lucide-react'
import { EmployeeService, SalaryConfig, SalaryType, Employee } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface SalaryConfigModalProps {
  employee: Employee
  onClose: () => void
}

export function SalaryConfigModal({ employee, onClose }: SalaryConfigModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [config, setConfig] = useState<Partial<SalaryConfig>>({
    type: 'FIXED',
    baseAmount: 0,
    salesPercent: 0,
    bonusPerOrder: 0,
    validFrom: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    loadConfig()
  }, [employee.id])

  const loadConfig = async () => {
    if (!employee.id) return
    setIsLoading(true)
    try {
      const res = await EmployeeService.getSalaryConfig(employee.id)
      if (res.data) {
        setConfig({
            ...res.data,
            validFrom: res.data.validFrom ? format(new Date(res.data.validFrom), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
        })
      }
    } catch (err) {
      console.error('Failed to load salary config', err)
      // New employee might not have config yet, that's fine
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee.id) return
    setIsSaving(true)
    try {
      await EmployeeService.upsertSalaryConfig(employee.id, {
        type: config.type as SalaryType,
        baseAmount: Number(config.baseAmount),
        salesPercent: Number(config.salesPercent),
        bonusPerOrder: Number(config.bonusPerOrder),
        validFrom: config.validFrom as string
      })
      toast.success('Настройки зарплаты сохранены')
      onClose()
    } catch (err: any) {
      toast.error('Ошибка при сохранении: ' + (err.response?.data?.message || err.message))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-lg shadow-black/10">
                <Settings2 size={24} />
             </div>
             <div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight">Настройка зарплаты</h2>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">
                   {employee.firstName} {employee.lastName} • {employee.role}
                </p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-2xl flex items-center justify-center text-neutral-400 hover:bg-white hover:text-neutral-900 transition-all shadow-sm border border-transparent hover:border-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
               <Loader2 className="animate-spin text-neutral-200" size={40} />
               <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Загрузка настроек...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Тип вознаграждения</label>
                  <div className="grid grid-cols-3 gap-3">
                     {[
                       { id: 'FIXED', label: 'Оклад', icon: Wallet },
                       { id: 'FIXED_PLUS_PERCENT', label: 'Оклад + %', icon: TrendingUp },
                       { id: 'PERCENT_ONLY', label: '% от выручки', icon: Percent },
                     ].map((t) => (
                       <button
                         key={t.id}
                         type="button"
                         onClick={() => setConfig(prev => ({ ...prev, type: t.id as SalaryType }))}
                         className={cn(
                           "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all group",
                           config.type === t.id 
                             ? "bg-neutral-900 border-neutral-900 text-white shadow-xl shadow-black/10" 
                             : "bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200"
                         )}
                       >
                          <t.icon size={20} className={cn("transition-transform group-hover:scale-110", config.type === t.id ? "text-white" : "text-neutral-300")} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Сумма оклада (₽)</label>
                     <input 
                       disabled={config.type === 'PERCENT_ONLY'}
                       type="number"
                       step="1"
                       value={config.baseAmount || ''}
                       onFocus={(e) => e.target.select()}
                       onChange={e => setConfig(prev => ({ ...prev, baseAmount: Number(e.target.value) }))}
                       className="w-full h-14 px-6 bg-neutral-50 rounded-2xl text-sm font-bold border border-neutral-100 focus:border-[var(--color-brand)] focus:bg-white outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                       placeholder="0"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Процент от продаж (%)</label>
                     <input 
                       disabled={config.type === 'FIXED'}
                       type="number"
                       step="0.1"
                       value={config.salesPercent || ''}
                       onFocus={(e) => e.target.select()}
                       onChange={e => setConfig(prev => ({ ...prev, salesPercent: Number(e.target.value) }))}
                       className="w-full h-14 px-6 bg-neutral-50 rounded-2xl text-sm font-bold border border-neutral-100 focus:border-[var(--color-brand)] focus:bg-white outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                       placeholder="0"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Бонус за заказ (₽)</label>
                     <input 
                       type="number"
                       step="1"
                       value={config.bonusPerOrder || ''}
                       onFocus={(e) => e.target.select()}
                       onChange={e => setConfig(prev => ({ ...prev, bonusPerOrder: Number(e.target.value) }))}
                       className="w-full h-14 px-6 bg-neutral-50 rounded-2xl text-sm font-bold border border-neutral-100 focus:border-[var(--color-brand)] focus:bg-white outline-none transition-all"
                       placeholder="0"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Действует с</label>
                     <input 
                       type="date"
                       value={config.validFrom || ''}
                       onChange={e => setConfig(prev => ({ ...prev, validFrom: e.target.value }))}
                       className="w-full h-14 px-6 bg-neutral-50 rounded-2xl text-sm font-bold border border-neutral-100 focus:border-[var(--color-brand)] focus:bg-white outline-none transition-all"
                     />
                  </div>
               </div>

               <div className="pt-4">
                  <button 
                    disabled={isSaving}
                    type="submit"
                    className="w-full h-16 bg-neutral-900 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Сохранить настройки
                  </button>
               </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
