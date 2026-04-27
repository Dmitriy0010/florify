import React, { useState } from 'react'
import { 
  Package, 
  Search, 
  Filter, 
  Plus,
  Loader2,
  AlertTriangle,
  Download,
  Database,
  Layers,
  Archive,
  History,
  AlertCircle,
  X,
  RotateCcw,
  Eye,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react'
import { cn, UNITS_MAP } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDashboardStore } from '@/store/useDashboardStore'
import { InventoryService, InventoryItem, CatalogService } from '@/lib/api'
import { ReceiveStockModal } from '@/components/inventory/ReceiveStockModal'
import { WriteOffModal } from '@/components/inventory/WriteOffModal'
import { StockHistoryModal } from '@/components/inventory/StockHistoryModal'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'

export default function InventoryStockPage() {
  const queryClient = useQueryClient()
  const { currentStoreId } = useDashboardStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [hideOutOfStock, setHideOutOfStock] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  
  // Modal States
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [selectedItemForWriteOff, setSelectedItemForWriteOff] = useState<InventoryItem | null>(null)
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<InventoryItem | null>(null)
  const [itemToArchive, setItemToArchive] = useState<InventoryItem | null>(null)
  const [archivedProductIds, setArchivedProductIds] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem; direction: 'asc' | 'desc' } | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory', currentStoreId, showArchived],
    queryFn: () => InventoryService.getStocks(currentStoreId || undefined, showArchived).then(res => res.data),
    enabled: !!currentStoreId
  })

  // Mutations
  const archiveMutation = useMutation({
    mutationFn: (productId: string) => CatalogService.deactivateProduct(productId),
    onSuccess: (_, productId) => {
      toast.success('Товар перенесен в архив')
      setArchivedProductIds(prev => new Set(prev).add(productId))
      setItemToArchive(null)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: () => toast.error('Ошибка архивации')
  })

  const restoreMutation = useMutation({
    mutationFn: (productId: string) => CatalogService.activateProduct(productId),
    onSuccess: (_, productId) => {
      toast.success('Товар восстановлен из архива')
      setArchivedProductIds(prev => {
         const next = new Set(prev)
         next.delete(productId)
         return next
      })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: () => toast.error('Ошибка восстановления')
  })

  const filteredItems = items
    .filter(item => {
      const isActuallyArchived = archivedProductIds.has(item.productId || '');
      if (!showArchived && isActuallyArchived) return false;
      
      const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = hideOutOfStock ? (item.quantity || 0) > 0 : true;
      const matchesCategory = categoryFilter === 'ALL' || item.categoryName === categoryFilter;
      
      return matchesSearch && matchesStock && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) return 0;
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;
      return aValue < bValue ? -1 * modifier : 1 * modifier;
    })

  const categories = Array.from(new Set(items.map(i => i.categoryName).filter(Boolean))) as string[];

  const handleSort = (key: keyof InventoryItem) => {
    setSortConfig(current => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  }

  const getStockBadge = (item: InventoryItem) => {
    const qty = item.quantity || 0;
    const min = item.minThreshold || 0;
    const base = "px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border";
    
    if (qty <= 0) {
      return <span className={cn(base, "bg-rose-50 text-rose-700 border-rose-200")}>Нет на складе</span>;
    }
    if (qty <= min) {
      return <span className={cn(base, "bg-amber-50 text-amber-700 border-amber-200")}>Мало (дефицит)</span>;
    }
    return <span className={cn(base, "bg-emerald-50 text-emerald-700 border-emerald-200")}>В наличии</span>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-500">
      {/* Header Area - Clean CRM Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight flex items-center gap-3">
             <Database className="text-neutral-900" size={24} />
             Складской учет
          </h1>
          <p className="text-sm text-neutral-500 mt-1 font-medium">Мониторинг остатков и управление ТМЦ на филиале</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
              type="button"
              onClick={() => setIsReceiveModalOpen(true)}
              className="h-10 px-4 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm"
           >
              <Plus size={18} />
              Оформить приход
           </button>
           <button 
              type="button" 
              className="h-10 px-4 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 flex items-center gap-2 hover:bg-neutral-50 shadow-sm"
           >
              <Download size={18} />
              Экспорт
           </button>
        </div>
      </div>

      {/* Stats Area - Subtle Summary Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-neutral-50 text-neutral-600 rounded-xl flex items-center justify-center shrink-0 border border-neutral-100">
               <Layers size={22} />
            </div>
            <div>
               <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Всего позиций</div>
               <div className="text-xl font-bold text-neutral-900 tracking-tight">{items.length} наим.</div>
            </div>
         </div>
         <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
               <AlertTriangle size={22} />
            </div>
            <div>
               <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Критические остатки</div>
               <div className="text-xl font-bold text-rose-600 tracking-tight">{items.filter(i => (i.quantity || 0) <= (i.minThreshold || 0)).length}</div>
            </div>
         </div>
         <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center gap-4 group cursor-pointer hover:border-neutral-900 transition-all" onClick={() => setShowArchived(!showArchived)}>
            <div className={cn(
               "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-all",
               showArchived ? "bg-neutral-900 text-white border-neutral-900" : "bg-neutral-50 text-neutral-400 border-neutral-100"
            )}>
               <Archive size={22} />
            </div>
            <div>
               <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Архивные товары</div>
               <div className="text-xl font-bold text-neutral-900 tracking-tight">{archivedProductIds.size} товаров</div>
            </div>
         </div>
      </div>

      {/* Toolbar - Same as Invoices */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Поиск по названию товара или категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-neutral-900 transition-all outline-none text-neutral-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="flex items-center gap-1.5 p-1 bg-neutral-50 rounded-lg border border-neutral-200">
              <button
                onClick={() => setHideOutOfStock(false)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                  !hideOutOfStock ? "bg-white text-neutral-900 shadow-sm border border-neutral-200" : "text-neutral-500"
                )}
              >
                Все
              </button>
              <button
                onClick={() => setHideOutOfStock(true)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                  hideOutOfStock ? "bg-white text-neutral-900 shadow-sm border border-neutral-200" : "text-neutral-500"
                )}
              >
                В наличии
              </button>
           </div>
           <div className="h-6 w-px bg-neutral-100 hidden md:block" />
           <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 pl-9 pr-8 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-600 outline-none hover:bg-neutral-50 transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">Все категории</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
        </div>
      </div>

      {/* Main Table - Exact Invoices Layout */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-200">
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <button onClick={() => handleSort('name')} className="flex items-center gap-2 hover:text-neutral-900 transition-colors">
                  Товар
                  <ArrowUpDown size={12} className={cn("transition-opacity", sortConfig?.key === 'name' ? 'opacity-100' : 'opacity-30')} />
                </button>
              </th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <button onClick={() => handleSort('quantity')} className="flex items-center gap-2 hover:text-neutral-900 transition-colors mx-auto">
                  Остаток
                  <ArrowUpDown size={12} className={cn("transition-opacity", sortConfig?.key === 'quantity' ? 'opacity-100' : 'opacity-30')} />
                </button>
              </th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <button onClick={() => handleSort('averageCost')} className="flex items-center gap-2 hover:text-neutral-900 transition-colors mx-auto">
                  Себестоимость
                  <ArrowUpDown size={12} className={cn("transition-opacity", sortConfig?.key === 'averageCost' ? 'opacity-100' : 'opacity-30')} />
                </button>
              </th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">Статус</th>
              <th className="px-6 py-4 text-right">Управление</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-32 text-center text-neutral-400 italic text-sm">Загрузка данных склада...</td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-32 text-center text-neutral-400 italic text-sm">Позиции не найдены</td>
              </tr>
            ) : filteredItems.map((item) => {
                const isArchived = archivedProductIds.has(item.productId);
                return (
                <tr 
                  key={item.productId || item.id} 
                  className={cn(
                     "group transition-colors",
                     isArchived ? "bg-neutral-50/50 opacity-60 grayscale" : "hover:bg-neutral-50/50"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 transition-colors border border-neutral-200 overflow-hidden">
                         {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package size={18} />}
                      </div>
                      <div>
                        <p className={cn("text-sm font-semibold transition-colors", isArchived ? "text-neutral-500" : "text-neutral-900 group-hover:text-black")}>
                           {item.name || '—'}
                           {isArchived && <span className="ml-2 text-[10px] font-bold bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Архив</span>}
                        </p>
                        <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-tighter">{item.categoryName || 'Общий каталог'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-bold text-neutral-900 tabular-nums">
                      {item.quantity || 0} <span className="text-neutral-400 font-medium text-[10px] uppercase">{(UNITS_MAP[item.unit || ''] || item.unit)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-neutral-700 tabular-nums">
                      {(item.averageCost || 0).toLocaleString('ru-RU')} <span className="text-neutral-400">₽</span>
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {getStockBadge(item)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {!isArchived ? (
                         <>
                            <button 
                              onClick={() => setSelectedItemForWriteOff(item)}
                              className="h-8 px-3 bg-white border border-neutral-200 text-rose-600 rounded-md text-xs font-bold hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
                            >
                               Списать
                            </button>
                            <button 
                              onClick={() => setItemToArchive(item)}
                              className="h-8 w-8 flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 rounded-md hover:text-neutral-900 hover:border-neutral-900 transition-all shadow-sm"
                              title="В архив"
                            >
                               <Archive size={14} />
                            </button>
                         </>
                       ) : (
                         <button 
                            onClick={() => restoreMutation.mutate(item.productId)}
                            className="h-8 px-3 bg-neutral-900 text-white rounded-md text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 shadow-md"
                         >
                            <RotateCcw size={12} />
                            Вернуть
                         </button>
                       )}
                       <button 
                          onClick={() => setSelectedItemForHistory(item)}
                          className="h-8 w-8 flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 rounded-md hover:text-neutral-900 hover:border-neutral-900 transition-all shadow-sm"
                          title="Журнал движений"
                       >
                          <History size={14} />
                       </button>
                       <ChevronRight size={14} className="text-neutral-300 ml-1" />
                    </div>
                  </td>
                </tr>
              )})}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 px-2 opacity-50">
         <History size={12} />
         <span className="text-[10px] font-medium tracking-tight uppercase">Inventory System v3.2.0 • Store: {currentStoreId?.slice(0,8)}</span>
      </div>

      {/* Modals Bridge */}
      <div id="modal-container-final">
        {itemToArchive && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
                 <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-neutral-900">Архивировать товар?</h3>
                 <p className="text-sm text-neutral-500 mt-2">Товар <b>«{itemToArchive.name}»</b> больше не будет отображаться в списках продажи и закупки.</p>
                 <div className="flex flex-col gap-2 mt-8">
                    <button 
                       onClick={() => archiveMutation.mutate(itemToArchive.productId || '')}
                       disabled={archiveMutation.isPending}
                       className="h-10 bg-neutral-900 text-white rounded-lg font-bold text-sm hover:bg-black disabled:opacity-50"
                    >
                       {archiveMutation.isPending ? 'Загрузка...' : 'Да, в архив'}
                    </button>
                    <button 
                       onClick={() => setItemToArchive(null)}
                       className="h-10 bg-transparent text-neutral-500 font-bold text-sm hover:text-neutral-900"
                    >
                       Отмена
                    </button>
                 </div>
              </div>
           </div>
        )}

        {isReceiveModalOpen && currentStoreId && (
          <ReceiveStockModal 
            storeId={currentStoreId}
            onClose={() => setIsReceiveModalOpen(false)}
          />
        )}

        {selectedItemForWriteOff && (
          <WriteOffModal 
            item={selectedItemForWriteOff}
            storeId={currentStoreId || ''}
            onClose={() => setSelectedItemForWriteOff(null)}
          />
        )}

        {selectedItemForHistory && (
          <StockHistoryModal 
            item={selectedItemForHistory}
            onClose={() => setSelectedItemForHistory(null)}
          />
        )}
      </div>
    </div>
  )
}
