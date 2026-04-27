import { useState } from 'react'
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Package, 
  Tag as TagIcon, 
  Star,
  History,
  TrendingUp,
  CreditCard,
  Loader2,
  Save,
  Trash2,
  ChevronRight,
  Plus,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CustomerService, LoyaltyService, OrderService, OrderResponse, LoyaltyTransaction } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { OrderDetailModal } from '../orders/OrderDetailModal'

interface CustomerDetailModalProps {
  id: string
  onClose: () => void
}

type Tab = 'info' | 'orders' | 'loyalty'

export function CustomerDetailModal({ id, onClose }: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [adjustingPoints, setAdjustingPoints] = useState<{type: 'EARN' | 'WITHDRAW', open: boolean}>({type: 'EARN', open: false})
  const [pointsAmount, setPointsAmount] = useState<number>(0)
  const [adjustDescription, setAdjustDescription] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    tags: [] as string[]
  })
  
  // Data fetching
  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => CustomerService.getById(id).then(res => {
      const data = res.data
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        birthDate: data.birthDate || '',
        tags: data.tags || []
      })
      return data
    })
  })

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['customer-orders', id],
    queryFn: () => OrderService.getOrders({ customerId: id }).then(res => res.data),
    enabled: activeTab === 'orders'
  })

  const { data: loyaltyAccount, refetch: refetchAccount } = useQuery({
    queryKey: ['customer-loyalty', id],
    queryFn: () => LoyaltyService.getAccount(id).then(res => res.data),
    enabled: activeTab === 'loyalty'
  })

  const { data: loyaltyTransactions = [], isLoading: isLoadingTransactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['customer-loyalty-tx', id],
    queryFn: () => LoyaltyService.getTransactions(id).then(res => res.data),
    enabled: activeTab === 'loyalty'
  })

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: any) => CustomerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Данные клиента обновлены')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Ошибка обновления')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => CustomerService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Клиент деактивирован')
      onClose()
    }
  })

  const adjustPointsMutation = useMutation({
    mutationFn: () => LoyaltyService.adjustPoints(id, { 
      points: pointsAmount, 
      type: adjustingPoints.type, 
      description: adjustDescription 
    }),
    onSuccess: () => {
      toast.success(adjustingPoints.type === 'EARN' ? 'Баллы начислены' : 'Баллы списаны')
      setAdjustingPoints({ ...adjustingPoints, open: false })
      setPointsAmount(0)
      setAdjustDescription('')
      refetchAccount()
      refetchTransactions()
    },
    onError: (err: any) => {
       toast.error(err.response?.data?.message || 'Ошибка при изменении баллов')
    }
  })

  if (isLoadingCustomer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
        </div>
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 border border-neutral-200">
        
        {/* Left Sidebar - Profile Summary */}
        <div className="w-full md:w-80 bg-neutral-50 p-10 border-r border-neutral-100 flex flex-col overflow-y-auto shrink-0 scrollbar-hide">
           <div className="flex flex-col items-center text-center">
              <div className="h-28 w-28 rounded-[2.5rem] bg-white border border-neutral-200 flex items-center justify-center text-neutral-200 shadow-xl mb-6">
                 <User size={56} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight leading-tight">
                {customer.firstName} {customer.lastName}
              </h2>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">ID: {id.slice(0,8)}</p>
              
              <div className="mt-8 grid grid-cols-2 gap-3 w-full">
                 <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-center shadow-sm">
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Заказов</p>
                    <p className="text-lg font-bold text-neutral-900">{orders.length}</p>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-center shadow-sm">
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Баллы</p>
                    <p className="text-lg font-bold text-neutral-900">{loyaltyAccount?.availablePoints || 0}</p>
                 </div>
              </div>
           </div>

           <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4 group">
                 <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-sm">
                    <Phone size={18} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Телефон</p>
                    <p className="text-sm font-semibold text-neutral-900 truncate">{customer.phone}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 group">
                 <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-sm">
                    <Mail size={18} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Email</p>
                    <p className="text-sm font-semibold text-neutral-900 truncate">{customer.email || '—'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 group">
                 <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-sm">
                    <Calendar size={18} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">День рождения</p>
                    <p className="text-sm font-semibold text-neutral-900 truncate">{customer.birthDate || 'Не указан'}</p>
                 </div>
              </div>
           </div>

           <div className="mt-auto pt-10">
              <button 
                onClick={() => { if(confirm('Уверены, что хотите деактивировать клиента?')) deleteMutation.mutate(); }}
                disabled={deleteMutation.isPending}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest border border-red-100"
              >
                {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Деактивировать
              </button>
           </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden p-10">
           {/* Header & Tabs */}
           <div className="flex items-center justify-between mb-8">
              <div className="flex gap-2">
                 {(['info', 'orders', 'loyalty'] as const).map(tab => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={cn(
                       "h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                       activeTab === tab 
                         ? "bg-neutral-900 text-white shadow-lg" 
                         : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                     )}
                   >
                     {tab === 'info' ? 'Профиль' : tab === 'orders' ? 'Заказы' : 'Лояльность'}
                   </button>
                 ))}
              </div>
              <button onClick={onClose} className="h-10 w-10 rounded-xl hover:bg-neutral-100 transition-all text-neutral-300 hover:text-neutral-900 flex items-center justify-center">
                <X size={24} />
              </button>
           </div>

           {/* Tab Content */}
           <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
              {activeTab === 'info' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Имя</label>
                         <input 
                           type="text" 
                           value={formData.firstName} 
                           onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                           className="w-full h-12 px-5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-neutral-900 transition-all outline-none"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Фамилия</label>
                         <input 
                           type="text" 
                           value={formData.lastName} 
                           onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                           className="w-full h-12 px-5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-neutral-900 transition-all outline-none"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Email</label>
                         <input 
                           type="email" 
                           value={formData.email} 
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="w-full h-12 px-5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-neutral-900 transition-all outline-none"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">День рождения</label>
                         <input 
                           type="date" 
                           value={formData.birthDate} 
                           onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                           className="w-full h-12 px-5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-neutral-900 transition-all outline-none"
                         />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <TagIcon size={14} className="text-neutral-400" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Теги клиента</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {(formData.tags || []).map((tag, idx) => (
                           <span key={idx} className="px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[10px] font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                             {tag}
                             <X 
                               size={10} 
                               className="cursor-pointer hover:text-red-500" 
                               onClick={() => setFormData({...formData, tags: formData.tags.filter(t => t !== tag)})}
                             />
                           </span>
                         ))}
                         <button 
                            type="button"
                            onClick={() => {
                               const tag = prompt('Введите тег:');
                               if (tag && tag.trim()) {
                                 const trimmed = tag.trim();
                                 if (!formData.tags.includes(trimmed)) {
                                   setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }))
                                 }
                               }
                            }}
                            className="h-8 px-3 rounded-lg border border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900 transition-all flex items-center justify-center gap-2"
                         >
                            <Plus size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Добавить</span>
                         </button>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-neutral-100 flex justify-end">
                      <button 
                        onClick={() => updateMutation.mutate(formData)}
                        disabled={updateMutation.isPending}
                        className="h-12 px-8 bg-neutral-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg"
                      >
                        {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Сохранить
                      </button>
                   </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                   {isLoadingOrders ? (
                     <div className="flex flex-col items-center py-20 gap-3 opacity-30">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Загрузка...</span>
                     </div>
                   ) : orders.length === 0 ? (
                     <div className="py-20 text-center border border-dashed border-neutral-200 rounded-[2rem] opacity-30">
                        <Package className="h-10 w-10 mx-auto mb-3" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Заказов нет</p>
                     </div>
                   ) : (
                     <div className="space-y-3">
                        {orders.map((order: OrderResponse) => (
                           <div key={order.id} 
                               onClick={() => setSelectedOrderId(order.id!)}
                               className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 group hover:bg-white hover:border-neutral-200 transition-all flex items-center justify-between cursor-pointer"
>
                              <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                                    <Package size={20} />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-bold text-neutral-900 tracking-tight">#{order.orderNumber}</h4>
                                    <p className="text-[10px] font-medium text-neutral-400 mt-0.5">
                                      {new Date(order.createdAt!).toLocaleDateString()} • {order.items?.length || 0} позиций
                                    </p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="text-right">
                                    <p className="text-base font-bold text-neutral-900">{(order.finalAmount ?? 0).toLocaleString()} ₽</p>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                                       {order.status}
                                    </span>
                                 </div>
                                 <ChevronRight size={16} className="text-neutral-300 group-hover:text-neutral-900 transition-colors" />
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>
              )}

              {activeTab === 'loyalty' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                   {/* Points Summary Area */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden ring-4 ring-neutral-900/5">
                         <div className="relative z-10">
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">Баланс баллов</p>
                            <p className="text-5xl font-black">{(loyaltyAccount?.availablePoints || 0).toLocaleString()}</p>
                            <div className="mt-6 flex items-center gap-2 bg-white/20 w-fit px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                               <Star size={14} className="fill-yellow-400 text-yellow-400" />
                               <span className="text-[10px] font-black uppercase tracking-widest">{loyaltyAccount?.tier || 'BRONZE'} TIER</span>
                            </div>
                         </div>
                         <Zap size={140} className="absolute -right-8 -bottom-8 text-white/5 rotate-12" />
                      </div>

                      <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-200 shadow-sm flex flex-col justify-between hover:border-neutral-900 transition-colors group/edit">
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-6 group-hover/edit:text-neutral-900 transition-colors">Управление баллами</p>
                            <div className="flex gap-3">
                               <button 
                                 onClick={() => setAdjustingPoints({type: 'EARN', open: true})}
                                 className="flex-1 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                               >
                                  <Plus size={16} />
                                  Начислить
                               </button>
                               <button 
                                 onClick={() => setAdjustingPoints({type: 'WITHDRAW', open: true})}
                                 className="flex-1 h-12 bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white transition-all shadow-sm active:scale-95"
                               >
                                  <ArrowDownRight size={16} />
                                  Списать
                               </button>
                            </div>
                         </div>
                         <p className="text-[10px] text-neutral-500 mt-6 leading-relaxed font-medium">
                            Ручное изменение баланса будет сохранено в истории транзакций клиента.
                         </p>
                      </div>
                   </div>

                   {/* Adjustment Form (Inline Modal Style) */}
                   {adjustingPoints.open && (
                      <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 animate-in slide-in-from-top-4 duration-300">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-700">
                               {adjustingPoints.type === 'EARN' ? 'Начисление баллов' : 'Списание баллов'}
                            </h3>
                            <button onClick={() => setAdjustingPoints({...adjustingPoints, open: false})} className="p-1 hover:bg-neutral-200 rounded-lg transition-colors">
                               <X size={16} className="text-neutral-400" />
                            </button>
                         </div>
                         <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 block">Количество</label>
                                  <input 
                                    type="number" 
                                    value={pointsAmount === 0 ? '' : pointsAmount}
                                    onChange={(e) => setPointsAmount(Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    className="w-full h-12 px-5 bg-white border border-neutral-300 rounded-xl text-sm font-black outline-none focus:border-neutral-900 transition-all shadow-sm"
                                    placeholder="0"
                                  />
                               </div>
                               <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 block">Причина</label>
                                  <input 
                                    type="text" 
                                    value={adjustDescription}
                                    onChange={(e) => setAdjustDescription(e.target.value)}
                                    className="w-full h-12 px-5 bg-white border border-neutral-300 rounded-xl text-sm font-bold outline-none focus:border-neutral-900 transition-all shadow-sm focus:bg-neutral-50"
                                    placeholder="Напр. Бонус за отзыв"
                                  />
                               </div>
                            </div>
                            <button 
                              onClick={() => adjustPointsMutation.mutate()}
                              disabled={adjustPointsMutation.isPending || pointsAmount <= 0}
                              className="w-full h-11 bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                               {adjustPointsMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                               Подтвердить
                            </button>
                         </div>
                      </div>
                   )}

                   {/* Transactions List */}
                   <div className="space-y-4 pb-10">
                      <div className="flex items-center gap-2">
                        <History size={14} className="text-neutral-400" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">История транзакций</span>
                      </div>
                      
                      {isLoadingTransactions ? (
                         <div className="flex justify-center py-10"><Loader2 className="animate-spin text-neutral-200" /></div>
                      ) : loyaltyTransactions.length === 0 ? (
                         <p className="py-10 text-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest border border-dashed border-neutral-200 rounded-3xl">Транзакций пока нет</p>
                      ) : (
                         <div className="space-y-2">
                            {loyaltyTransactions.map((tx: LoyaltyTransaction) => (
                               <div key={tx.id} className="p-4 bg-white rounded-xl border border-neutral-100 flex items-center justify-between group hover:border-neutral-200 transition-all shadow-sm">
                                  <div className="flex items-center gap-4">
                                     <div className={cn(
                                       "h-9 w-9 rounded-lg flex items-center justify-center shadow-sm border border-neutral-100",
                                       (tx.points ?? 0) > 0 ? "bg-emerald-50 text-emerald-600" : "bg-neutral-50 text-neutral-400"
                                     )}>
                                        {(tx.points ?? 0) > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-neutral-900 tracking-tight">{tx.description || tx.type}</p>
                                        <p className="text-[9px] font-medium text-neutral-400 mt-0.5">{new Date(tx.occurredAt!).toLocaleString()}</p>
                                     </div>
                                  </div>
                                  <span className={cn(
                                    "text-sm font-bold tabular-nums",
                                    (tx.points ?? 0) > 0 ? "text-emerald-600" : "text-neutral-600"
                                  )}>
                                     {(tx.points ?? 0) > 0 ? '+' : ''}{(tx.points ?? 0)}
                                  </span>
                                </div>
                            ))}
                         </div>
                      )}
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {selectedOrderId && (
        <OrderDetailModal 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  )
}
