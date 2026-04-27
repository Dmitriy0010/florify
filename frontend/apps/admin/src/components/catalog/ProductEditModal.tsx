import React, { useState, useRef } from 'react'
import { 
  X, 
  Save, 
  Loader2, 
  Package, 
  DollarSign, 
  Upload, 
  Trash2, 
  Archive, 
  Warehouse, 
  TrendingUp,
  History,
  AlertCircle
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  CatalogService, 
  MediaService, 
  Product, 
  ProductCategory, 
  UpdateProductRequest,
  InventoryService,
  InventoryItem
} from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/store/useDashboardStore'

interface ProductEditModalProps {
  product: Product
  categories: ProductCategory[]
  onClose: () => void
  onSuccess: () => void
}

export function ProductEditModal({ product, categories, onClose, onSuccess }: ProductEditModalProps) {
  const queryClient = useQueryClient()
  const { currentStoreId } = useDashboardStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const extractUuid = (path: string) => {
    if (!path) return ''
    const match = path.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
    return match ? match[0] : path
  }

  const [formData, setFormData] = useState<UpdateProductRequest>({
    name: product.name || '',
    description: product.description || '',
    categoryId: product.categoryId || '',
    imageUrl: extractUuid(product.imageUrl || ''),
    defaultShelfLifeDays: product.defaultShelfLifeDays || 5,
  })
  
  const [currentPrice, setCurrentPrice] = useState<number>(product.currentPrice || 0)
  const [uploading, setUploading] = useState(false)
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false)

  // Fetch current stock for this product in current store
  const { data: stockData, isLoading: loadingStock } = useQuery({
    queryKey: ['inventory', 'balance', product.id, currentStoreId],
    queryFn: () => InventoryService.getBalance(product.id!, currentStoreId).then(res => res.data),
    enabled: !!product.id
  })

  const updateMutation = useMutation({
    mutationFn: async (data: { productData: UpdateProductRequest, price?: number }) => {
      if (product.id) {
        await CatalogService.updateProduct(product.id, data.productData)
        if (data.price !== undefined && data.price !== product.currentPrice) {
          await CatalogService.updatePrice(product.id, data.price, 'Обновление через карточку товара')
        }
      }
    },
    onSuccess: () => {
      toast.success('Товар успешно обновлен')
      queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
      onSuccess()
    },
    onError: (err: any) => {
      toast.error('Ошибка сохранения: ' + (err.response?.data?.message || err.message))
    }
  })

  const archiveMutation = useMutation({
    mutationFn: () => CatalogService.deactivateProduct(product.id!),
    onSuccess: () => {
      toast.success('Товар перемещен в архив')
      queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
      onSuccess()
    }
  })

  const getImagePath = (path: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `/api/v1/media/${path}`
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const res = await MediaService.upload(file)
      setFormData(prev => ({ ...prev, imageUrl: res.data.id }))
      toast.success('Изображение загружено')
    } catch {
      toast.error('Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.categoryId) {
      toast.error('Заполните обязательные поля (Название и Категория)')
      return
    }
    updateMutation.mutate({ productData: formData, price: currentPrice })
  }

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative ml-auto w-[650px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-neutral-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-100 bg-white/80 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-5">
             <div className="h-14 w-14 bg-neutral-900 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-black/20 ring-4 ring-neutral-900/5">
                <Package size={28} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tighter leading-none truncate max-w-[320px]">{product.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                   <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Редактирование каталога</p>
                   <span className="h-1 w-1 rounded-full bg-neutral-300" />
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">ID: {product.id?.slice(0,8)}</p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setIsConfirmingArchive(true)}
               className="h-10 w-10 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-100 flex items-center justify-center transition-all active:scale-95 group relative"
               title="В архив"
             >
                <Archive size={18} />
             </button>
             <button 
               onClick={onClose} 
               className="h-10 w-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-all active:scale-90"
             >
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
           
           {/* Top Stats Cards */}
           <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[32px] bg-neutral-50 border border-neutral-100 flex items-center gap-4 group hover:bg-white hover:shadow-xl hover:shadow-neutral-900/5 transition-all">
                 <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                    <Warehouse size={22} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Доступно</p>
                    <p className="text-xl font-black text-neutral-900 tabular-nums">
                       {loadingStock ? '...' : `${stockData?.quantity || 0} шт`}
                    </p>
                 </div>
              </div>
              <div className="p-6 rounded-[32px] bg-neutral-50 border border-neutral-100 flex items-center gap-4 group hover:bg-white hover:shadow-xl hover:shadow-neutral-900/5 transition-all">
                 <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                    <TrendingUp size={22} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Базовая цена</p>
                    <p className="text-xl font-black text-neutral-900 tabular-nums">{(product.currentPrice || 0).toLocaleString()} ₽</p>
                 </div>
              </div>
           </div>

           {/* Image & Main Info Grid */}
           <div className="grid grid-cols-5 gap-10">
              <div className="col-span-2 space-y-4">
                 <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Визуализация</p>
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="aspect-square bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-[40px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white hover:border-neutral-900 transition-all group overflow-hidden relative shadow-inner"
                 >
                    {formData.imageUrl ? (
                      <img src={getImagePath(formData.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-neutral-300" size={32} />
                        <p className="text-[8px] font-black uppercase text-neutral-400">Загрузка...</p>
                      </div>
                    ) : (
                      <>
                        <div className="h-16 w-16 rounded-[24px] bg-white border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover:text-neutral-900 group-hover:shadow-lg transition-all">
                           <Upload size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300 text-center px-4">Нажмите для загрузки фото</p>
                      </>
                    )}
                    {formData.imageUrl && !uploading && (
                      <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[4px]">
                         <div className="flex flex-col items-center gap-3 animate-in zoom-in-50 duration-300">
                            <Upload className="text-white" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Обновить медиа</p>
                         </div>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                 </div>
              </div>

              <div className="col-span-3 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Название товара *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Название цветка или букета"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full h-16 px-6 bg-neutral-50 border border-neutral-100 rounded-3xl text-base font-bold focus:bg-white focus:border-neutral-900 transition-all outline-none shadow-sm placeholder:text-neutral-300"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Категория *</label>
                       <select 
                         value={formData.categoryId}
                         onChange={e => setFormData({...formData, categoryId: e.target.value})}
                         className="w-full h-16 px-6 bg-neutral-50 border border-neutral-100 rounded-3xl text-sm font-bold focus:bg-white focus:border-neutral-900 transition-all outline-none appearance-none shadow-sm cursor-pointer"
                       >
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name === 'GENERAL' ? 'Общее' : c.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Срок годности</label>
                       <div className="relative group">
                          <input 
                            type="number" 
                            value={formData.defaultShelfLifeDays}
                            onFocus={e => e.target.select()}
                            onChange={e => setFormData({...formData, defaultShelfLifeDays: Number(e.target.value)})}
                            className="w-full h-16 px-6 bg-neutral-50 border border-neutral-100 rounded-3xl text-sm font-bold focus:bg-white focus:border-neutral-900 transition-all outline-none shadow-sm tabular-nums"
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-300 uppercase tracking-widest">дней</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Description Section */}
           <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Детальное описание</label>
                 <span className="text-[9px] font-bold text-neutral-300 uppercase">Макс. 1000 символов</span>
              </div>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={4}
                placeholder="Расскажите об особенностях данного товара, аромате или составе..."
                className="w-full p-8 bg-neutral-50 border border-neutral-100 rounded-[40px] text-sm font-medium focus:bg-white focus:border-neutral-900 transition-all outline-none shadow-inner leading-relaxed resize-none custom-scrollbar"
              />
           </div>

           {/* Price Section */}
           <div className="space-y-6 pt-4">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Финансовая конфигурация</p>
              <div className={cn(
                "p-10 rounded-[48px] border transition-all duration-700 flex items-center justify-between group overflow-hidden relative shadow-2xl",
                currentPrice !== product.currentPrice ? "bg-emerald-50 border-emerald-200" : "bg-neutral-900 border-neutral-800"
              )}>
                 <div className="relative z-10 flex flex-col gap-1">
                    <p className={cn(
                       "text-[9px] font-black uppercase tracking-widest",
                       currentPrice !== product.currentPrice ? "text-emerald-400" : "text-white/40"
                    )}>
                       Розничная стоимость (WAC-aware)
                    </p>
                    <div className="flex items-baseline gap-4">
                       <input 
                         type="number"
                         value={currentPrice}
                         onFocus={e => e.target.select()}
                         onChange={e => setCurrentPrice(Number(e.target.value))}
                         className={cn(
                            "text-6xl font-black bg-transparent outline-none w-48 transition-colors tabular-nums tracking-tighter",
                            currentPrice !== product.currentPrice ? "text-emerald-600" : "text-white"
                         )}
                       />
                       <span className={cn(
                          "text-2xl font-black",
                          currentPrice !== product.currentPrice ? "text-emerald-300" : "text-white/20"
                       )}>₽</span>
                    </div>
                 </div>
                 
                 {currentPrice !== product.currentPrice ? (
                    <div className="relative z-10 flex flex-col items-end gap-3 animate-in slide-in-from-right-4 duration-500">
                       <div className="px-5 py-2 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20">
                          Цена изменена
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Профит</p>
                          <p className="text-xl font-black text-emerald-600">
                             { (currentPrice - (product.currentPrice || 0)) > 0 ? '+' : '' }
                             { (currentPrice - (product.currentPrice || 0)).toLocaleString() } ₽
                          </p>
                       </div>
                    </div>
                 ) : (
                    <div className="relative z-10 p-5 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md opacity-40">
                       <DollarSign className="text-white" size={32} />
                    </div>
                 )}
                 
                 {/* Decorative background element for price section */}
                 <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
                    <DollarSign size={240} />
                 </div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-neutral-100 bg-neutral-50/50 backdrop-blur-md flex gap-5 z-20 shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
           <button 
             onClick={handleSubmit}
             disabled={updateMutation.isPending}
             className="flex-1 h-20 bg-neutral-900 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
           >
              {updateMutation.isPending ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              Сохранить изменения
           </button>
           <button 
             onClick={onClose}
             disabled={updateMutation.isPending}
             className="h-20 px-10 bg-white border border-neutral-100 text-neutral-400 rounded-[28px] text-[11px] font-black uppercase tracking-widest hover:bg-neutral-50 hover:text-neutral-900 transition-all active:scale-95"
           >
              Отмена
           </button>
        </div>

        {/* Reusable Confirmation Overlays */}
        {isConfirmingArchive && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl p-12 text-center animate-in zoom-in-95 duration-500 border border-neutral-100">
                 <div className="h-24 w-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-orange-500/10">
                    <Archive size={48} />
                 </div>
                 <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">Архивировать товар?</h3>
                 <p className="text-sm text-neutral-500 mt-4 leading-relaxed px-2">
                    Товар перестанет отображаться в активном списке каталога и в интерфейсе продаж (POS), но его история останется в системе.
                 </p>
                 <div className="flex flex-col gap-4 mt-10">
                    <button 
                       onClick={() => archiveMutation.mutate()}
                       disabled={archiveMutation.isPending}
                       className="h-16 bg-neutral-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                    >
                       {archiveMutation.isPending ? <Loader2 className="animate-spin" /> : <Archive size={18} />}
                       Да, переместить в архив
                    </button>
                    <button 
                       onClick={() => setIsConfirmingArchive(false)}
                       className="h-16 bg-transparent text-neutral-400 font-bold text-sm hover:text-neutral-900 transition-colors"
                    >
                       Вернуться к редактированию
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  )
}
