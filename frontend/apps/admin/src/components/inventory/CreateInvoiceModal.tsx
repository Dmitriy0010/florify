import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Loader2, Save, ShoppingCart, Sparkles, TrendingUp, DollarSign } from 'lucide-react'
import { InvoiceService, SupplierService, CatalogService, StoreService, Invoice, Product } from '@/lib/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardStore } from '@/store/useDashboardStore'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CreateInvoiceModalProps {
  onClose: () => void
  onSuccess: () => void
  editInvoice?: Invoice | null
}

interface InvoiceItemDraft {
  productId: string
  productName: string
  orderedQuantity: number | string
  unitPrice: number | string
}

export function CreateInvoiceModal({ onClose, onSuccess, editInvoice }: CreateInvoiceModalProps) {
  const queryClient = useQueryClient()
  const { currentStoreId } = useDashboardStore()
  const [loading, setLoading] = useState(false)
  const [supplierId, setSupplierId] = useState(editInvoice?.supplierId || '')
  const [storeId, setStoreId] = useState(editInvoice?.storeId || currentStoreId || '')
  const [invoiceNumber, setInvoiceNumber] = useState(editInvoice?.invoiceNumber || '')
  const [plannedDeliveryAt, setPlannedDeliveryAt] = useState(
    editInvoice?.plannedDeliveryAt ? format(new Date(editInvoice.plannedDeliveryAt), 'yyyy-MM-dd') : ''
  )
  const [items, setItems] = useState<InvoiceItemDraft[]>(
    editInvoice?.items?.map(it => ({
      productId: it.productId!,
      productName: it.productName!,
      orderedQuantity: it.orderedQuantity!,
      unitPrice: it.unitPrice!
    })) || []
  )

  const { data: suppliersRes } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => SupplierService.getAll().then(res => res.data)
  })

  const { data: storesRes } = useQuery({
    queryKey: ['stores'],
    queryFn: () => StoreService.getAll().then(res => res.data)
  })
  
  const { data: productsRes } = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: () => CatalogService.getProducts({ size: 100 }).then(res => res.data)
  })
  const products = productsRes?.data || []

  // Set default store if not set
  useEffect(() => {
    if (!storeId && storesRes && storesRes.length > 0) {
      setStoreId(storesRes[0].id)
    }
  }, [storesRes, storeId])

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', orderedQuantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, updates: Partial<InvoiceItemDraft>) => {
    setItems(prev => {
      const newItems = [...prev]
      newItems[index] = { ...newItems[index], ...updates }
      return newItems
    })
  }

  const totalAmount = items.reduce((sum, item) => {
    const qty = typeof item.orderedQuantity === 'string' ? parseFloat(item.orderedQuantity) || 0 : item.orderedQuantity;
    const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice;
    return sum + (qty * price);
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId || !storeId || !invoiceNumber || items.length === 0) {
      toast.error('Заполните обязательные поля и добавьте товары')
      return
    }

    setLoading(true)
    try {
      const data = {
        supplierId,
        storeId,
        invoiceNumber,
        plannedDeliveryAt: plannedDeliveryAt ? new Date(plannedDeliveryAt).toISOString() : undefined,
        items: items.map(it => ({
          productId: it.productId,
          productName: it.productName || 'Неизвестный товар',
          orderedQuantity: typeof it.orderedQuantity === 'string' ? parseFloat(it.orderedQuantity) || 0 : it.orderedQuantity,
          unitPrice: typeof it.unitPrice === 'string' ? parseFloat(it.unitPrice) || 0 : it.unitPrice
        }))
      };

      if (editInvoice?.id) {
        await InvoiceService.update(editInvoice.id, data)
        toast.success('Закупка обновлена')
      } else {
        await InvoiceService.create(data)
        toast.success('Закупка сформирована')
      }
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      onSuccess()
    } catch (err: any) {
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const generateInvoiceNumber = () => {
    const date = new Date();
    const prefix = "PUR";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    setInvoiceNumber(`${prefix}-${year}${month}-${random}`);
  }

  const calculateMargin = (purchase: number | string, retail: number) => {
    if (!purchase || retail === undefined || retail === null) return null;
    const p = typeof purchase === 'string' ? parseFloat(purchase) || 0 : purchase;
    if (p <= 0) return null;
    const margin = ((retail - p) / retail) * 100;
    return Math.round(margin);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[95vh] border border-neutral-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
               {editInvoice ? `Редактирование заказа ${editInvoice.invoiceNumber}` : 'Оформление новой закупки'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">Заполните данные для заказа товаров у поставщика</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1.5 font-sans">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-0.5">Поставщик</label>
                <select 
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-[13px] font-medium focus:border-neutral-900 focus:ring-0 transition-all outline-none"
                >
                  <option value="">Выберите контрагента...</option>
                  {(suppliersRes?.data || []).map(s => (
                    <option key={s.id} value={s.id || ''}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-0.5">Склад приёмки</label>
                <select 
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-[13px] font-medium focus:border-neutral-900 focus:ring-0 transition-all outline-none"
                >
                  {(storesRes || []).map(s => (
                    <option key={s.id} value={s.id || ''}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 font-sans">
                <div className="flex items-center justify-between px-0.5">
                   <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Номер документа</label>
                   {!editInvoice && (
                     <button type="button" onClick={generateInvoiceNumber} className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1">
                       <Sparkles size={10} /> Авто
                     </button>
                   )}
                </div>
                <input 
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="№..."
                  className="w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-[13px] font-medium focus:border-neutral-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-0.5">Дата поставки</label>
                <input 
                  type="date"
                  value={plannedDeliveryAt}
                  onChange={(e) => setPlannedDeliveryAt(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-[13px] font-medium focus:border-neutral-900 transition-all outline-none"
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4 pt-4 border-t border-neutral-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={16} className="text-neutral-400" />
                  <h3 className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">Состав заказа</h3>
                </div>
                <button 
                  type="button"
                  onClick={addItem}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} /> Добавить товар
                </button>
              </div>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <div className="bg-white py-16 text-center text-neutral-300 text-sm italic border border-dashed border-neutral-200 rounded-xl">
                    Список пуст
                  </div>
                ) : (
                  items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const margin = calculateMargin(item.unitPrice, product?.currentPrice || 0);

                    return (
                      <div key={index} className="bg-white border border-neutral-200 rounded-xl p-4 transition-all hover:border-neutral-300 hover:shadow-sm">
                        <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                          <div className="flex-1 min-w-[240px] space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-0.5">Товар в каталоге</label>
                            <select 
                              value={item.productId}
                              onChange={(e) => {
                                const val = e.target.value
                                const prod = products.find(p => p.id === val)
                                updateItem(index, { productId: val, productName: prod?.name || '' })
                              }}
                              className="w-full h-10 px-3 bg-neutral-50 border border-neutral-100 rounded-lg text-[13px] font-medium outline-none focus:border-neutral-900 transition-all focus:bg-white"
                            >
                              <option value="">Выберите из каталога...</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id!}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex-1 min-w-[200px] space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-0.5">Название в накладной</label>
                            <input 
                              type="text" 
                              placeholder="Если отличается..."
                              value={item.productName}
                              onChange={(e) => updateItem(index, { productName: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 border border-neutral-100 rounded-lg text-[13px] font-medium outline-none focus:border-neutral-900 transition-all focus:bg-white"
                            />
                          </div>

                          <div className="w-24 space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center block">Кол-во</label>
                            <input 
                              type="number"
                              min="0"
                              value={item.orderedQuantity}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateItem(index, { orderedQuantity: val });
                              }}
                              className="w-full h-10 px-2 bg-neutral-50 border border-neutral-100 rounded-lg text-[13px] font-bold text-center outline-none focus:border-neutral-900 transition-all tabular-nums"
                            />
                          </div>

                          <div className="w-32 space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-right block pr-4">Цена закуп.</label>
                            <div className="relative">
                              <input 
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateItem(index, { unitPrice: val });
                                }}
                                className="w-full h-10 pl-3 pr-7 bg-neutral-50 border border-neutral-200 rounded-lg text-[13px] font-bold text-right outline-none focus:border-neutral-900 transition-all tabular-nums"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400">₽</span>
                            </div>
                          </div>

                          <div className="w-32 space-y-1.5 border-l border-neutral-100 pl-4">
                             <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                                <DollarSign size={10} /> Розничная
                             </label>
                             <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-neutral-900 tabular-nums">
                                   {product?.currentPrice ? `${product.currentPrice.toLocaleString('ru-RU')} ₽` : '—'}
                                </span>
                                {margin !== null && (
                                   <span className={cn(
                                      "text-[10px] font-bold",
                                      margin > 30 ? "text-emerald-500" : margin > 10 ? "text-orange-500" : "text-rose-500"
                                   )}>
                                      Маржа: {margin}%
                                   </span>
                                )}
                             </div>
                          </div>

                          <button 
                            type="button"
                            onClick={() => removeItem(index)}
                            className="h-10 w-10 flex items-center justify-center rounded-lg text-neutral-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Всего к оплате</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-2xl font-bold text-neutral-900 tabular-nums">{totalAmount.toLocaleString('ru-RU')}</p>
                   <p className="text-sm font-bold text-neutral-400">₽</p>
                </div>
              </div>
              <div className="h-10 w-px bg-neutral-200" />
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Позиций</p>
                <p className="text-xl font-bold text-neutral-700">{items.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
               <button 
                type="button"
                onClick={onClose}
                className="h-11 px-6 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
               >
                Отмена
               </button>
               <button 
                type="submit"
                disabled={loading}
                className="h-12 px-10 bg-neutral-900 text-white rounded-xl font-bold text-sm flex items-center gap-3 hover:bg-black transition-all shadow-lg shadow-black/20 disabled:opacity-50 active:scale-95 group"
               >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
                Сохранить закупку
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
