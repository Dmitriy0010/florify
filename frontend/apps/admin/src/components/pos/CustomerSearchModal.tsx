import { useState } from 'react'
import { Search, X, User, Phone, Check, Loader2, UserPlus, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CustomerService, CustomerSummary, CreateCustomerRequest } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface CustomerSearchModalProps {
  onSelect: (customer: CustomerSummary | null) => void
  onClose: () => void
}

export function CustomerSearchModal({ onSelect, onClose }: CustomerSearchModalProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newCustomer, setNewCustomer] = useState<Partial<CreateCustomerRequest>>({})

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['customers', 'search', search],
    queryFn: () => {
      if (search.length < 3) return Promise.resolve([])
      return CustomerService.search(search).then(res => res.data.content)
    },
    enabled: search.length >= 3 && !isCreating,
  })

  const createCustomerMutation = useMutation({
    mutationFn: (data: CreateCustomerRequest) => CustomerService.create(data),
    onSuccess: (res) => {
      toast.success('Клиент успешно создан')
      onSelect(res.data)
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: (error: any) => {
      toast.error('Ошибка создания: ' + (error.response?.data?.message || error.message))
    }
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomer.firstName) return
    
    createCustomerMutation.mutate({
      phone: search,
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email
    } as CreateCustomerRequest)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-neutral-50">
          <div>
            <h3 className="text-xl font-black text-neutral-900 tracking-tight">
              {isCreating ? 'Новый клиент' : 'Поиск клиента'}
            </h3>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
              {isCreating ? 'Заполните данные профиля' : 'Поиск по номеру телефона'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-neutral-50 text-neutral-400 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {!isCreating ? (
          <>
            {/* Search Input */}
            <div className="p-8 py-6">
              <div className="relative group">
                <Search className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                  isLoading ? "text-[var(--color-brand)] animate-pulse" : "text-neutral-300 group-focus-within:text-[var(--color-brand)]"
                )} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Введите телефон (+7...)" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-base font-bold focus:bg-white focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/5 transition-all outline-none"
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
              {search.length < 3 && (
                <div className="py-12 text-center text-neutral-300">
                  <Phone className="mx-auto h-12 w-12 opacity-20 mb-4" strokeWidth={1} />
                  <p className="text-xs font-bold uppercase tracking-widest">Введите минимум 3 цифры</p>
                </div>
              )}

              {search.length >= 3 && !isLoading && results.length === 0 && (
                <div className="py-12 text-center text-neutral-300">
                  <User className="mx-auto h-12 w-12 opacity-20 mb-4" strokeWidth={1} />
                  <p className="text-xs font-bold uppercase tracking-widest">Клиент не найден</p>
                  
                  <div className="mt-8 flex flex-col gap-3 px-8">
                    <button 
                      onClick={() => setIsCreating(true)}
                      className="w-full h-12 bg-[var(--color-brand)] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-[var(--color-brand)]/20"
                    >
                      <UserPlus size={18} />
                      Создать профиль
                    </button>
                    <button 
                      onClick={() => onSelect(null)}
                      className="w-full h-12 border border-neutral-100 text-[10px] font-black text-neutral-400 uppercase tracking-widest hover:bg-neutral-50 rounded-xl transition-all"
                    >
                      Продолжить как гость
                    </button>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-brand)]/30" />
                </div>
              )}

              {results.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => onSelect(customer)}
                  className="w-full p-4 flex items-center justify-between rounded-2xl bg-white border border-neutral-100 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-light)] transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-[var(--color-brand)] group-hover:text-white transition-all">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{customer.firstName} {customer.lastName}</h4>
                      <p className="text-xs text-neutral-400 font-medium">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-lg border border-neutral-100 flex items-center justify-center text-neutral-100 group-hover:border-[var(--color-brand)] group-hover:text-[var(--color-brand)] transition-all">
                    <Check size={16} />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Create Form */
          <form onSubmit={handleCreateSubmit} className="p-8 space-y-6">
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 mb-2">
              <Phone size={18} className="text-[var(--color-brand)]" />
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-tight">Номер телефона</p>
                <p className="text-sm font-bold text-neutral-900">{search}</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="ml-auto text-[10px] font-black text-[var(--color-brand)] uppercase tracking-widest hover:underline"
              >
                Изменить
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Имя</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  placeholder="Напр. Александр" 
                  value={newCustomer.firstName || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full h-12 px-4 bg-white border border-neutral-100 rounded-xl text-sm font-bold focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/5 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Фамилия</label>
                <input 
                  type="text" 
                  placeholder="Напр. Иванов" 
                  value={newCustomer.lastName || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full h-12 px-4 bg-white border border-neutral-100 rounded-xl text-sm font-bold focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/5 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Email (опц.)</label>
                <input 
                  type="email" 
                  placeholder="customer@example.com" 
                  value={newCustomer.email || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-12 px-4 bg-white border border-neutral-100 rounded-xl text-sm font-bold focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/5 transition-all outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 h-12 border border-neutral-100 text-[10px] font-black text-neutral-400 uppercase tracking-widest hover:bg-neutral-50 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} />
                Назад
              </button>
              <button 
                type="submit"
                disabled={createCustomerMutation.isPending || !newCustomer.firstName}
                className="flex-[2] h-12 bg-[var(--color-brand)] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-[var(--color-brand)]/20 disabled:opacity-50 disabled:scale-100"
              >
                {createCustomerMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                Создать клиента
              </button>
            </div>
          </form>
        )}
        
        {/* Footer */}
        {!isCreating && results.length > 0 && (
          <div className="p-6 bg-neutral-50 border-t border-neutral-100 text-center">
             <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
               Выберите клиента для применения лояльности
             </p>
          </div>
        )}
      </div>
    </div>
  )
}
