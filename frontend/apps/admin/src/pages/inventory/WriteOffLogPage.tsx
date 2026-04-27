import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InventoryService } from '@/lib/api'
import { useDashboardStore } from '@/store/useDashboardStore'
import { 
  FileText, 
  Search, 
  Calendar, 
  Loader2,
  Trash2,
  AlertTriangle,
  FileWarning
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function WriteOffLogPage() {
  const { currentStoreId } = useDashboardStore()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['writeOffLogs', currentStoreId],
    queryFn: () => InventoryService.getWriteOffLogs().then(res => res.data),
  })

  const filteredLogs = logs.filter(log => {
    if (currentStoreId && log.storeId !== currentStoreId) return false;
    if (searchQuery) {
      if (!log.reason.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(log.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
          !log.productId.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    return true;
  })

  const getReasonBadge = (reason: string) => {
    const baseClass = "px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors duration-200 border";
    switch(reason) {
      case 'DAMAGE': 
        return <span className={cn(baseClass, "bg-slate-50 text-slate-700 border-slate-200")}>
          <div className="h-1 w-1 rounded-full bg-slate-500" /> Повреждено
        </span>
      case 'EXPIRY': 
        return <span className={cn(baseClass, "bg-amber-50 text-amber-700 border-amber-200")}>
          <div className="h-1 w-1 rounded-full bg-amber-500" /> Просрочено
        </span>
      case 'QUALITY': 
      case 'SPOILAGE': 
        return <span className={cn(baseClass, "bg-orange-50 text-orange-700 border-orange-200")}>
          <div className="h-1 w-1 rounded-full bg-orange-500" /> Брак/Порча
        </span>
      case 'INVENTORY_LOSS': 
        return <span className={cn(baseClass, "bg-neutral-50 text-neutral-500 border-neutral-200")}>
          <div className="h-1 w-1 rounded-full bg-neutral-400" /> Недостача
        </span>
      default: 
        return <span className={cn(baseClass, "bg-neutral-50 text-neutral-400 border-neutral-100")}>{reason}</span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 py-6">
      {/* Search and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Журнал списаний</h1>
          <p className="text-sm text-neutral-400 mt-1">Детальный учет складских инцидентов и корректировок</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-neutral-900 transition-colors" />
          <input 
            type="text" 
            placeholder="Поиск по архиву..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:ring-4 focus:ring-neutral-100/50 transition-all outline-none text-neutral-900"
          />
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-200">
              <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Период</th>
              <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Товар / Комментарий</th>
              <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">Кол-во</th>
              <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Причина</th>
              <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-right">Убыток (RUB)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-32 text-center text-neutral-300 italic text-sm">Получение данных...</td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-neutral-100" />
                    <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest">Архив пуст</p>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.map((log) => (
              <tr key={log.id} className="group hover:bg-neutral-50/30 transition-colors duration-150">
                <td className="px-6 py-5 align-top">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-900">
                      {format(new Date(log.createdAt), 'dd.MM.yyyy', { locale: ru })}
                    </span>
                    <span className="text-xs text-neutral-400 tabular-nums">
                      {format(new Date(log.createdAt), 'HH:mm', { locale: ru })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-800">
                        ID: {log.productId.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    {log.comment && (
                      <p className="text-sm text-neutral-500 leading-relaxed max-w-sm truncate whitespace-normal line-clamp-2">
                        {log.comment}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 align-top text-center">
                  <span className="inline-flex items-center justify-center min-w-[32px] h-6 px-1.5 rounded bg-neutral-100 text-xs font-bold text-neutral-700 tabular-nums border border-neutral-200">
                    {log.quantity}
                  </span>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="w-fit">
                    {getReasonBadge(log.reason)}
                  </div>
                </td>
                <td className="px-6 py-5 align-top text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-base font-bold text-rose-600 tabular-nums">
                      -{(log.totalValue || 0).toLocaleString()} <span className="text-xs">₽</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-tighter mt-1">Cost valuation</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
