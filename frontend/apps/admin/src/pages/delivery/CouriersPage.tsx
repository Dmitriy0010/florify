import { useState } from 'react'
import { 
  Truck, 
  Search, 
  Filter, 
  Loader2, 
  MapPin, 
  Clock, 
  User, 
  Package,
  Navigation2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  UserPlus
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DeliveryService, EmployeeService } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'

export default function CouriersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  
  const { data: tasksRes, isLoading } = useQuery({
    queryKey: ['delivery-tasks'],
    queryFn: () => DeliveryService.getTasks().then(res => res.data)
  })

  const { data: employeesRes } = useQuery({
    queryKey: ['employees-for-assignment'],
    queryFn: () => EmployeeService.getAll(undefined, true, 0, 100).then(res => res.data),
    enabled: !!selectedTaskId
  })

  const tasks = tasksRes || []
  const couriers = (employeesRes?.data || []).filter(e => e.role === 'COURIER')

  const statusMutation = useMutation({
    mutationFn: ({ id, status, courierId, failureReason }: { id: string, status: any, courierId?: string, failureReason?: string }) => {
      if (status === 'ASSIGNED' && courierId) {
        return DeliveryService.assignCourier(id, courierId)
      }
      return DeliveryService.updateStatus(id, status, failureReason)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-tasks'] })
      toast.success('Статус задачи обновлен')
      setSelectedTaskId(null)
    },
    onError: (err: any) => {
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    }
  })

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-50 text-green-600 border-green-100'
      case 'ASSIGNED': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'PICKED_UP': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'FAILED': return 'bg-red-50 text-red-600 border-red-100'
      case 'CREATED': return 'bg-orange-50 text-orange-600 border-orange-100'
      default: return 'bg-neutral-50 text-neutral-400 border-neutral-100'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'DELIVERED': return 'Доставлен'
      case 'ASSIGNED': return 'Назначен'
      case 'PICKED_UP': return 'В пути'
      case 'FAILED': return 'Ошибка'
      case 'CREATED': return 'Новый'
      case 'CANCELLED': return 'Отменен'
      default: return status || '—'
    }
  }

  const handleStatusUpdate = (task: any, nextStatus: any) => {
    if (!task.id) return
    if (nextStatus === 'FAILED') {
      const reason = prompt('Укажите причину ошибки:')
      if (!reason) return
      statusMutation.mutate({ id: task.id, status: nextStatus, failureReason: reason })
    } else {
      statusMutation.mutate({ id: task.id, status: nextStatus })
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Логистика и Доставка</h1>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Управление курьерами и оперативный контроль</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="px-5 py-2.5 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Курьеры онлайн</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-[var(--color-brand)] transition-colors" />
            <input 
              type="text" 
              placeholder="Поиск по адресу, заказу или курьеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-5 bg-white border border-neutral-100 rounded-2xl text-sm font-bold focus:border-[var(--color-brand)] transition-all outline-none"
            />
         </div>
         <button className="h-12 px-8 bg-white border border-neutral-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-3 hover:border-neutral-200 transition-all shadow-sm">
            <Filter className="h-4 w-4" />
            Фильтры
         </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
           <Loader2 className="h-10 w-10 animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest">Загрузка задач...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
           {tasks.map((task) => (
             <div key={task.id} className="bg-white p-8 rounded-[3rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="flex items-start justify-between mb-8 relative z-10">
                   <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-[var(--color-brand-light)] group-hover:text-[var(--color-brand)] transition-all shadow-inner">
                         <MapPin size={32} />
                      </div>
                      <div className="max-w-[200px] md:max-w-xs">
                         <p className="text-lg font-black text-neutral-900 tracking-tight leading-tight group-hover:text-[var(--color-brand)] transition-colors">{task.deliveryAddress}</p>
                         <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                           <Navigation2 size={10} className="rotate-45" />
                           Расстояние: ~2.4 км
                         </p>
                      </div>
                   </div>
                   <span className={cn(
                     "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                     getStatusStyle(task.status)
                   )}>
                      {getStatusLabel(task.status)}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                   <div className="p-5 bg-neutral-50 rounded-[2rem] border border-neutral-100 group-hover:bg-white transition-all">
                      <div className="flex items-center gap-2 mb-2 opacity-40">
                        <Package className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Заказ</span>
                      </div>
                      <p className="text-sm font-black text-neutral-900 truncate">#{task.orderId ? task.orderId.substring(0, 8).toUpperCase() : '—'}</p>
                   </div>
                   <div className="p-5 bg-neutral-50 rounded-[2rem] border border-neutral-100 group-hover:bg-white transition-all">
                      <div className="flex items-center gap-2 mb-2 opacity-40">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Прибытие к</span>
                      </div>
                      <p className="text-sm font-black text-neutral-900">
                        {task.estimatedArrival ? format(new Date(task.estimatedArrival), 'HH:mm', { locale: ru }) : '—'}
                      </p>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 pt-6 border-t border-neutral-50">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-300">
                         {task.courierId ? <CheckCircle2 className="text-green-500" size={20} /> : <User size={20} />}
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Ответственный</p>
                        <p className={cn("text-xs font-bold", task.courierId ? "text-neutral-900" : "text-neutral-400 italic")}>
                          {task.courierId ? 'Курьер назначен' : 'Не назначен'}
                        </p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 w-full md:w-auto">
                      {task.status === 'CREATED' && task.id && (
                        <button 
                          onClick={() => setSelectedTaskId(task.id!)}
                          className="flex-1 md:flex-none h-11 px-6 bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                        >
                           <UserPlus size={14} />
                           Назначить
                        </button>
                      )}
                      
                      {task.status === 'ASSIGNED' && (
                        <button 
                          onClick={() => handleStatusUpdate(task, 'PICKED_UP')}
                          className="flex-1 md:flex-none h-11 px-6 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                        >
                           <Truck size={14} />
                           Забрал товар
                        </button>
                      )}

                      {task.status === 'PICKED_UP' && (
                        <button 
                          onClick={() => handleStatusUpdate(task, 'DELIVERED')}
                          className="flex-1 md:flex-none h-11 px-6 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                        >
                           <CheckCircle2 size={14} />
                           Доставлено
                        </button>
                      )}

                      {['CREATED', 'ASSIGNED', 'PICKED_UP'].includes(task.status || '') && (
                        <button 
                          onClick={() => handleStatusUpdate(task, 'FAILED')}
                          className="h-11 w-11 flex items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                        >
                           <XCircle size={18} />
                        </button>
                      )}
                   </div>
                </div>

                <div className="absolute -right-16 -bottom-16 h-64 w-64 bg-neutral-50/50 rounded-full blur-3xl group-hover:bg-[var(--color-brand-light)]/30 transition-colors" />
             </div>
           ))}
        </div>
      )}

      {/* Assignment Modal */}
      {selectedTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-neutral-900 tracking-tight">Назначить курьера</h2>
                 <button onClick={() => setSelectedTaskId(null)} className="text-neutral-300 hover:text-neutral-900 transition-colors"><XCircle size={24} /></button>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                 {couriers.length === 0 ? (
                   <p className="py-10 text-center text-[10px] font-black text-neutral-300 uppercase tracking-widest border-2 border-dashed border-neutral-100 rounded-3xl">Курьеры не найдены</p>
                 ) : couriers.map(e => (
                   <button 
                     key={e.id}
                     onClick={() => e.id && statusMutation.mutate({ id: selectedTaskId, status: 'ASSIGNED', courierId: e.id })}
                     className="w-full p-5 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between group hover:bg-[var(--color-brand)] hover:border-[var(--color-brand)] transition-all"
                   >
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent transition-all">
                            <User size={18} />
                         </div>
                         <div className="text-left">
                            <p className="text-sm font-black text-neutral-900 group-hover:text-white transition-colors">{e.firstName} {e.lastName}</p>
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-white/60 transition-colors">Активен</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-neutral-200 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                   </button>
                 ))}
              </div>

              <div className="mt-10">
                 <button onClick={() => setSelectedTaskId(null)} className="w-full h-14 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors">Отмена</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
