import { Calendar } from 'lucide-react'
import { useDashboardStore } from '@/store/useDashboardStore'
import { format, subDays, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'

export function DashboardFilters() {
  const { dateRange, setDateRange } = useDashboardStore()

  const setPreset = (days: number) => {
    const to = new Date()
    const from = days === 0 ? startOfDay(to) : subDays(to, days)
    setDateRange({ from: from.toISOString(), to: to.toISOString() })
  }

  const isPresetActive = (days: number) => {
    const now = new Date().toISOString().split('T')[0]
    const currentTo = dateRange.to.split('T')[0]
    const currentFrom = dateRange.from.split('T')[0]
    
    if (currentTo !== now) return false
    
    const targetedFrom = (days === 0 ? startOfDay(new Date()) : subDays(new Date(), days)).toISOString().split('T')[0]
    return currentFrom === targetedFrom
  }

  return (
    <div className="flex flex-wrap items-center gap-6 bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm">
      {/* Quick Presets */}
      <div className="flex items-center bg-neutral-50 p-1.5 rounded-2xl border border-neutral-100">
        <button 
          onClick={() => setPreset(0)}
          className={cn(
            "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            isPresetActive(0) ? "bg-white text-[var(--color-brand)] shadow-sm" : "text-neutral-400 hover:text-neutral-600"
          )}
        >
          Сегодня
        </button>
        <button 
          onClick={() => setPreset(7)}
          className={cn(
            "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            isPresetActive(7) ? "bg-white text-[var(--color-brand)] shadow-sm" : "text-neutral-400 hover:text-neutral-600"
          )}
        >
          7 Дней
        </button>
        <button 
          onClick={() => setPreset(30)}
          className={cn(
            "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            isPresetActive(30) ? "bg-white text-[var(--color-brand)] shadow-sm" : "text-neutral-400 hover:text-neutral-600"
          )}
        >
          30 Дней
        </button>
      </div>

      <div className="h-6 w-px bg-neutral-100 hidden md:block" />

      {/* Date Range Picker */}
      <div className="flex items-center gap-4 px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl relative group">
        <div className="text-neutral-400 group-hover:text-[var(--color-brand)] transition-colors">
          <Calendar className="h-4 w-4" />
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="date"
            value={format(new Date(dateRange.from), 'yyyy-MM-dd')}
            onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value).toISOString() })}
            className="bg-transparent text-xs font-bold text-neutral-700 outline-none focus:text-[var(--color-brand)] transition-colors cursor-pointer"
          />
          <span className="text-neutral-300 font-bold">—</span>
          <input 
            type="date"
            value={format(new Date(dateRange.to), 'yyyy-MM-dd')}
            onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value).toISOString() })}
            className="bg-transparent text-xs font-bold text-neutral-700 outline-none focus:text-[var(--color-brand)] transition-colors cursor-pointer"
          />
        </div>
      </div>
     
      <div className="ml-auto flex items-center gap-3">
         <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 leading-none">Обновление</span>
            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.2em] mt-1">Live Mode</span>
         </div>
         <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-green-50 text-green-500 border border-green-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse transition-all" />
         </div>
      </div>
    </div>
  )
}
