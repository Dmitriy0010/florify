import React, { useState, useEffect } from 'react'
import {
  Plus,
  Store,
  MapPin,
  Phone,
  Trash2,
  Pencil,
  Loader2,
  Copy,
  CheckCircle2,
  Archive,
  ArrowUpRight,
  Building2,
  MoreVertical,
  X,
  History,
  LayoutGrid,
  List,
  RefreshCcw,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { StoreService, Store as StoreItem } from '@/lib/api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

// ─────────────────────────────────────────────────────────────────────────────
// Components & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const Badge = ({ children, variant = 'neutral' }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info' }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    neutral: 'bg-neutral-50 text-neutral-600 border-neutral-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100'
  }
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider', variants[variant])}>
      {children}
    </span>
  )
}

function StoreFormPanel({
  store,
  onSave,
  onCancel,
  isSaving
}: {
  store?: StoreItem
  onSave: (data: { name: string; address: string; phone: string }) => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [form, setForm] = useState({
    name: store?.name || '',
    address: store?.address || '',
    phone: store?.phone || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.address) { toast.error('Заполните обязательные поля'); return }
    onSave(form)
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
                {store ? 'Редактировать точку' : 'Новый филиал'}
              </h3>
              <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-widest">
                {store ? 'Обновление данных инфраструктуры' : 'Создание новой локации в сети'}
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
              <div className="group space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 transition-colors group-focus-within:text-neutral-900">
                  Название филиала *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-neutral-900 transition-colors">
                    <Building2 size={18} />
                  </div>
                  <input 
                    autoFocus 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Напр. Ленина 32"
                    className="w-full h-14 pl-12 pr-5 bg-neutral-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-neutral-900 transition-all shadow-sm group-hover:bg-neutral-100/50" 
                  />
                </div>
              </div>

              <div className="group space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 transition-colors group-focus-within:text-neutral-900">
                  Адрес размещения *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-neutral-900 transition-colors">
                    <MapPin size={18} />
                  </div>
                  <input 
                    value={form.address} 
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Город, улица, дом"
                    className="w-full h-14 pl-12 pr-5 bg-neutral-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-neutral-900 transition-all shadow-sm group-hover:bg-neutral-100/50" 
                  />
                </div>
              </div>

              <div className="group space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 transition-colors group-focus-within:text-neutral-900">
                  Контактный телефон
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-neutral-900 transition-colors">
                    <Phone size={18} />
                  </div>
                  <input 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+7 (___) ___-__-__" 
                    type="tel"
                    className="w-full h-14 pl-12 pr-5 bg-neutral-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-neutral-900 transition-all shadow-sm group-hover:bg-neutral-100/50" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-10 flex flex-col gap-3">
              <button 
                type="submit" 
                disabled={isSaving} 
                className="w-full h-14 bg-neutral-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98] shadow-2xl shadow-black/20"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {store ? 'Сохранить изменения' : 'Создать точку продаж'}
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
            Florify Infrastructure Management Console
          </p>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function PointsOfSalePage() {
  const [stores, setStores] = useState<StoreItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: string | null; name: string; type: 'delete' | 'archive' }>({ 
    isOpen: false, id: null, name: '', type: 'delete' 
  })

  const fetchStores = async () => {
    setIsLoading(true)
    try { const res = await StoreService.getAll({ includeInactive: true }); setStores(res.data) }
    catch { toast.error('Ошибка загрузки точек продаж') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchStores() }, [])

  const handleSave = async (data: { name: string; address: string; phone: string }) => {
    setIsSaving(true)
    try {
      if (editingStore?.id) {
        await StoreService.update(editingStore.id, { ...data, active: editingStore.active ?? true })
        toast.success('Данные обновлены')
      } else {
        await StoreService.create({ ...data, active: true })
        toast.success('Филиал создан')
      }
      setIsAdding(false); setEditingStore(null); fetchStores()
    } catch (e: any) {
      toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
    } finally { setIsSaving(false) }
  }

  const handleArchiveToggle = async (store: StoreItem) => {
    try {
      await StoreService.update(store.id!, { 
        name: store.name!, 
        address: store.address!, 
        phone: store.phone!, 
        active: !store.active 
      })
      toast.success(store.active ? 'Точка отправлена в архив' : 'Точка восстановлена')
      fetchStores()
    } catch (e: any) {
      toast.error('Ошибка при архивации')
    }
  }

  const handleDelete = async () => {
    if (!confirmDialog.id) return
    try {
      await StoreService.delete(confirmDialog.id)
      toast.success('Точка продаж удалена навсегда')
      setConfirmDialog({ isOpen: false, id: null, name: '', type: 'delete' })
      fetchStores()
    } catch (e: any) {
      toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
    }
  }

  const displayed = stores.filter(s => showArchived ? !s.active : s.active)
  const activeCount = stores.filter(s => s.active).length
  const archivedCount = stores.filter(s => !s.active).length
  const isMainStore = (id?: string) => !!id?.endsWith('000000000001')

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFD] overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 flex-shrink-0">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-3xl bg-neutral-900 flex items-center justify-center text-white shadow-xl shadow-black/10 ring-8 ring-neutral-50">
            <Building2 size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Точки продаж</h1>
              <Badge variant="neutral">{activeCount} активных</Badge>
            </div>
            <p className="text-xs font-bold text-neutral-400 mt-1 uppercase tracking-[0.15em]">
              Управление сетью и инфраструктурой флористики
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-neutral-50 p-1 rounded-2xl border border-neutral-100">
            <button 
              onClick={() => setViewMode('table')}
              className={cn('h-9 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all', 
                viewMode === 'table' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-600')}
            >
              <List size={14} /> Список
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={cn('h-9 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all', 
                viewMode === 'grid' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-neutral-600')}
            >
              <LayoutGrid size={14} /> Сетка
            </button>
          </div>

          <div className="w-px h-8 bg-neutral-100 mx-2" />

          <button
            onClick={() => { setIsAdding(true); setEditingStore(null) }}
            className="h-11 px-6 bg-neutral-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-black/10 active:scale-95"
          >
            <Plus size={18} /> Добавить точку
          </button>
        </div>
      </div>

      {/* ── Sub-header / Filters ────────────────────────────────────────── */}
      <div className="px-10 py-5 bg-neutral-50/50 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setShowArchived(false)}
            className={cn('flex flex-col gap-1 transition-all group', !showArchived ? 'opacity-100' : 'opacity-40 hover:opacity-100')}
          >
            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Активные точки</span>
            <div className={cn('h-1 rounded-full bg-neutral-900 transition-all', !showArchived ? 'w-full' : 'w-0 group-hover:w-4')} />
          </button>
          <button 
            onClick={() => setShowArchived(true)}
            className={cn('flex flex-col gap-1 transition-all group', showArchived ? 'opacity-100' : 'opacity-40 hover:opacity-100')}
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900">Архив</span>
              <span className="h-4 px-1.5 bg-neutral-200 rounded-md text-[9px] font-black flex items-center justify-center">{archivedCount}</span>
            </div>
            <div className={cn('h-1 rounded-full bg-neutral-900 transition-all', showArchived ? 'w-full' : 'w-0 group-hover:w-4')} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={fetchStores} className="h-10 w-10 text-neutral-400 hover:text-neutral-900 bg-white border border-neutral-100 rounded-2xl flex items-center justify-center transition-all">
            <RefreshCcw size={16} className={cn(isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── Content Area ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-neutral-50/30 p-10 custom-scrollbar">
        
        {/* Form Panel (Side Drawer) */}
        {(isAdding || editingStore) && (
          <StoreFormPanel
            store={editingStore ?? undefined}
            onSave={handleSave}
            onCancel={() => { setIsAdding(false); setEditingStore(null) }}
            isSaving={isSaving}
          />
        )}

        {/* Views */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-20">
            <Loader2 className="animate-spin" size={48} />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Синхронизация данных...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white border border-neutral-100 border-dashed rounded-[32px] gap-6">
            <div className="h-20 w-20 rounded-3xl bg-neutral-50 flex items-center justify-center text-neutral-200">
              <Store size={40} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-neutral-900">{showArchived ? 'Архив пуст' : 'Точек пока нет'}</h3>
              <p className="text-sm text-neutral-400 mt-1">Добавьте первую точку продаж, чтобы начать управление</p>
            </div>
            {!showArchived && (
              <button onClick={() => setIsAdding(true)} className="h-11 px-8 bg-neutral-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:shadow-lg transition-all">
                Создать первый филиал
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white border border-neutral-100 rounded-[32px] shadow-xl shadow-neutral-900/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100">
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Название и статус</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Адрес</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Контакты</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Управление</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {displayed.map(store => (
                  <tr key={store.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={cn('h-10 w-10 rounded-2xl flex items-center justify-center transition-all', store.active ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/10' : 'bg-neutral-100 text-neutral-400')}>
                          <Store size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-black text-neutral-900">{store.name}</span>
                            {isMainStore(store.id!) && <Badge variant="warning">Main</Badge>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={cn('h-1.5 w-1.5 rounded-full', store.active ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-neutral-300')} />
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">{store.active ? 'Активна' : 'В архиве'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-neutral-600">
                      <div className="flex items-center gap-2 max-w-[300px]">
                        <MapPin size={14} className="text-neutral-300 flex-shrink-0" />
                        <span className="truncate">{store.address}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-neutral-600">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-neutral-300 flex-shrink-0" />
                        <span>{store.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingStore(store)}
                          className="h-9 w-9 rounded-xl bg-white border border-neutral-100 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 flex items-center justify-center transition-all shadow-sm"
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          onClick={() => handleArchiveToggle(store)}
                          className={cn('h-9 px-4 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm',
                            store.active ? 'bg-white border-neutral-100 text-neutral-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100')}
                        >
                          {store.active ? <Archive size={14} /> : <RefreshCcw size={14} />}
                          {store.active ? 'В архив' : 'Вернуть'}
                        </button>
                        <div className="w-px h-6 bg-neutral-100 mx-1" />
                        <button 
                          onClick={() => setConfirmDialog({ isOpen: true, id: store.id!, name: store.name!, type: 'delete' })}
                          className="h-9 w-9 rounded-xl bg-white border border-neutral-100 text-neutral-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {displayed.map(store => (
              <div key={store.id} className="bg-white rounded-[32px] border border-neutral-100 p-8 shadow-xl shadow-neutral-950/5 hover:shadow-2xl hover:shadow-neutral-950/10 transition-all group relative overflow-hidden">
                <div className="flex items-start justify-between mb-8">
                  <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center transition-all', store.active ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-900/20' : 'bg-neutral-100 text-neutral-400')}>
                    <Store size={26} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingStore(store)} className="h-10 w-10 rounded-2xl bg-neutral-50 text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-all">
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleArchiveToggle(store)}
                      className={cn('h-10 w-10 rounded-2xl flex items-center justify-center transition-all', 
                        store.active ? 'bg-neutral-50 text-neutral-400 hover:text-rose-500' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100')}
                    >
                      {store.active ? <Archive size={18} /> : <RefreshCcw size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black text-neutral-900 tracking-tight">{store.name}</h3>
                    {isMainStore(store.id!) && <Badge variant="warning">Main</Badge>}
                  </div>
                  <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest text-[9px]">{store.active ? 'Активный филиал' : 'Архивировано'}</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-3xl flex items-center gap-4 group/item hover:bg-white border border-transparent hover:border-neutral-100 transition-all">
                    <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <MapPin size={14} className="text-neutral-400" />
                    </div>
                    <span className="text-xs font-black text-neutral-700 truncate">{store.address}</span>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-3xl flex items-center gap-4 group/item hover:bg-white border border-transparent hover:border-neutral-100 transition-all">
                    <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Phone size={14} className="text-neutral-400" />
                    </div>
                    <span className="text-xs font-black text-neutral-700">{store.phone || 'Не указан'}</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-neutral-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => setEditingStore(store)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-all">
                    Подробнее <ChevronRight size={14} />
                  </button>
                  <button 
                    onClick={() => setConfirmDialog({ isOpen: true, id: store.id!, name: store.name!, type: 'delete' })}
                    className="h-8 w-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {!showArchived && (
              <button
                onClick={() => setIsAdding(true)}
                className="bg-white rounded-[32px] border-2 border-dashed border-neutral-200 p-8 flex flex-col items-center justify-center gap-5 hover:border-neutral-900 hover:bg-neutral-50 transition-all group min-h-[300px]"
              >
                <div className="h-16 w-16 rounded-[24px] bg-neutral-50 border border-neutral-200 flex items-center justify-center group-hover:bg-neutral-900 group-hover:border-neutral-900 transition-all scale-95 group-hover:scale-100 shadow-sm">
                  <Plus size={32} className="text-neutral-400 group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <span className="block text-[11px] font-black text-neutral-900 uppercase tracking-[0.2em] mb-1">Добавить точку</span>
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wide">Расширьте свою сеть филиалов</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'delete' ? 'Удаление точки продаж' : 'Архивация'}
        message={confirmDialog.type === 'delete' 
          ? `Вы уверены, что хотите БЕЗВОЗВРАТНО удалить «${confirmDialog.name}»? Это действие нельзя отменить.`
          : `Отправить «${confirmDialog.name}» в архив? Вы сможете восстановить её позже.`}
        confirmText={confirmDialog.type === 'delete' ? 'Удалить навсегда' : 'В архив'}
        isDestructive={confirmDialog.type === 'delete'}
        onClose={() => setConfirmDialog({ isOpen: false, id: null, name: '', type: 'delete' })}
        onConfirm={handleDelete}
      />
    </div>
  )
}
