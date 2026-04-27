import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Plus,
  Package,
  Search,
  Loader2,
  Image as ImageIcon,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  Archive,
  Upload,
  X,
  ChevronRight,
  Tag,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Filter,
  MoreVertical
} from 'lucide-react'
import { toast } from 'sonner'
import { CatalogService, MediaService, Product, ProductCategory, CreateProductRequest } from '@/lib/api'
import { cn, UNITS_MAP } from '@/lib/utils'
import { ProductEditModal } from '@/components/catalog/ProductEditModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

const getImagePath = (path?: string | null) => {
  if (!path) return ''
  const match = (path || '').match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
  return match ? `/api/v1/media/${match[0]}` : ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Product card (grid mode)
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({ product, category, onEdit, onArchive, onUploadImage, isUploading }: {
  product: Product
  category?: ProductCategory
  onEdit: () => void
  onArchive: () => void
  onUploadImage: () => void
  isUploading: boolean
}) {
  const imageSrc = getImagePath(product.imageUrl)

  return (
    <div className={cn(
      'bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col overflow-hidden cursor-pointer relative',
      !product.active && 'opacity-50 grayscale'
    )} onClick={onEdit}>
      {/* Image */}
      <div className="aspect-[4/3] bg-neutral-50 relative overflow-hidden">
        {imageSrc ? (
          <img src={imageSrc} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-200">
            {isUploading ? <Loader2 className="animate-spin" size={24} /> : <ImageIcon size={28} />}
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-black text-neutral-600 uppercase tracking-widest border border-neutral-100">
            {category?.name === 'GENERAL' ? 'Общее' : category?.name || '—'}
          </span>
        </div>

        {/* Archived badge */}
        {!product.active && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">Архив</span>
          </div>
        )}

        {/* Hover actions overlay */}
        <div className="absolute inset-0 bg-neutral-900/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
          <button onClick={e => { e.stopPropagation(); onUploadImage() }} title="Загрузить фото"
            className="h-9 w-9 bg-white rounded-xl shadow-lg flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:scale-110 transition-all">
            <Upload size={14} />
          </button>
          <button onClick={e => { e.stopPropagation(); onEdit() }} title="Редактировать"
            className="h-9 w-9 bg-white rounded-xl shadow-lg flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:scale-110 transition-all">
            <Pencil size={14} />
          </button>
          <button onClick={e => { e.stopPropagation(); onArchive() }} title="В архив"
            className="h-9 w-9 bg-white rounded-xl shadow-lg flex items-center justify-center text-neutral-600 hover:text-red-500 hover:scale-110 transition-all">
            <Archive size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-black text-neutral-900 leading-tight line-clamp-1 group-hover:text-neutral-700 transition-colors">{product.name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
            {UNITS_MAP[product.unit || ''] || product.unit}
          </span>
        </div>

        <div className="mt-auto pt-4 border-t border-neutral-50 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">Цена</p>
            <p className="text-base font-black text-neutral-900 tabular-nums">{(product.currentPrice || 0).toLocaleString()} ₽</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="h-8 w-8 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Product row (list mode)
// ─────────────────────────────────────────────────────────────────────────────
function ProductRow({ product, category, onEdit, onArchive, idx }: {
  product: Product; category?: ProductCategory; onEdit: () => void; onArchive: () => void; idx: number
}) {
  const imageSrc = getImagePath(product.imageUrl)
  return (
    <div
      className={cn(
        'flex items-center gap-6 px-6 py-4 hover:bg-neutral-50/60 transition-colors cursor-pointer group border-b border-neutral-50',
        idx % 2 === 1 ? 'bg-neutral-50/20' : 'bg-white',
        !product.active && 'opacity-50 grayscale'
      )}
      onClick={onEdit}
    >
      {/* Thumbnail */}
      <div className="h-11 w-11 rounded-xl bg-neutral-50 border border-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {imageSrc ? <img src={imageSrc} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-neutral-200" />}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-neutral-900 truncate group-hover:text-neutral-700 transition-colors">{product.name}</p>
        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
          {category?.name === 'GENERAL' ? 'Общее' : category?.name || '—'}
        </p>
      </div>

      {/* Unit */}
      <div className="w-20 text-center">
        <span className="px-2 py-1 bg-neutral-50 border border-neutral-100 rounded-lg text-[8px] font-black text-neutral-500 uppercase tracking-widest">
          {UNITS_MAP[product.unit || ''] || product.unit || '—'}
        </span>
      </div>

      {/* Status */}
      <div className="w-24 flex justify-center">
        {product.active ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Активен</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Архив</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="w-28 text-right">
        <p className="text-sm font-black text-neutral-900 tabular-nums">{(product.currentPrice || 0).toLocaleString()} ₽</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button onClick={onEdit} className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all">
          <Pencil size={12} />
        </button>
        <button onClick={onArchive} className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
          <Archive size={12} />
        </button>
        <ChevronRight size={16} className="text-neutral-200 group-hover:text-neutral-900 transition-colors" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Drawer (Create)
// ─────────────────────────────────────────────────────────────────────────────
function ProductDrawer({ categories, onClose, onSuccess }: {
  categories: ProductCategory[]; onClose: () => void; onSuccess: () => void
}) {
  const [form, setForm] = useState<CreateProductRequest>({
    name: '', description: '', categoryId: categories[0]?.id || '',
    unit: 'PIECE', initialPrice: 0, defaultShelfLifeDays: 5, imageUrl: ''
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) { toast.error('Введите название товара'); return }
    setSaving(true)
    try {
      await CatalogService.createProduct(form)
      toast.success('Товар создан')
      onSuccess()
    } catch (e: any) {
      toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
    } finally { setSaving(false) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await MediaService.upload(file)
      setForm(prev => ({ ...prev, imageUrl: res.data.id }))
      toast.success('Фото загружено')
    } catch { toast.error('Ошибка загрузки') }
    finally { setUploading(false) }
  }

  const field = (label: string, key: keyof CreateProductRequest, type = 'text', placeholder?: string) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        value={(form as any)[key]}
        onFocus={e => type === 'number' && e.target.select()}
        onChange={e => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
        placeholder={placeholder}
        className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:border-neutral-900 focus:bg-white transition-all shadow-sm shadow-neutral-900/[0.02]"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-[100] flex">
      <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative ml-auto w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-500 border-l border-neutral-100">
        
        {/* Header */}
        <div className="p-8 border-b border-neutral-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-300">
                <Package size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Новая позиция</p>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight">Создание товара</h2>
             </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
           {/* Image Upload Area */}
           <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Медиа контент</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-[32px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-neutral-900 transition-all group overflow-hidden relative shadow-inner"
              >
                 {form.imageUrl ? (
                   <img src={getImagePath(form.imageUrl)} className="w-full h-full object-cover" />
                 ) : uploading ? (
                   <Loader2 className="animate-spin text-neutral-300" size={32} />
                 ) : (
                   <>
                     <div className="h-12 w-12 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover:text-neutral-900 transition-all shadow-sm">
                        <Upload size={20} />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Загрузить изображение</p>
                   </>
                 )}
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
           </div>

           {/* Form Fields */}
           <div className="space-y-6">
              {field('Наименование *', 'name', 'text', 'Напр: Роза Эквадор')}
              
              <div className="grid grid-cols-2 gap-4">
                 {field('Цена (₽)', 'initialPrice', 'number', '0')}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Ед. измерения</label>
                    <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value as any })}
                      className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:border-neutral-900 appearance-none shadow-sm shadow-neutral-900/[0.02]">
                      <option value="PIECE">Штука</option>
                      <option value="GRAM">Грамм</option>
                      <option value="BUNCH">Букет / Пачка</option>
                      <option value="SET">Набор</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Категория</label>
                 <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                   className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:border-neutral-900 appearance-none shadow-sm shadow-neutral-900/[0.02]">
                   {categories.map(c => <option key={c.id} value={c.id}>{c.name === 'GENERAL' ? 'Общее' : c.name}</option>)}
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Описание (опционально)</label>
                 <textarea
                   rows={4}
                   value={form.description || ''}
                   onChange={e => setForm({ ...form, description: e.target.value })}
                   placeholder="Введите подробное описание характеристик товара..."
                   className="w-full p-5 bg-neutral-50 border border-neutral-100 rounded-[28px] text-sm font-medium outline-none focus:border-neutral-900 focus:bg-white transition-all shadow-inner"
                 />
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-neutral-100 bg-neutral-50/50 flex gap-4">
           <button 
             onClick={handleSubmit} 
             disabled={saving} 
             className="flex-1 h-14 bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
           >
              {saving ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
              Опубликовать товар
           </button>
           <button onClick={onClose} className="h-14 px-8 bg-white border border-neutral-100 text-neutral-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 hover:text-neutral-900 transition-all">
             Отмена
           </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'archived'>('active')
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: string | null; active: boolean }>({ isOpen: false, id: null, active: false })

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [prodRes, catRes] = await Promise.all([
        CatalogService.getProducts({ size: 200 }),
        CatalogService.getCategories()
      ])
      setProducts(prodRes.data.data)
      setCategories(catRes.data)
    } catch { toast.error('Ошибка загрузки каталога') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId?: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(productId || 'new')
      const res = await MediaService.upload(file)
      const imageUrl = res.data.id
      if (productId) {
        const existing = products.find(p => p.id === productId)
        if (existing?.name && existing?.categoryId) {
          await CatalogService.updateProduct(productId, { name: existing.name, categoryId: existing.categoryId, imageUrl })
          toast.success('Изображение обновлено')
          fetchData()
        }
      } else {
        toast.success('Изображение загружено')
      }
    } catch { toast.error('Ошибка загрузки изображения') }
    finally { setUploading(null) }
  }

  const handleDeactivate = async () => {
    if (!confirmDialog.id) return
    try {
      await CatalogService.deleteProduct(confirmDialog.id)
      toast.success(confirmDialog.active ? 'Товар скрыт' : 'Товар активирован')
      setConfirmDialog({ isOpen: false, id: null, active: false })
      fetchData()
    } catch { toast.error('Ошибка изменения статуса') }
  }

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = !searchQuery || (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = !filterCategory || p.categoryId === filterCategory
    const matchActive = filterActive === 'all' ? true : filterActive === 'active' ? !!p.active : !p.active
    return matchSearch && matchCat && matchActive
  }), [products, searchQuery, filterCategory, filterActive])

  const activeCount = products.filter(p => p.active).length
  const archivedCount = products.filter(p => !p.active).length
  const avgPrice = products.length > 0 ? products.reduce((s, p) => s + (p.currentPrice || 0), 0) / products.length : 0

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*"
        onChange={e => { const id = fileInputRef.current?.getAttribute('data-target-id') || ''; handleImageUpload(e, id || undefined) }} />

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Каталог товаров</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
            Управление ассортиментом, ценами и медиа-контентом
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-neutral-600 transition-colors" />
            <input type="text" placeholder="Поиск по названию..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-56 h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-500 focus:bg-white transition-all" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600"><X size={14} /></button>}
          </div>

          {/* View toggle */}
          <div className="flex p-1 bg-neutral-100 rounded-xl">
            <button onClick={() => setViewMode('grid')} className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-all', viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400')}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-all', viewMode === 'list' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400')}>
              <ListIcon size={15} />
            </button>
          </div>

          <div className="w-px h-6 bg-neutral-100" />

          <button onClick={() => setIsAdding(true)} className="h-10 px-5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95">
            <Plus size={16} /> Добавить товар
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────────────────── */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-neutral-100 flex flex-col overflow-y-auto custom-scrollbar">

          {/* Stats */}
          <div className="p-5 border-b border-neutral-50 space-y-3">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Каталог</p>
            <div className="space-y-2">
              {[
                { label: 'Всего позиций', value: products.length, icon: Package, active: filterActive === 'all', onClick: () => setFilterActive('all') },
                { label: 'Активных', value: activeCount, icon: CheckCircle2, active: filterActive === 'active', onClick: () => setFilterActive('active') },
                { label: 'В архиве', value: archivedCount, icon: Archive, active: filterActive === 'archived', onClick: () => setFilterActive('archived') },
              ].map(({ label, value, icon: Icon, active, onClick }) => (
                <button key={label} onClick={onClick} className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left',
                  active ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-300'
                )}>
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={active ? 'text-white/60' : 'text-neutral-400'} />
                    <span className={cn('text-[10px] font-black uppercase tracking-widest', active ? 'text-white' : 'text-neutral-600')}>{label}</span>
                  </div>
                  <span className={cn('text-sm font-black', active ? 'text-white' : 'text-neutral-900')}>{value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Avg price */}
          <div className="p-5 border-b border-neutral-50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={12} className="text-neutral-400" />
              <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Средняя цена</p>
            </div>
            <p className="text-xl font-black text-neutral-900">{avgPrice.toLocaleString('ru', { maximumFractionDigits: 0 })} ₽</p>
          </div>

          {/* Categories filter */}
          <div className="p-5 space-y-3 flex-1">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Категории</p>
            <button onClick={() => setFilterCategory('')} className={cn('w-full flex items-center justify-between p-3 rounded-xl border transition-all', !filterCategory ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-300')}>
              <span className={cn('text-[10px] font-black uppercase tracking-widest', !filterCategory ? 'text-white' : 'text-neutral-600')}>Все</span>
              <span className={cn('text-sm font-black', !filterCategory ? 'text-white' : 'text-neutral-900')}>{products.length}</span>
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.categoryId === cat.id).length
              const isActive = filterCategory === cat.id
              return (
                <button key={cat.id} onClick={() => setFilterCategory(isActive ? '' : cat.id!)}
                  className={cn('w-full flex items-center justify-between p-3 rounded-xl border transition-all', isActive ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-300')}>
                  <div className="flex items-center gap-2">
                    <Tag size={12} className={isActive ? 'text-white/60' : 'text-neutral-400'} />
                    <span className={cn('text-[10px] font-black truncate', isActive ? 'text-white' : 'text-neutral-600')}>
                      {cat.name === 'GENERAL' ? 'Общее' : cat.name}
                    </span>
                  </div>
                  <span className={cn('text-xs font-black flex-shrink-0', isActive ? 'text-white/70' : 'text-neutral-400')}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-neutral-200" size={48} />
              <p className="text-[11px] font-black text-neutral-300 uppercase tracking-widest">Загрузка каталога...</p>
            </div>
          ) : (
            <div className="p-8 space-y-6">
              {/* Product Drawer */}
              {isAdding && (
                <ProductDrawer categories={categories} onClose={() => setIsAdding(false)} onSuccess={() => { setIsAdding(false); fetchData() }} />
              )}

              {/* Results header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-neutral-400" />
                  <span className="text-sm font-black text-neutral-900">{filtered.length} позиций</span>
                  {(searchQuery || filterCategory) && (
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Filter size={10} /> Фильтр
                    </span>
                  )}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="py-32 flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-neutral-50 flex items-center justify-center">
                    <Package size={24} className="text-neutral-200" />
                  </div>
                  <p className="text-sm font-black text-neutral-300">Товары не найдены</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                  {filtered.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      category={categories.find(c => c.id === product.categoryId)}
                      onEdit={() => setEditingProduct(product)}
                      onArchive={() => setConfirmDialog({ isOpen: true, id: product.id!, active: !!product.active })}
                      onUploadImage={() => { fileInputRef.current?.setAttribute('data-target-id', product.id!); fileInputRef.current?.click() }}
                      isUploading={uploading === product.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                  {/* List header */}
                  <div className="px-6 py-4 border-b border-neutral-50 bg-neutral-50/30 grid grid-cols-12 gap-4">
                    <div className="col-span-1" />
                    <div className="col-span-4 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Название</div>
                    <div className="col-span-2 text-[9px] font-black text-neutral-400 uppercase tracking-widest text-center">Ед.</div>
                    <div className="col-span-2 text-[9px] font-black text-neutral-400 uppercase tracking-widest text-center">Статус</div>
                    <div className="col-span-2 text-[9px] font-black text-neutral-400 uppercase tracking-widest text-right">Цена</div>
                    <div className="col-span-1" />
                  </div>
                  {filtered.map((product, idx) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      category={categories.find(c => c.id === product.categoryId)}
                      onEdit={() => setEditingProduct(product)}
                      onArchive={() => setConfirmDialog({ isOpen: true, id: product.id!, active: !!product.active })}
                      idx={idx}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-neutral-100 px-8 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{activeCount} активных позиций</span>
          {archivedCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle size={12} className="text-amber-400" />
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{archivedCount} в архиве</span>
            </div>
          )}
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors">
          <ArrowUpRight size={14} /> Добавить товар
        </button>
      </div>

      {/* Modals */}
      {editingProduct && (
        <ProductEditModal product={editingProduct} categories={categories}
          onClose={() => setEditingProduct(null)} onSuccess={() => { setEditingProduct(null); fetchData() }} />
      )}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.active ? 'Скрыть товар' : 'Активировать товар'}
        message={confirmDialog.active ? 'Скрыть товар из каталога? Он не будет доступен для продажи.' : 'Вернуть товар в каталог?'}
        confirmText={confirmDialog.active ? 'Скрыть' : 'Активировать'}
        isDestructive={confirmDialog.active}
        onClose={() => setConfirmDialog({ isOpen: false, id: null, active: false })}
        onConfirm={handleDeactivate}
      />
    </div>
  )
}
