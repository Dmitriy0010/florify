import React, { useState, useEffect } from 'react'
import {
  FolderOpen,
  Plus,
  Loader2,
  Search,
  Pencil,
  Trash2,
  Tag,
  Package,
  X,
  Check,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'
import { CatalogService, ProductCategory } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Category icons map
const CATEGORY_ICONS: Record<string, string> = {
  'Розы': '🌹', 'Тюльпаны': '🌷', 'Хризантемы': '🌸',
  'Лилии': '🌺', 'Букеты': '💐', 'Горшечные растения': '🪴',
  'Аксессуары': '🎀', 'GENERAL': '📦',
}

const getCategoryEmoji = (name?: string) => CATEGORY_ICONS[name || ''] ?? '🌿'

// ─────────────────────────────────────────────────────────────────────────────
// Category form modal (inline slide-in drawer)
// ─────────────────────────────────────────────────────────────────────────────
function CategoryFormPanel({
  category,
  onSave,
  onCancel,
  isSaving
}: {
  category?: ProductCategory
  onSave: (data: { name: string; description: string }) => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [name, setName] = useState(category?.name || '')
  const [description, setDescription] = useState(category?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) { toast.error('Заполните обязательные поля'); return }
    onSave({ name, description })
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-950/20 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      {/* Side Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] z-[101] flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        <div className="px-8 py-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="h-2 w-12 bg-neutral-900 rounded-full mb-4" />
              <h3 className="text-2xl font-black text-neutral-900 leading-tight">
                {category ? 'Редактировать категорию' : 'Новая категория'}
              </h3>
              <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-widest">
                {category ? 'Обновление параметров каталога' : 'Создание новой категории товаров'}
              </p>
            </div>
            <button 
              onClick={onCancel} 
              className="h-10 w-10 rounded-2xl bg-neutral-50 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Name Field */}
              <div className="group space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 transition-colors group-focus-within:text-neutral-900">
                  Название категории *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-neutral-900 transition-colors">
                    <Tag size={18} />
                  </div>
                  <input 
                    autoFocus 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="Напр. Розы или Букеты"
                    className="w-full h-14 pl-12 pr-5 bg-neutral-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-neutral-900 transition-all shadow-sm group-hover:bg-neutral-100/50" 
                  />
                </div>
              </div>

              {/* Description Field */}
              <div className="group space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 transition-colors group-focus-within:text-neutral-900">
                  Описание категории
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-neutral-900 transition-colors">
                    <Package size={18} />
                  </div>
                  <input 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Краткое описание для каталога"
                    className="w-full h-14 pl-12 pr-5 bg-neutral-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-neutral-900 transition-all shadow-sm group-hover:bg-neutral-100/50" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-10 flex flex-col gap-3">
              <button 
                type="submit" 
                disabled={isSaving || !name} 
                className="w-full h-14 bg-neutral-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98] shadow-2xl shadow-black/20"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {category ? 'Сохранить изменения' : 'Создать категорию'}
              </button>
              <button 
                type="button" 
                onClick={onCancel} 
                className="w-full h-14 bg-white border-2 border-neutral-100 text-neutral-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-900 transition-all"
              >
                Отменить
              </button>
            </div>
          </form>
        </div>
        
        {/* Decorative footer */}
        <div className="p-8 bg-neutral-50 border-t border-neutral-100 text-center">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
            Florify Catalog Management Console
          </p>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const res = await CatalogService.getCategories()
      setCategories(res.data)
    } catch {
      toast.error('Ошибка загрузки категорий')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleSave = async (data: { name: string; description: string }) => {
    setIsSaving(true)
    try {
      if (editingCategory?.id) {
        await CatalogService.updateCategory(editingCategory.id, data)
        toast.success('Категория обновлена')
      } else {
        await CatalogService.createCategory(data)
        toast.success('Категория создана')
      }
      setIsAdding(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (e: any) {
      toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = categories.filter(c =>
    !searchQuery || (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Категории</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
            Управление структурой каталога
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-neutral-600 transition-colors" />
            <input
              type="text"
              placeholder="Поиск категории..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-52 h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-500 focus:bg-white transition-all"
            />
          </div>
          <div className="w-px h-6 bg-neutral-100" />
          <button
            onClick={() => { setIsAdding(true); setEditingCategory(null) }}
            className="h-10 px-5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95"
          >
            <Plus size={16} /> Добавить категорию
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8 space-y-6">

        {/* Inline form */}
        {(isAdding || editingCategory) && (
          <CategoryFormPanel
            category={editingCategory ?? undefined}
            onSave={handleSave}
            onCancel={() => { setIsAdding(false); setEditingCategory(null) }}
            isSaving={isSaving}
          />
        )}

        {/* Stats row */}
        {!isLoading && categories.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center">
                <Tag size={18} className="text-neutral-400" />
              </div>
              <div>
                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Всего категорий</p>
                <p className="text-2xl font-black text-neutral-900">{categories.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center">
                <Package size={18} className="text-neutral-400" />
              </div>
              <div>
                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">С описанием</p>
                <p className="text-2xl font-black text-neutral-900">{categories.filter(c => c.description).length}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center">
                <FolderOpen size={18} className="text-neutral-400" />
              </div>
              <div>
                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Без описания</p>
                <p className="text-2xl font-black text-neutral-900">{categories.filter(c => !c.description).length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Categories grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-neutral-200" size={40} />
            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Загрузка категорий...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-neutral-50 flex items-center justify-center">
              <FolderOpen size={24} className="text-neutral-200" />
            </div>
            <p className="text-sm font-black text-neutral-300">Категорий нет</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="px-6 py-4 border-b border-neutral-50 bg-neutral-50/30 grid grid-cols-12 gap-4">
              <div className="col-span-4 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Название</div>
              <div className="col-span-6 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Описание</div>
              <div className="col-span-2 text-[9px] font-black text-neutral-400 uppercase tracking-widest text-right">Действия</div>
            </div>

            <div className="divide-y divide-neutral-50">
              {filtered.map((cat, idx) => (
                <div
                  key={cat.id}
                  className={cn(
                    'grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-neutral-50/50 transition-colors group',
                    idx % 2 === 1 ? 'bg-neutral-50/20' : 'bg-white'
                  )}
                >
                  {/* Name */}
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-xl flex-shrink-0 group-hover:border-neutral-200 transition-all">
                      {getCategoryEmoji(cat.name)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-neutral-900 leading-tight">{cat.name === 'GENERAL' ? 'Общее' : cat.name}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-span-6">
                    {cat.description ? (
                      <p className="text-sm font-bold text-neutral-500 line-clamp-1">{cat.description}</p>
                    ) : (
                      <p className="text-sm font-bold text-neutral-200 italic">Описание не добавлено</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditingCategory(cat); setIsAdding(false) }}
                      className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-neutral-100 px-8 py-3 flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
          {categories.length} категорий в каталоге
        </span>
        <button
          onClick={() => { setIsAdding(true); setEditingCategory(null) }}
          className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors"
        >
          <Plus size={12} /> Добавить категорию
        </button>
      </div>
    </div>
  )
}
