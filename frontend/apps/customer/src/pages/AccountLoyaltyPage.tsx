import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Trophy, Star, TrendingUp, Gift, CreditCard, ChevronRight, ChevronDown, Loader2, Sparkles } from 'lucide-react'
import { loyaltyApi } from '@/api/loyalty'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const tierConfig = {
  'BRONZE': { name: 'Бронзовый', color: 'text-[#CD7F32]', bg: 'bg-[#CD7F32]/10', border: 'border-[#CD7F32]/20', icon: Star },
  'SILVER': { name: 'Серебряный', color: 'text-[#C0C0C0]', bg: 'bg-[#C0C0C0]/10', border: 'border-[#C0C0C0]/20', icon: Star },
  'GOLD': { name: 'Золотой', color: 'text-[#FFD700]', bg: 'bg-[#FFD700]/10', border: 'border-[#FFD700]/20', icon: Trophy },
  'PLATINUM': { name: 'Платиновый', color: 'text-[#E5E4E2]', bg: 'bg-[#E5E4E2]/10', border: 'border-[#E5E4E2]/20', icon: Sparkles },
}

export function AccountLoyaltyPage() {
  const [isTiersOpen, setIsTiersOpen] = useState(false)
  const { data: account, isLoading: isAccountLoading } = useQuery({
    queryKey: ['loyalty-account'],
    queryFn: () => loyaltyApi.getMyAccount(),
    retry: false,
  })

  const { data: tiers, isLoading: isTiersLoading } = useQuery({
    queryKey: ['loyalty-tiers'],
    queryFn: () => loyaltyApi.getTiers(),
    retry: false,
  })

  if (isAccountLoading || isTiersLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand)]" />
      </div>
    )
  }

  const currentTierInfo = tiers?.find(t => t.tier === account?.tier)
  const nextTierInfo = tiers?.find(t => t.tierRank === (currentTierInfo?.tierRank || 0) + 1)
  const config = tierConfig[account?.tier as keyof typeof tierConfig] || tierConfig.BRONZE

  const progress = nextTierInfo 
    ? Math.min(100, Math.round(((account?.totalSpent || 0) / nextTierInfo.minSpend) * 100))
    : 100

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display font-bold text-[var(--color-text-primary)]">Программа лояльности</h1>

      {/* Hero Card */}
      <div className={cn('relative overflow-hidden rounded-3xl p-8 border shadow-sm', config.bg, config.border)}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className={cn('text-xs font-bold uppercase tracking-[0.2em]', config.color)}>Ваш уровень</p>
              <div className="flex items-center gap-3">
                <h2 className={cn('text-4xl font-display font-bold', config.color)}>{config.name}</h2>
                <config.icon className={cn('h-8 w-8', config.color)} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] uppercase font-semibold mb-1">Бонусных баллов</p>
                <p className="text-3xl font-bold text-[var(--color-text-primary)]">{account?.pointsBalance || 0}</p>
              </div>
              <div className="h-10 w-px bg-[var(--color-border)]" />
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] uppercase font-semibold mb-1">Кешбэк</p>
                <p className="text-3xl font-bold text-[var(--color-text-primary)]">{currentTierInfo?.pointsPerHundred || 0}%</p>
              </div>
            </div>
          </div>

          <div className="md:w-64 space-y-4">
            {nextTierInfo ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    <span>До уровня {tierConfig[nextTierInfo.tier as keyof typeof tierConfig].name}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden">
                    <div 
                      className={cn('h-full transition-all duration-1000', config.color.replace('text', 'bg'))}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
                  Потратьте еще {(nextTierInfo.minSpend - (account?.totalSpent || 0)).toLocaleString('ru-RU')} ₽ 
                  чтобы получать {nextTierInfo.pointsPerHundred}% кешбэка.
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-[var(--color-brand)] font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                Вы достигли максимального уровня!
              </div>
            )}
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute -right-8 -bottom-8 opacity-5 transform rotate-12">
          <config.icon className="h-64 w-64" />
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Gift className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-[var(--color-text-primary)]">Как тратить баллы?</h3>
          <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">
            Вы можете оплатить баллами до 50% стоимости вашего заказа. 1 балл = 1 рубль. 
            Баллы списываются автоматически при оформлении заказа.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CreditCard className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-[var(--color-text-primary)]">Начисление баллов</h3>
          <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">
            Баллы начисляются сразу после того, как заказ переходит в статус «Выполнен». 
            Срок жизни баллов — 1 год с момента начисления.
          </p>
        </div>
      </div>

      {/* All Tiers */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
        <button 
          onClick={() => setIsTiersOpen(!isTiersOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        >
          <h3 className="font-bold text-[var(--color-text-primary)]">Все уровни привилегий</h3>
          <ChevronDown className={cn("h-5 w-5 text-neutral-400 transition-transform duration-300", isTiersOpen && "rotate-180")} />
        </button>
        
        {isTiersOpen && (
          <div className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)] animate-in slide-in-from-top-2 duration-300">
            {tiers?.sort((a, b) => a.tierRank - b.tierRank).map((tier) => {
              const tierC = tierConfig[tier.tier as keyof typeof tierConfig] || tierConfig.BRONZE
              const isCurrent = tier.tier === account?.tier
              return (
                <div key={tier.tier} className={cn('p-6 flex items-center justify-between gap-4 transition-colors', isCurrent && 'bg-neutral-50')}>
                  <div className="flex items-center gap-4">
                     <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', tierC.bg, tierC.color)}>
                       <tierC.icon className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                         {tierC.name}
                         {isCurrent && <Badge variant="brand" className="text-[9px] h-4 py-0 px-1.5 uppercase tracking-wider font-bold">Вы здесь</Badge>}
                       </p>
                       <p className="text-xs text-[var(--color-text-tertiary)]">
                         Траты от {tier.minSpend.toLocaleString('ru-RU')} ₽
                       </p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[var(--color-brand)]">{tier.discountPercent}%</p>
                    <p className="text-[10px] uppercase tracking-wide font-bold text-[var(--color-text-tertiary)]">Скидка</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
