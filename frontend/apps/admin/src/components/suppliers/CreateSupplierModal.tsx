import React, { useState } from 'react'
import { X, Save, Loader2, Building2, Phone, Star, CreditCard, FileText } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SupplierService, CreateSupplierRequest } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CreateSupplierModalProps {
  onClose: () => void
}

export function CreateSupplierModal({ onClose }: CreateSupplierModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CreateSupplierRequest>({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
    paymentTerms: 'PREPAID',
    rating: 5,
    notes: ''
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierRequest) => SupplierService.create(data),
    onSuccess: () => {
      toast.success('Новый поставщик успешно добавлен')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      onClose()
    },
    onError: (err: any) => {
      toast.error('Ошибка при создании: ' + (err.response?.data?.message || err.message))
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Название поставщика обязательно')
      return
    }
    createMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden text-neutral-900 border border-neutral-100">
        {/* Header */}
        <div className="p-10 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 text-[var(--color-brand)]">
                 <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Новый поставщик</h2>
                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mt-1">Добавление контрагента в базу</p>
              </div>
           </div>
           <button onClick={onClose} className="text-neutral-300 hover:text-neutral-900 transition-colors bg-white h-10 w-10 flex items-center justify-center rounded-xl border border-neutral-100 shadow-sm">
             <X size={24} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
           {/* Section 1: Contacts */}
           <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-neutral-50">
                 <Phone size={16} className="text-[var(--color-brand)]" />
                 <h3 className="text-xs font-black uppercase tracking-widest">Контактная информация</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Название компании *</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="ООО 'Цветочный мир'"
                      className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Контактное лицо</label>
                    <input 
                      type="text" 
                      value={formData.contactPerson || ''}
                      onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                      placeholder="Иван Иванов"
                      className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Телефон</label>
                    <input 
                      type="text" 
                      value={formData.phone || ''}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+7 (999) 000-00-00"
                      className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      type="email" 
                      value={formData.email || ''}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="info@supplier.com"
                      className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Адрес</label>
                    <input 
                      type="text" 
                      value={formData.address || ''}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder="г. Москва, ул. Цветочная, д. 1"
                      className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none"
                    />
                 </div>
              </div>
           </div>

           {/* Section 2: Business & Finance */}
           <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 pb-2 border-b border-neutral-50">
                 <CreditCard size={16} className="text-[var(--color-brand)]" />
                 <h3 className="text-xs font-black uppercase tracking-widest">Юридические данные</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">ИНН (Tax ID)</label>
                    <input 
                      type="text" 
                      value={formData.taxId || ''}
                      onChange={e => setFormData({...formData, taxId: e.target.value})}
                      placeholder="7700000000"
                      className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Условия оплаты</label>
                    <select 
                      value={formData.paymentTerms || 'PREPAID'}
                      onChange={e => setFormData({...formData, paymentTerms: e.target.value as any})}
                      className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none appearance-none"
                    >
                       <option value="PREPAID">Предоплата</option>
                       <option value="NET_7">7 дней отсрочка</option>
                       <option value="NET_14">14 дней отсрочка</option>
                       <option value="NET_30">30 дней отсрочка</option>
                    </select>
                 </div>
                 <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Рейтинг доверия</label>
                    <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                       <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                             <button
                                key={star}
                                type="button"
                                onClick={() => setFormData({...formData, rating: star})}
                                className="transition-transform active:scale-125"
                             >
                                <Star 
                                  size={24} 
                                  className={cn(star <= (formData.rating || 0) ? "fill-amber-400 text-amber-400" : "text-neutral-200")} 
                                />
                             </button>
                          ))}
                       </div>
                       <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">{formData.rating} / 5</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 3: Notes */}
           <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 pb-2 border-b border-neutral-50">
                 <FileText size={16} className="text-[var(--color-brand)]" />
                 <h3 className="text-xs font-black uppercase tracking-widest">Заметки</h3>
              </div>
              <textarea 
                value={formData.notes || ''}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Укажите дополнительную информацию об условиях поставки, логистике и т.д."
                rows={4}
                className="w-full p-5 bg-neutral-50 border border-neutral-100 rounded-[2rem] text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none"
              />
           </div>
        </form>

        {/* Footer */}
        <div className="p-10 border-t border-neutral-100 bg-neutral-50/50 flex gap-4">
           <button 
             onClick={handleSubmit}
             disabled={createMutation.isPending}
             className="flex-1 h-16 bg-neutral-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50 group active:scale-[0.98]"
           >
              {createMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
              Добавить поставщика
           </button>
           <button 
             onClick={onClose} 
             disabled={createMutation.isPending}
             className="h-16 px-8 bg-white border border-neutral-100 text-neutral-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 hover:text-neutral-900 transition-all disabled:opacity-50"
           >
              Отмена
           </button>
        </div>
      </div>
    </div>
  )
}
