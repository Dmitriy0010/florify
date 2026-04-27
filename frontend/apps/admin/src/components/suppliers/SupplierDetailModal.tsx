import React, { useState } from 'react'
import { X, Save, Loader2, Building2, Phone, Star, CreditCard, FileText } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { SupplierService, CreateSupplierRequest } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SupplierDetailModalProps {
  supplierId: string
  onClose: () => void
}

export function SupplierDetailModal({ supplierId, onClose }: SupplierDetailModalProps) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => SupplierService.getById(supplierId).then(res => res.data)
  })

  const [formData, setFormData] = useState<Partial<CreateSupplierRequest>>({})

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateSupplierRequest>) => 
      SupplierService.update(supplierId, data),
    onSuccess: () => {
      toast.success('Данные поставщика обновлены')
      queryClient.invalidateQueries({ queryKey: ['supplier', supplierId] })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setIsEditing(false)
    }
  })

  if (isLoading || !supplier) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-4">
           <Loader2 className="h-10 w-10 animate-spin text-[var(--color-brand)]" />
           <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  const handleStartEdit = () => {
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      taxId: supplier.taxId,
      paymentTerms: supplier.paymentTerms,
      rating: supplier.rating,
      notes: supplier.notes
    })
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden text-neutral-900">
        {/* Header */}
        <div className="p-10 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 text-[var(--color-brand)]">
                 <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{supplier.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                   {[...Array(5)].map((_, i) => (
                     <Star 
                       key={i} 
                       size={10} 
                       className={cn(i < (supplier.rating || 0) ? "fill-amber-400 text-amber-400" : "text-neutral-200")} 
                     />
                   ))}
                   <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest ml-1">Рейтинг: {supplier.rating || 0}</span>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="text-neutral-300 hover:text-neutral-900 transition-colors">
             <X size={28} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
           {/* Section 1: Contacts */}
           <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-neutral-50">
                 <Phone size={16} className="text-[var(--color-brand)]" />
                 <h3 className="text-xs font-black uppercase tracking-widest">Контактная информация</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Контактное лицо</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.contactPerson || ''}
                        onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold"
                      />
                    ) : (
                      <p className="text-sm font-bold">{supplier.contactPerson || '—'}</p>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Телефон</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.phone || ''}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold"
                      />
                    ) : (
                      <p className="text-sm font-bold">{supplier.phone || '—'}</p>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Email</p>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={formData.email || ''}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold"
                      />
                    ) : (
                      <p className="text-sm font-bold">{supplier.email || '—'}</p>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Адрес</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.address || ''}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold"
                      />
                    ) : (
                      <p className="text-sm font-bold">{supplier.address || '—'}</p>
                    )}
                 </div>
              </div>
           </div>

           {/* Section 2: Business & Finance */}
           <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 pb-2 border-b border-neutral-50">
                 <CreditCard size={16} className="text-[var(--color-brand)]" />
                 <h3 className="text-xs font-black uppercase tracking-widest">Юридические данные и условия</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">ИНН (Tax ID)</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.taxId || ''}
                        onChange={e => setFormData({...formData, taxId: e.target.value})}
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold"
                      />
                    ) : (
                      <p className="text-sm font-bold">{supplier.taxId || '—'}</p>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Условия оплаты</p>
                    {isEditing ? (
                      <select 
                        value={formData.paymentTerms || 'PREPAID'}
                        onChange={e => setFormData({...formData, paymentTerms: e.target.value as any})}
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold outline-none"
                      >
                         <option value="PREPAID">Предоплата</option>
                         <option value="NET_7">7 дней отсрочка</option>
                         <option value="NET_14">14 дней отсрочка</option>
                         <option value="NET_30">30 дней отсрочка</option>
                      </select>
                    ) : (
                      <p className="text-sm font-bold">{supplier.paymentTerms || '—'}</p>
                    )}
                 </div>
              </div>
           </div>

           {/* Section 3: Notes */}
           <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 pb-2 border-b border-neutral-50">
                 <FileText size={16} className="text-[var(--color-brand)]" />
                 <h3 className="text-xs font-black uppercase tracking-widest">Заметки</h3>
              </div>
              {isEditing ? (
                 <textarea 
                   value={formData.notes || ''}
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                   rows={4}
                   className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-medium focus:bg-white transition-all outline-none"
                 />
              ) : (
                 <p className="text-sm font-medium text-neutral-500 leading-relaxed italic">
                   {supplier.notes || 'Дополнительная информация отсутствует...'}
                 </p>
              )}
           </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-neutral-100 bg-neutral-50/50 flex gap-4">
           {isEditing ? (
             <>
               <button 
                 onClick={handleSubmit}
                 disabled={updateMutation.isPending}
                 className="flex-1 h-14 bg-neutral-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
               >
                  {updateMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                  Сохранить изменения
               </button>
               <button onClick={() => setIsEditing(false)} className="h-14 px-8 bg-white border border-neutral-100 text-neutral-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 hover:text-neutral-900 transition-all">
                  Отмена
               </button>
             </>
           ) : (
             <>
               <button 
                 onClick={handleStartEdit}
                 className="flex-1 h-14 bg-neutral-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
               >
                  Редактировать профиль
               </button>
               <button onClick={onClose} className="h-14 px-8 bg-white border border-neutral-100 text-neutral-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 hover:text-neutral-900 transition-all">
                  Закрыть
               </button>
             </>
           )}
        </div>
      </div>
    </div>
  )
}
