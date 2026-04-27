import { 
  MapPin, 
  Plus, 
  Loader2, 
  DollarSign, 
  ShoppingBag, 
  Trash2, 
  CheckCircle2, 
  Map,
  Settings2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DeliveryService } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function DeliveryZonesPage() {
  const queryClient = useQueryClient()

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: () => DeliveryService.getZones().then(res => res.data)
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => DeliveryService.deactivateZone(id),
    onSuccess: () => {
      toast.success('Зона удалена')
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] })
    }
  })

  // Basic filter (can be extended if search is added)
  const filteredZones = zones.filter(z => (z.name || '').trim() !== '')

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-neutral-200" />
        <p className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Загрузка зон доставки...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Зоны доставки</h1>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Настройка тарифов и условий по регионам</p>
        </div>

        <button className="h-11 px-8 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center gap-2">
           <Plus className="h-4 w-4" />
           Добавить зону
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-[#1F2128] p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
         <div className="h-20 w-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-[var(--color-brand)] flex-shrink-0">
            <Map size={40} />
         </div>
         <div className="flex-1 space-y-2">
            <h3 className="text-xl font-black tracking-tight">География доставки</h3>
            <p className="text-xs font-medium text-white/50 leading-relaxed max-w-2xl">
               Настраивайте стоимость доставки и минимальный порог заказа для разных частей города. 
               Система автоматически применит эти условия при оформлении заказа на сайте или в приложении.
            </p>
         </div>
         <div className="flex items-center gap-4 relative z-10">
            <div className="text-right">
               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Активных зон</p>
               <p className="text-2xl font-black text-[var(--color-brand)]">{zones.filter(z => z.active).length}</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Settings2 size={120} />
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredZones.map(zone => (
           <div key={zone.id} className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                 <div className="h-12 w-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-[var(--color-brand-light)] group-hover:text-[var(--color-brand)] transition-colors">
                    <MapPin size={24} />
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-neutral-50 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100" onClick={() => zone.id && deleteMutation.mutate(zone.id)}>
                       <Trash2 size={16} />
                    </button>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      zone.active ? "bg-green-50 text-green-600" : "bg-neutral-50 text-neutral-400"
                    )}>
                       {zone.active ? 'Активна' : 'Архив'}
                    </div>
                 </div>
              </div>

              <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-6">{zone.name || 'Безымянная зона'}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                       <DollarSign size={10} /> Доставка
                    </div>
                    <p className="text-sm font-black text-neutral-900">{zone.deliveryFee || 0} ₽</p>
                 </div>
                 <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                       <ShoppingBag size={10} /> Мин. заказ
                    </div>
                    <p className="text-sm font-black text-neutral-900">{zone.minOrderAmount || 0} ₽</p>
                 </div>
              </div>

              <div className="mt-8 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Проверено</span>
                 </div>
                 <button className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-widest hover:underline">
                    Редактировать
                 </button>
              </div>
           </div>
         ))}

         {/* Add New Zone Card (Empty State) */}
         <button className="h-full min-h-[300px] border-2 border-dashed border-neutral-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-light)]/10 transition-all group">
            <div className="h-14 w-14 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-[var(--color-brand)] group-hover:text-white transition-all">
               <Plus size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-[var(--color-brand)]">Новая зона доставки</p>
         </button>
      </div>
    </div>
  )
}
