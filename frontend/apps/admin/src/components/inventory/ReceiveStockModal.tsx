import { useState, useRef, useEffect } from 'react'
import { X, Package, Loader2, Save, Search, ChevronDown } from 'lucide-react'
import { CatalogService, InventoryService, Product, SupplierService } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'


interface ReceiveStockModalProps {
  storeId: string
  onClose: () => void
}

export function ReceiveStockModal({ storeId, onClose }: ReceiveStockModalProps) {
  const queryClient = useQueryClient()
  const [selectedProductId, setSelectedProductId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [quantity, setQuantity] = useState(0)
  const [price, setPrice] = useState(0)
  const [docId, setDocId] = useState('')
  const [selectedSupplierId, setSelectedSupplierId] = useState('')

  const { data: suppliersRes } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => SupplierService.getAll({ size: 100 }).then(res => res.data)
  })

  const suppliers = suppliersRes?.data || []

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const { data: productsData } = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: () => CatalogService.getProducts({ size: 100 }).then(res => res.data)
  })

  const products = productsData?.data || []

  const filteredProducts = products.filter(p => 
    (p.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.id ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id!)
    setSearchQuery(`${product.name ?? 'Товар'} (${product.unit ?? 'шт'})`)
    setIsDropdownOpen(false)
  }

  const mutation = useMutation({
    mutationFn: InventoryService.receive,
    onSuccess: () => {
      toast.success('Приход успешно оформлен')
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      onClose()
    },
    onError: (err: any) => {
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId || quantity <= 0) {
        toast.error('Выберите товар и введите количество')
        return
    }

    mutation.mutate({
      productId: selectedProductId,
      storeId,
      supplierId: selectedSupplierId || undefined,
      quantity,
      purchasePrice: price,
      sourceDocumentId: docId
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">Приход товара</h2>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Оформление поступления на склад</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-2xl hover:bg-white transition-all text-neutral-400 hover:text-neutral-900 shadow-sm border border-transparent hover:border-neutral-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Товар (Поиск по названию или ID)</label>
            <div className="relative">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Search size={16} />
               </div>
               <input 
                 type="text"
                 placeholder="Начните вводить название товара..."
                 value={searchQuery}
                 onFocus={() => setIsDropdownOpen(true)}
                 onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedProductId('')
                    setIsDropdownOpen(true)
                 }}
                 className="w-full h-12 pl-11 pr-10 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:border-[var(--color-brand)] focus:bg-white transition-all outline-none"
               />
               <button 
                 type="button"
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 p-1 hover:text-neutral-900"
               >
                  <ChevronDown size={16} className={cn("transition-transform", isDropdownOpen && "rotate-180")} />
               </button>
            </div>

            {isDropdownOpen && (
               <div className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white border border-neutral-100 rounded-2xl shadow-xl z-50 p-2">
                  {filteredProducts.length > 0 ? filteredProducts.map(p => (
                     <div 
                        key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        className={cn(
                           "px-4 py-3 rounded-xl cursor-pointer flex justify-between items-center transition-colors group",
                           selectedProductId === p.id ? "bg-[var(--color-brand)] text-white" : "hover:bg-neutral-50"
                        )}
                     >
                        <div>
                           <p className={cn("text-sm font-bold", selectedProductId === p.id ? "text-white" : "text-neutral-900 group-hover:text-[var(--color-brand)]")}>{p.name ?? '—'}</p>
                           <p className={cn("text-[9px] font-black uppercase tracking-widest mt-0.5", selectedProductId === p.id ? "text-white/70" : "text-neutral-400")}>{p.unit ?? 'шт'}</p>
                        </div>
                        <span className={cn("text-[9px] font-bold tabular-nums", selectedProductId === p.id ? "text-white/50" : "text-neutral-300")}>ID: {p.id?.slice(0,8)}</span>
                     </div>
                  )) : (
                     <div className="p-8 flex flex-col items-center justify-center text-center">
                        <Package size={24} className="text-neutral-200 mb-2" />
                        <p className="text-xs font-bold text-neutral-400">Ничего не найдено</p>
                     </div>
                  )}
               </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Кол-во</label>
              <input 
                type="number"
                step="1"
                value={quantity || ''}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:border-[var(--color-brand)] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Цена закупки</label>
              <input 
                type="number"
                step="1"
                value={price || ''}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:border-[var(--color-brand)] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Поставщик</label>
            <select 
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:border-[var(--color-brand)] outline-none appearance-none"
            >
              <option value="">Не указан</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Документ-основание (необязательно)</label>
            <input 
              type="text"
              placeholder="Напр. Накладная №123"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:border-[var(--color-brand)] outline-none"
            />
          </div>

          <button 
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-14 bg-neutral-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Оформить приход
          </button>
        </form>
      </div>
    </div>
  )
}
