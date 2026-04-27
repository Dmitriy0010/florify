import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Loader2, 
  Settings2, 
  CheckCircle2, 
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  History
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DeliveryService } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format, addDays, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'

export default function DeliverySlotsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const queryClient = useQueryClient()

  const formattedDate = format(selectedDate, 'yyyy-MM-dd')

  const { data: slotsRes, isLoading } = useQuery({
    queryKey: ['delivery-slots', formattedDate],
    queryFn: () => DeliveryService.getSlots(formattedDate).then(res => res.data)
  })

  const slots = slotsRes || []

  const formatLocalTime = (time?: string) => {
    if (!time) return '--:--'
    // Spring Boot serializes LocalTime as ISO string "HH:mm:ss" Default
    return time.substring(0, 5) // "HH:mm"
  }

  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '', maxCapacity: 5 })
  const createMutation = useMutation({
    mutationFn: (data: any) => DeliveryService.createSlot({
      date: formattedDate,
      startTime: data.startTime + ':00',
      endTime: data.endTime + ':00',
      maxCapacity: data.maxCapacity
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-slots'] })
      toast.success('Слот доставки создан')
      setShowAddModal(false)
    },
    onError: (err: any) => {
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Слоты доставки</h1>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Настройка временных интервалов и лимитов нагрузки</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="h-11 px-8 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center gap-2"
        >
           <Plus className="h-4 w-4" />
           Добавить интервал
        </button>
      </div>

      {/* Date Selector Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[2rem] border border-neutral-100 shadow-sm">
         <button 
           onClick={() => setSelectedDate(subDays(selectedDate, 1))}
           className="h-12 w-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all shadow-sm"
         >
            <ChevronLeft size={20} />
         </button>
         
         <div className="flex flex-col items-center">
            <h2 className="text-lg font-black text-neutral-900 tracking-tight">
               {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
            </h2>
            <p className="text-[10px] font-bold text-[var(--color-brand)] uppercase tracking-widest mt-1">
               {format(selectedDate, 'EEEE', { locale: ru })}
            </p>
         </div>

         <button 
           onClick={() => setSelectedDate(addDays(selectedDate, 1))}
           className="h-12 w-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all shadow-sm"
         >
            <ChevronRight size={20} />
         </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
               <Calendar size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Всего слотов</p>
               <p className="text-xl font-black text-neutral-900">{slots.length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Средняя загрузка</p>
               <p className="text-xl font-black text-neutral-900">
                  {slots.length ? Math.round(slots.reduce((acc, s) => acc + ((s.currentLoad ?? 0) / (s.maxCapacity ?? 1)), 0) / slots.length * 100) : 0}%
               </p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
               <Users size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Всего заказов</p>
               <p className="text-xl font-black text-neutral-900">
                  {slots.reduce((acc, s) => acc + (s.currentLoad ?? 0), 0)}
               </p>
            </div>
         </div>
      </div>

      {/* Slots List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
           <Loader2 className="h-10 w-10 animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest">Загрузка расписания...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-neutral-100 flex flex-col items-center gap-6 group">
           <div className="h-20 w-20 rounded-[2rem] bg-neutral-50 flex items-center justify-center text-neutral-200 group-hover:scale-110 group-hover:bg-[var(--color-brand-light)] group-hover:text-[var(--color-brand)] transition-all">
              <Clock size={40} />
           </div>
           <div>
              <p className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-2">На этот день слоты не настроены</p>
              <button onClick={() => setShowAddModal(true)} className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-widest hover:opacity-70 transition-opacity">Скопировать из шаблона или создать новый</button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {slots.map((slot) => {
             const loadPercent = ((slot.currentLoad ?? 0) / (slot.maxCapacity ?? 1)) * 100
             const isFull = (slot.currentLoad ?? 0) >= (slot.maxCapacity ?? 1)
             
             return (
               <div key={slot.id} className="bg-white p-8 rounded-[3rem] border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                  <div className="flex justify-between items-start mb-8 relative z-10">
                     <div className={cn(
                       "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                       !isFull ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"
                     )}>
                        <Clock size={28} />
                     </div>
                     <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          !isFull ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-500 border-red-100"
                        )}>
                           {!isFull ? 'Свободен' : 'Заполнен'}
                        </span>
                        <button className="h-8 w-8 flex items-center justify-center text-neutral-300 hover:text-neutral-900 transition-colors">
                           <Settings2 size={16} />
                        </button>
                     </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                     <div>
                        <h3 className="text-2xl font-black text-neutral-900 tracking-tight leading-none mb-2">
                          {formatLocalTime(slot.startTime as any)} — {formatLocalTime(slot.endTime as any)}
                        </h3>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Временной интервал</p>
                     </div>

                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                           <span className="text-neutral-300">Нагрузка</span>
                           <span className={cn(isFull ? "text-red-500" : "text-neutral-900")}>
                             {slot.currentLoad ?? 0} / {slot.maxCapacity ?? 0}
                           </span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                           <div 
                             className={cn(
                               "h-full rounded-full transition-all duration-1000",
                               isFull ? "bg-red-500" : loadPercent > 70 ? "bg-orange-400" : "bg-[var(--color-brand)]"
                             )}
                             style={{ width: `${Math.min(loadPercent, 100)}%` }} 
                           />
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-neutral-50 flex items-center justify-between relative z-10">
                     <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                        <div className={cn("h-1.5 w-1.5 rounded-full", !isFull ? "bg-green-500" : "bg-red-500")} />
                        Готов к приему
                     </span>
                     <button className="text-[10px] font-black text-neutral-900 uppercase tracking-widest hover:text-[var(--color-brand)] transition-colors">Детали</button>
                  </div>

                  <History className="absolute -right-8 -bottom-8 h-40 w-40 text-neutral-50 opacity-[0.03] group-hover:opacity-[0.08] transition-all rotate-12" />
               </div>
             )
           })}
        </div>
      )}

      {/* Add Slot Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-neutral-900 tracking-tight">Новый слот</h2>
                 <button onClick={() => setShowAddModal(false)} className="h-10 w-10 text-neutral-300 hover:text-neutral-900 transition-colors">
                    <CheckCircle2 className="h-6 w-4 rotate-45" /> 
                    {/* Placeholder for X icon */}
                 </button>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">От</label>
                       <input 
                         type="time" 
                         value={newSlot.startTime}
                         onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
                         className="w-full h-14 px-6 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-[var(--color-brand)] transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">До</label>
                       <input 
                         type="time" 
                         value={newSlot.endTime}
                         onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
                         className="w-full h-14 px-6 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-[var(--color-brand)] transition-all" 
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Max заказов</label>
                    <input 
                       type="number" 
                       step="1" 
                       value={newSlot.maxCapacity}
                       onChange={e => setNewSlot({...newSlot, maxCapacity: parseInt(e.target.value) || 0})}
                       className="w-full h-14 px-6 bg-neutral-50 border border-neutral-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-[var(--color-brand)] transition-all" 
                    />
                 </div>
              </div>

              <div className="mt-10 flex flex-col gap-3">
                 <button 
                   onClick={() => createMutation.mutate(newSlot)}
                   disabled={!newSlot.startTime || !newSlot.endTime || createMutation.isPending}
                   className="h-14 bg-neutral-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex justify-center items-center gap-2 disabled:opacity-50"
                 >
                   {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                   Создать слот
                 </button>
                 <button onClick={() => setShowAddModal(false)} className="h-14 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors">Отмена</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
