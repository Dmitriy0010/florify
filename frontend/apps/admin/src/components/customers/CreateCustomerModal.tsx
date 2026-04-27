import { useState } from 'react'
import { X, User, Phone, Mail, Calendar, Save, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CustomerService } from '@/lib/api'
import { toast } from 'sonner'

interface CreateCustomerModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export function CreateCustomerModal({ onClose, onSuccess }: CreateCustomerModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: ''
  })

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => CustomerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] })
      toast.success('Клиент успешно создан')
      onSuccess?.()
      onClose()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Ошибка при создании клиента')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.phone) {
      toast.error('Имя и телефон обязательны')
      return
    }
    mutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-neutral-200">
        <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
           <div>
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Новый клиент</h2>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Регистрация в базе CRM</p>
           </div>
           <button onClick={onClose} className="h-10 w-10 rounded-xl hover:bg-neutral-100 transition-all text-neutral-300 hover:text-neutral-900 flex items-center justify-center">
              <X size={24} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Имя *</label>
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input 
                      type="text" 
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-neutral-900 transition-all outline-none"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Фамилия</label>
                 <input 
                   type="text" 
                   value={formData.lastName}
                   onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                   className="w-full h-12 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-neutral-900 transition-all outline-none"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Телефон *</label>
              <div className="relative">
                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                 <input 
                   type="tel" 
                   required
                   value={formData.phone}
                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   className="w-full h-12 pl-12 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-neutral-900 transition-all outline-none"
                   placeholder="+7"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                 <input 
                   type="email" 
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className="w-full h-12 pl-12 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-neutral-900 transition-all outline-none"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Дата рождения</label>
              <div className="relative">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                 <input 
                   type="date" 
                   value={formData.birthDate}
                   onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                   className="w-full h-12 pl-12 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-neutral-900 transition-all outline-none"
                 />
              </div>
           </div>

           <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 h-12 border border-neutral-200 text-neutral-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all"
              >
                 Отмена
              </button>
              <button 
                type="submit"
                disabled={mutation.isPending}
                className="flex-[2] h-12 bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10"
              >
                 {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                 Создать клиента
              </button>
           </div>
        </form>
      </div>
    </div>
  )
}
