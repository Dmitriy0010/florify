import { useState } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Loader2, 
  Phone, 
  User, 
  ChevronRight,
  History,
  MoreVertical,
  Mail,
  Zap
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { CustomerService, AnalyticsService } from '@/lib/api'
import { cn } from '@/lib/utils'
import { CustomerDetailModal } from '@/components/customers/CustomerDetailModal'
import { CreateCustomerModal } from '@/components/customers/CreateCustomerModal'

export default function CustomersPage() {
  const [searchPhone, setSearchPhone] = useState('')
  const [page, setPage] = useState(0)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterTier, setFilterTier] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // 1. Fetch Customers
  const { data: customersRes, isLoading } = useQuery({
    queryKey: ['customers', searchPhone, page, filterTier, showArchived],
    queryFn: () => CustomerService.list({ 
      phone: searchPhone, 
      page, 
      size: 10,
      // Note: We need to update CustomerService.list to support these if not already done
      ...(filterTier ? { tier: filterTier } : {}),
      ...(showArchived ? { includeArchived: true } : {})
    }),
  })

  // 2. Fetch Stats
  const { data: stats } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: () => AnalyticsService.getCustomerStats().then(res => res.data)
  })

  const customers = customersRes?.data?.content || []
  const totalElements = (customersRes?.data as any)?.totalElements || 0
  const totalPages = (customersRes?.data as any)?.totalPages || 0

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 py-6 px-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Клиенты (CRM)</h1>
          <p className="text-sm text-neutral-500 mt-1">База покупателей и управление лояльностью</p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="h-10 px-4 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-all flex items-center gap-2"
        >
           <Plus size={18} />
           Новый клиент
        </button>
      </div>

      {/* Stats Cards - Table Style Mini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Всего клиентов', val: totalElements || 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
           { label: 'Новые (месяц)', val: stats?.newCustomersLastMonth || '0', icon: History, color: 'text-green-600 bg-green-50' },
           { label: 'Средний чек', val: `${(stats?.averageOrderValue || 0).toLocaleString()} ₽`, icon: Zap, color: 'text-orange-600 bg-orange-50' },
           { label: 'Активные баллы', val: (stats?.totalLoyaltyPoints || 0).toLocaleString(), icon: Zap, color: 'text-purple-600 bg-purple-50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white px-5 py-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4">
             <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stat.color)}>
               <stat.icon size={20} />
             </div>
             <div>
               <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider leading-none">{stat.label}</p>
               <p className="text-lg font-bold text-neutral-900 mt-1.5">{stat.val}</p>
             </div>
           </div>
         ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Поиск по номеру телефона..."
            value={searchPhone}
            onChange={(e) => {
              setSearchPhone(e.target.value)
              setPage(0)
            }}
            className="w-full h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-neutral-900 transition-all outline-none text-neutral-900 font-medium"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "h-10 px-4 border rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
              isFilterOpen || filterTier || showArchived
                ? "bg-neutral-900 border-neutral-900 text-white"
                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
            )}
          >
             <Filter size={16} />
             Фильтры
             {(filterTier || showArchived) && (
               <span className="ml-1 px-1.5 py-0.5 bg-white text-neutral-900 rounded text-[10px] font-bold">!</span>
             )}
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in duration-200">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Уровень лояльности</label>
                    <div className="grid grid-cols-1 gap-1">
                       {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map(t => (
                         <button
                           key={t}
                           onClick={() => setFilterTier(filterTier === t ? null : t)}
                           className={cn(
                             "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                             filterTier === t ? "bg-neutral-900 text-white" : "hover:bg-neutral-50 text-neutral-600"
                           )}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={cn(
                            "w-10 h-5 rounded-full transition-all",
                            showArchived ? "bg-neutral-900" : "bg-neutral-200"
                          )} />
                          <div className={cn(
                            "absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all",
                            showArchived ? "translate-x-5" : ""
                          )} />
                       </div>
                       <span className="text-xs font-bold text-neutral-700 group-hover:text-black transition-colors">Показать архивные</span>
                    </label>
                  </div>

                  <button 
                    onClick={() => {
                      setFilterTier(null)
                      setShowArchived(false)
                      setIsFilterOpen(false)
                    }}
                    className="w-full py-2 text-[10px] font-bold uppercase text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    Сбросить всё
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-200">
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Клиент</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Контакты</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Лояльность</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">Статус</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-right">Баланс баллов</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-24 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-neutral-200" />
                      <p className="text-sm text-neutral-400 font-medium">Загрузка базы клиентов...</p>
                   </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-24 text-center text-neutral-400 italic text-sm font-medium">Клиенты не найдены</td>
              </tr>
            ) : customers.map((customer) => (
              <tr 
                key={customer.id} 
                onClick={() => setSelectedCustomerId(customer.id!)}
                className="group hover:bg-neutral-50/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{customer.firstName} {customer.lastName}</p>
                      <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-tighter">ID: {customer.id!.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm text-neutral-900 font-bold">
                         <Phone size={12} className="text-neutral-400" />
                         <span className="tabular-nums">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 font-bold">
                           <Mail size={12} className="text-neutral-400" />
                           <span>{customer.email}</span>
                        </div>
                      )}
                   </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Bronze Tier</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                   {customer.active ? (
                     <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                        Активен
                     </span>
                   ) : (
                     <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200 text-[10px] font-bold uppercase tracking-wider">
                        Архив
                     </span>
                   )}
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-sm font-black text-neutral-900 tabular-nums tracking-tight">
                    {(customer as any).loyaltyPoints?.toLocaleString() || 0}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                   <ChevronRight size={16} className="text-neutral-300 group-hover:text-neutral-900 ml-auto transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
           {Array.from({ length: totalPages }).map((_, i) => (
             <button
               key={i}
               onClick={() => setPage(i)}
               className={cn(
                 "h-9 w-9 rounded-lg font-bold text-xs transition-all",
                 page === i 
                   ? "bg-neutral-900 text-white shadow-md shadow-black/10" 
                   : "bg-white border border-neutral-200 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900"
               )}
             >
               {i + 1}
             </button>
           ))}
        </div>
      )}

      {/* Footer Meta */}
      <div className="flex items-center gap-2 px-2 opacity-50">
         <History size={12} />
         <span className="text-[10px] font-medium tracking-tight uppercase">CRM Module v3.1.2</span>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateCustomerModal 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}

      {selectedCustomerId && (
        <CustomerDetailModal 
          id={selectedCustomerId} 
          onClose={() => setSelectedCustomerId(null)} 
        />
      )}
    </div>
  )
}
