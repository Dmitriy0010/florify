import { 
  Gift, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Target,
  ArrowUpRight,
  History,
  Users
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { LoyaltyService } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function LoyaltyPage() {
  const { data: tiers = [], isLoading: isLoadingTiers } = useQuery({
    queryKey: ['loyalty-tiers'],
    queryFn: () => LoyaltyService.getTiers().then(res => res.data)
  })

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['loyalty-stats'],
    queryFn: () => LoyaltyService.getStats().then(res => res.data)
  })

  const formatPoints = (points: number) => {
    if (points >= 1000000) return (points / 1000000).toFixed(1) + 'M'
    if (points >= 1000) return (points / 1000).toFixed(1) + 'K'
    return points
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="h-16 w-16 rounded-[2rem] bg-neutral-900 text-[var(--color-brand)] flex items-center justify-center shadow-2xl">
              <Gift size={32} />
           </div>
           <div>
             <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">Программа Лояльности</h1>
             <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mt-1">Управление уровнями и бонусами клиентов</p>
           </div>
        </div>

        <button 
          onClick={() => alert('Функция запуска акций в разработке')}
          className="h-12 px-8 bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
        >
           <Zap size={16} />
           Запустить акцию
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         
         {/* Tiers Management */}
         <div className="xl:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {isLoadingTiers ? (
                 <div className="col-span-full h-40 flex items-center justify-center opacity-20">
                    <Loader2 className="animate-spin" />
                 </div>
               ) : Array.isArray(tiers) && tiers.map((tier: any, i: number) => (
                 <div key={i} className="bg-white p-8 rounded-[3rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8 relative z-10">
                       <div className={cn(
                         "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                         i === 0 ? "bg-amber-400" : i === 1 ? "bg-neutral-400" : i === 2 ? "bg-yellow-400" : "bg-neutral-900"
                       )}>
                          <Award size={28} />
                       </div>
                       <span className="px-3 py-1 rounded-full bg-neutral-50 text-[9px] font-black uppercase tracking-widest text-neutral-400 border border-neutral-100">
                          ID: {tier.id || tier.tier || 'N/A'}
                       </span>
                    </div>

                    <div className="space-y-2 relative z-10">
                       <h3 className="text-2xl font-black text-neutral-900 tracking-tight">{tier.name || tier.tier}</h3>
                       <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                         {tier.cashbackPercent || tier.discountPercent}% бонус • Порог {(tier.minSpend || 0).toLocaleString()} ₽
                       </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-50 flex items-center justify-between relative z-10">
                       <div className="flex -space-x-2">
                          {[1,2,3].map(j => (
                            <div key={j} className="h-8 w-8 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center">
                               <Users size={12} className="text-neutral-300" />
                            </div>
                          ))}
                       </div>
                       <button 
                         onClick={() => alert(`Настройка уровня ${tier.name || tier.tier} (Enum Backend) доступна только разработчикам`)}
                         className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand)] hover:underline"
                        >
                          Настроить
                        </button>
                    </div>

                    <Award className="absolute -right-12 -bottom-12 h-48 w-48 text-neutral-50 opacity-[0.03] group-hover:opacity-[0.08] transition-all rotate-12" />
                 </div>
               ))}
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-neutral-100 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-neutral-900 tracking-tight">Последние транзакции баллов</h2>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-neutral-900 transition-colors">
                     <History size={14} />
                     Вся история
                  </button>
               </div>

               <div className="space-y-4">
                  {isLoadingStats ? (
                    <div className="h-40 flex items-center justify-center opacity-20">
                       <Loader2 className="animate-spin" />
                    </div>
                  ) : stats?.recentTransactions?.length ? (
                    stats.recentTransactions.map((tx: any) => (
                      <div key={tx.id} className="p-5 bg-neutral-50 rounded-3xl flex items-center justify-between group hover:bg-white transition-all border border-transparent hover:border-neutral-100">
                         <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded-xl bg-white border border-neutral-100 flex items-center justify-center transition-all",
                              tx.type === 'EARN' ? "text-green-500 bg-green-50" : "text-amber-500 bg-amber-50"
                            )}>
                               <TrendingUp size={18} />
                            </div>
                            <div>
                               <p className="text-sm font-black text-neutral-900">{tx.description || (tx.type === 'EARN' ? 'Начисление' : 'Списание')}</p>
                               <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                                 {new Date(tx.occurredAt).toLocaleString('ru-RU')}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className={cn(
                              "text-sm font-black tabular-nums",
                              tx.type === 'EARN' ? "text-green-500" : "text-amber-500"
                            )}>
                              {tx.type === 'EARN' ? '+' : '-'}{tx.points} Б
                            </p>
                            <ChevronRight size={16} className="text-neutral-200 ml-auto mt-1" />
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-neutral-300 text-xs font-bold uppercase tracking-widest">
                       Транзакций пока нет
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Sidebar / Stats */}
         <div className="xl:col-span-4 space-y-8">
            <div className="bg-[#1F2128] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
               {isLoadingStats ? (
                 <div className="h-60 flex items-center justify-center opacity-20">
                    <Loader2 className="animate-spin" />
                 </div>
               ) : (
                 <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-[0.2em]">Статистика</p>
                       <h2 className="text-4xl font-black tracking-tighter">{formatPoints(stats?.totalEarnedPoints || 0)}</h2>
                       <p className="text-xs font-medium text-white/40 leading-relaxed">Суммарно начислено баллов всем клиентам за все время</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Списано</p>
                          <p className="text-lg font-black">{formatPoints(stats?.totalSpentPoints || 0)}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Активно</p>
                          <p className="text-lg font-black text-green-400">{formatPoints(stats?.activePoints || 0)}</p>
                       </div>
                    </div>

                    <button 
                      onClick={() => alert('Экспорт будет доступен после настройки модуля отчетов')}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                       <ArrowUpRight size={14} className="text-[var(--color-brand)]" />
                       Экспорт в PDF
                    </button>
                 </div>
               )}
               <Target size={240} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-neutral-100 shadow-sm">
               <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-8">Совет AI Аналитика</h3>
               <div className="p-6 bg-brand-50/30 rounded-3xl border border-[var(--color-brand-light)] space-y-4">
                  <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
                    На основе реальных данных: <b>{(stats?.activePoints || 0) > 1000 ? 'У вас много неиспользованных баллов.' : 'Баланс баллов в норме.'}</b> Рекомендуем запустить рассылку для стимуляции покупок.
                  </p>
                  <button className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand)] hover:opacity-70 transition-opacity">Применить план</button>
               </div>
            </div>
         </div>

      </div>
    </div>
  )
}
