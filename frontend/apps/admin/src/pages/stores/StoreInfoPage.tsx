import React, { useEffect, useState } from 'react'
import { 
  Store, 
  MapPin, 
  Phone, 
  Save, 
  Loader2, 
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/store/useDashboardStore'
import { StoreService, Store as StoreType } from '@/lib/api'

export default function StoreInfoPage() {
  const { currentStoreId } = useDashboardStore()
  const [storeData, setStoreData] = useState<StoreType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (currentStoreId) {
      loadStore()
    }
  }, [currentStoreId])

  const loadStore = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const response = await StoreService.getById(currentStoreId!)
      setStoreData(response.data)
    } catch (err) {
      setMessage({ type: 'error', text: 'Ошибка при загрузке данных филиала' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeData) return

    setIsSaving(true)
    setMessage(null)
    try {
      await StoreService.update(currentStoreId!, storeData)
      setMessage({ type: 'success', text: 'Данные филиала успешно обновлены' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Не удалось сохранить изменения' })
    } finally {
      setIsSaving(false)
    }
  }

  if (!currentStoreId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
           <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Филиал не выбран</h2>
        <p className="text-neutral-400 text-sm">Пожалуйста, выберите филиал в верхней панели управления</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand)]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/pos-points" className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5 text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Карточка точки</h1>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Редактирование параметров филиала</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300",
          message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm p-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* General Info */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 pb-2 border-b border-neutral-50 mb-4">
                <Store className="h-5 w-5 text-[var(--color-brand)]" />
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">Основная информация</h3>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Название филиала</label>
                  <input 
                    type="text" 
                    value={storeData?.name || ''}
                    onChange={(e) => setStoreData(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full h-12 px-5 bg-neutral-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-neutral-200 transition-all outline-none"
                    placeholder="Напр. Флагманский магазин"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Статус объекта</label>
                  <div className="flex p-1 bg-neutral-50 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setStoreData(prev => prev ? { ...prev, active: true } : null)}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        storeData?.active ? "bg-white text-green-600 shadow-sm" : "text-neutral-400"
                      )}
                    >Активен</button>
                    <button 
                      type="button"
                      onClick={() => setStoreData(prev => prev ? { ...prev, active: false } : null)}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        !storeData?.active ? "bg-white text-red-500 shadow-sm" : "text-neutral-400"
                      )}
                    >Отключен</button>
                  </div>
                </div>
             </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 pb-2 border-b border-neutral-50 mb-4">
                <MapPin className="h-5 w-5 text-[var(--color-brand)]" />
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">Контакты и адрес</h3>
             </div>

             <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Фактический адрес</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input 
                      type="text" 
                      value={storeData?.address || ''}
                      onChange={(e) => setStoreData(prev => prev ? { ...prev, address: e.target.value } : null)}
                      className="w-full h-12 pl-12 pr-5 bg-neutral-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-neutral-200 transition-all outline-none"
                      placeholder="Улица, дом, офис..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Телефон филиала</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input 
                      type="text" 
                      value={storeData?.phone || ''}
                      onChange={(e) => setStoreData(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      className="w-full h-12 pl-12 pr-5 bg-neutral-50 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-neutral-200 transition-all outline-none"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-50 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
              <Building2 className="h-4 w-4" />
              ID: {storeData?.id}
           </div>
           
           <button 
            type="submit"
            disabled={isSaving}
            className="h-14 px-10 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center gap-3 disabled:opacity-50"
           >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Сохранить изменения
           </button>
        </div>
      </form>
    </div>
  )
}
