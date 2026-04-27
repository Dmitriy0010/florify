import { useState } from 'react'
import { 
  Plus, 
  MapPin, 
  Phone, 
  Loader2, 
  ArrowLeft,
  Building2,
  AlertCircle,
  Store as StoreIcon
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/store/useDashboardStore'
import { StoreService } from '@/lib/api'

export default function CreateStorePage() {
  const navigate = useNavigate()
  const { fetchStores } = useDashboardStore()
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    active: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.address) {
      setError('Название и адрес обязательны для заполнения')
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await StoreService.create(formData)
      await fetchStores() // Refresh global store list
      navigate('/admin/pos-points') // Redirect back to list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось создать филиал. Проверьте права доступа.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/pos-points" className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5 text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Новый филиал</h1>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Регистрация новой точки продаж в системе</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl flex items-center gap-3 animate-in zoom-in-95">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm p-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Main Context */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 pb-2 border-b border-neutral-50 mb-4">
                <StoreIcon className="h-5 w-5 text-[var(--color-brand)]" />
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">Идентификация</h3>
             </div>
             
             <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Публичное название</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-14 px-5 bg-neutral-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-neutral-200 transition-all outline-none"
                    placeholder="Напр. Филиал на Арбате"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Начальный статус</label>
                  <div className="flex p-1 bg-neutral-50 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, active: true }))}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        formData.active ? "bg-white text-green-600 shadow-sm" : "text-neutral-400"
                      )}
                    >Сразу открыть</button>
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, active: false }))}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        !formData.active ? "bg-white text-orange-500 shadow-sm" : "text-neutral-400"
                      )}
                    >В подготовке</button>
                  </div>
                </div>
             </div>
          </div>

          {/* Location & Meta */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 pb-2 border-b border-neutral-50 mb-4">
                <MapPin className="h-5 w-5 text-[var(--color-brand)]" />
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">Локация</h3>
             </div>

             <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Полный адрес</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input 
                      type="text" 
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full h-14 pl-12 pr-5 bg-neutral-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-neutral-200 transition-all outline-none"
                      placeholder="Город, улица, дом..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Телефон для связи</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full h-14 pl-12 pr-5 bg-neutral-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-neutral-200 transition-all outline-none"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-50 flex items-center justify-end gap-4">
           <Link 
            to="/admin/pos-points"
            className="h-14 px-8 flex items-center justify-center text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors"
           >
            Отмена
           </Link>
           <button 
            type="submit"
            disabled={isSaving}
            className="h-14 px-12 bg-[var(--color-brand)] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[var(--color-brand-hover)] transition-all shadow-xl shadow-[var(--color-brand)]/20 flex items-center gap-3 disabled:opacity-50"
           >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Создать точку
           </button>
        </div>
      </form>

      <div className="p-8 bg-brand-50 rounded-[2rem] border border-brand-100/50 flex items-center gap-6">
         <div className="h-14 w-14 rounded-2xl bg-white border border-brand-100 flex items-center justify-center text-[var(--color-brand)] shadow-sm">
            <Building2 className="h-6 w-6" />
         </div>
         <div className="space-y-1">
            <h4 className="text-sm font-black text-brand-900 uppercase tracking-tight">Важно</h4>
            <p className="text-xs font-semibold text-brand-700/80 leading-relaxed">
               После создания новой точки, она автоматически станет доступна для распределения заказов и инвентаризации во всех сервисах Florify.
            </p>
         </div>
      </div>
    </div>
  )
}
