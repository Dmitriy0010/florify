import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  UserPlus,
  UserCheck,
  Package,
  Store,
  Loader2,
  X,
  Ticket,
  Coins,
  ShoppingBag,
  AlertCircle,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CatalogService,
  OrderService,
  LoyaltyService,
  InventoryService,
  Product,
  CreateOrderRequest,
  CustomerSummary
} from '@/lib/api'
import { useDashboardStore } from '@/store/useDashboardStore'
import { toast } from 'sonner'
import { CustomerSearchModal } from '@/components/pos/CustomerSearchModal'
import { ReceiptModal } from '@/components/pos/ReceiptModal'
import { PaymentQRModal } from '@/components/pos/PaymentQRModal'
import { PaymentService } from '@/lib/api'
import { UNITS_MAP } from '@/lib/utils'

interface CartItem extends Product { quantity: number }

const getImagePath = (path?: string | null) => {
  if (!path) return ''
  const m = (path || '').match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
  return m ? `/api/v1/media/${m[0]}` : ''
}

function ProductTile({ product, categoryName, onAdd, disabled }: {
  product: Product; categoryName: string; onAdd: () => void; disabled: boolean
}) {
  const img = getImagePath(product.imageUrl)
  return (
    <div
      onClick={disabled ? undefined : onAdd}
      className={cn(
        'bg-white rounded-2xl border border-neutral-100 overflow-hidden transition-all duration-200 group flex flex-col cursor-pointer hover:shadow-lg hover:border-neutral-300 hover:-translate-y-0.5',
        disabled && 'opacity-40 grayscale pointer-events-none'
      )}
    >
      <div className="aspect-[4/3] relative bg-neutral-50 overflow-hidden">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={24} className="text-neutral-200" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-white/90 backdrop-blur rounded text-[8px] font-black text-neutral-500 uppercase tracking-widest border border-neutral-100">
            {categoryName}
          </span>
        </div>
        <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/5 transition-all flex items-end justify-end p-2">
          <div className="h-8 w-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 scale-90 group-hover:scale-100">
            <Plus size={16} />
          </div>
        </div>
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black text-neutral-900 truncate leading-tight">{product.name}</p>
          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
            {UNITS_MAP[product.unit || ''] || product.unit}
          </p>
        </div>
        <p className="text-sm font-black text-neutral-900 tabular-nums flex-shrink-0 ml-2">
          {(product.currentPrice || 0).toLocaleString()} ₽
        </p>
      </div>
    </div>
  )
}

export default function POSPage() {
  const queryClient = useQueryClient()
  const { currentStoreId, globalSearchTerm, setGlobalSearchTerm } = useDashboardStore()
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [pointsToUseString, setPointsToUseString] = useState('0')
  const pointsToUse = parseInt(pointsToUseString) || 0
  const [lastOrder, setLastOrder] = useState<any>(null)
  const [sbpData, setSbpData] = useState<{ id: string, number: string, amount: number, qr: string } | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['pos-categories'],
    queryFn: () => CatalogService.getCategories().then(r => r.data)
  })

  const { data: productsData, isLoading: isCatalogLoading } = useQuery({
    queryKey: ['pos-products', selectedCategoryId, globalSearchTerm],
    queryFn: () => CatalogService.getProducts({ categoryId: selectedCategoryId, searchTerm: globalSearchTerm || undefined, size: 100 }).then(r => r.data)
  })
  const products = productsData?.data || []

  // Load actual stocks - USING THE SAME KEY AS INVENTORY PAGE TO REUSE CACHE
  // Key MUST match InventoryStockPage: ['inventory', currentStoreId, showArchived]
  const { data: items = [], isLoading: isStocksLoading } = useQuery({
    queryKey: ['inventory', currentStoreId, false], // Same key as InventoryStockPage with showArchived=false
    queryFn: async () => {
      try {
        const res = await InventoryService.getStocks(currentStoreId || undefined, false);
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 401) {
          toast.error('Сессия истекла! Пожалуйста, выйдите из системы и войдите снова.')
        }
        throw err;
      }
    },
    enabled: !!currentStoreId,
    staleTime: 30_000, // 30 seconds — avoid re-fetching on every render
    retry: (failureCount, error: any) => {
      // Don't retry on 401 — token is expired
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    }
  })
  
  const stocks = items || [];

  /**
   * Triple-fallback stock lookup:
   * 1. Match by productId (UUID, case-insensitive)
   * 2. Match by balance id
   * 3. Match by product name (fuzzy)
   */
  const getStockForProduct = (productId: string, productName?: string): number => {
    if (!productId || stocks.length === 0) return 0;
    
    const pId = String(productId).toLowerCase();
    const pName = String(productName || '').trim().toLowerCase();

    const stock = stocks.find(s => {
      // Step 1: match by productId (UUID, normalised to lowercase)
      const sProductId = String(s.productId || '').toLowerCase();
      if (sProductId && sProductId === pId) return true;

      // Step 2: match by balance record id
      const sId = String(s.id || '').toLowerCase();
      if (sId && sId === pId) return true;

      // Step 3: name-based fallback (handles edge-cases where UUIDs mismatch)
      if (pName) {
        const sName = String(s.name || '').trim().toLowerCase();
        if (sName && (sName === pName || sName.includes(pName) || pName.includes(sName))) return true;
      }

      return false;
    });
    
    if (!stock) return 0;

    // Accept any quantity field the backend may return
    const available = (stock as any).quantity ??
                      (stock as any).quantityInStock ??
                      (stock as any).quantityRemaining ?? 0;
    return Number(available);
  }

  // Update helper
  const getStock = (p: any) => getStockForProduct(p.id, p.name);

  // Debug: log when stocks change
  useEffect(() => {
    if (stocks.length > 0) {
      console.log("[POS] Stocks synced:", stocks.length, "items, first:", stocks[0]?.name, stocks[0]?.quantity);
    } else if (!isStocksLoading && currentStoreId) {
      console.warn("[POS] Stocks empty for store:", currentStoreId);
    }
  }, [stocks, isStocksLoading, currentStoreId]);

  const { data: loyaltyAccount, isLoading: isLoyaltyLoading } = useQuery({
    queryKey: ['loyalty', selectedCustomer?.id],
    queryFn: () => LoyaltyService.getAccount(selectedCustomer!.id!).then(r => r.data),
    enabled: !!selectedCustomer?.id,
  })

  const addToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
  }

  const setQty = (id: string, val: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, val) } : i))
  }

  const total = cart.reduce((s, i) => s + (i.currentPrice || 0) * i.quantity, 0)
  const finalTotal = Math.max(0, total - pointsToUse)
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0)

  // Debug: verify field mapping is correct (name field, not productName)
  if (stocks.length > 0 && process.env.NODE_ENV === 'development') {
    console.log('[POS] Stock sample:', stocks.slice(0,3).map(s => `${s.name}: ${(s as any).quantity} (productId: ${s.productId})`));
  }

  const hasStockErrors = cart.some(item => item.id && item.quantity > getStockForProduct(item.id))

  const createOrderMutation = useMutation({
    mutationFn: async (req: CreateOrderRequest) => {
      const res = await OrderService.createOrder(req)
      const orderId = res.data.id
      if (req.paymentMethod === 'ONLINE') {
        const p = await PaymentService.initiateSbp(orderId!)
        return { ...res, paymentData: p.data }
      }
      if (orderId) await OrderService.updateStatus(orderId, 'COMPLETED')
      return res
    },
    onSuccess: (res, variables) => {
      if (variables.paymentMethod === 'ONLINE' && (res as any).paymentData) {
        setSbpData({
          id: res.data.id!,
          number: res.data.orderNumber!,
          amount: finalTotal,
          qr: (res as any).paymentData.qrCodeData
        })
        return
      }
      toast.success('Продажа оформлена!')
      setLastOrder({
        id: res.data.id,
        total, discount: pointsToUse, finalTotal,
        paymentMethod: variables.paymentMethod,
        items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.currentPrice || 0 })),
        customer: selectedCustomer
      })
      setCart([])
      setSelectedCustomer(null)
      setPointsToUseString('0')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (e: any) => toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
  })

  const handleCheckout = (paymentMethod: 'CASH' | 'CARD' | 'ONLINE') => {
    if (!currentStoreId) { toast.error('Выберите филиал в верхнем меню!'); return }
    if (cart.length === 0) { toast.error('Корзина пуста'); return }
    createOrderMutation.mutate({
      storeId: currentStoreId,
      customerId: selectedCustomer?.id,
      items: cart.map(i => ({ productId: i.id || '', productName: i.name, quantity: i.quantity, unitPrice: i.currentPrice || 0 })),
      bonusPointsUsed: pointsToUse > 0 ? pointsToUse : undefined,
      type: 'PICKUP',
      source: 'POS',
      paymentMethod,
    })
  }

  const handleSbpSuccess = () => {
    toast.success('Оплата прошла успешно!')
    setLastOrder({
      id: sbpData?.id,
      total, discount: pointsToUse, finalTotal,
      paymentMethod: 'ONLINE',
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.currentPrice || 0 })),
      customer: selectedCustomer
    })
    setSbpData(null)
    setCart([])
    setSelectedCustomer(null)
    setPointsToUseString('0')
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }

  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden -m-8">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="bg-white border-b border-neutral-100 px-7 py-4 flex items-center justify-between flex-shrink-0 shadow-sm min-h-[73px]">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-neutral-400" />
            <h2 className="text-base font-black text-neutral-900">Быстрый заказ</h2>
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded text-[9px] font-black uppercase tracking-widest">Admin POS</span>
          </div>
          {!currentStoreId && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Выберите филиал</span>
            </div>
          )}
        </div>

        <div className="bg-white border-b border-neutral-50 px-7 py-3 flex items-center gap-2 overflow-x-auto flex-shrink-0">
          <button onClick={() => setSelectedCategoryId(undefined)}
            className={cn('h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all',
              !selectedCategoryId ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            )}>
            Все товары
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? undefined : cat.id)}
              className={cn('h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all',
                selectedCategoryId === cat.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              )}>
              {cat.name === 'GENERAL' ? 'Общее' : cat.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {(isCatalogLoading || isStocksLoading) ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-neutral-200" size={36} />
              <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Загрузка каталога...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-neutral-50 flex items-center justify-center">
                <Package size={24} className="text-neutral-200" />
              </div>
              <p className="text-sm font-black text-neutral-300">Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {products.map(product => (
                <ProductTile
                  key={product.id}
                  product={product}
                  categoryName={categories.find(c => c.id === product.categoryId)?.name || '—'}
                  onAdd={() => addToCart(product)}
                  disabled={!currentStoreId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[380px] flex-shrink-0 bg-white border-l border-neutral-100 flex flex-col shadow-xl">
        <div className="px-6 py-5 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Заказ</p>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-neutral-900">Корзина</h3>
                {itemCount > 0 && (
                  <span className="h-5 min-w-5 px-1.5 bg-neutral-900 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {selectedCustomer ? (
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center flex-shrink-0">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-neutral-900">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Coins size={11} className="text-amber-500" />
                      {isLoyaltyLoading ? <Loader2 size={11} className="animate-spin text-neutral-300" /> : (
                        <span className="text-[10px] font-black text-neutral-500">{loyaltyAccount?.pointsBalance || 0} баллов</span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => { setSelectedCustomer(null); setPointsToUseString('0') }} className="h-7 w-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsCustomerModalOpen(true)}
              className="w-full flex items-center gap-3 h-12 px-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-500 hover:bg-neutral-100 hover:border-neutral-300 transition-all group">
              <UserPlus size={16} className="text-neutral-400 group-hover:text-neutral-700 transition-colors" />
              <span className="text-[11px] font-black text-neutral-500 group-hover:text-neutral-700 uppercase tracking-widest transition-colors">Выбрать клиента</span>
              <ChevronRight size={14} className="ml-auto text-neutral-300" />
            </button>
          )}
        </div>

        {/* ── Totals + Payment (NEW: HIGH POSITION) ── */}
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex-shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">К оплате</span>
            <span className="text-3xl font-black text-neutral-900 tabular-nums">{finalTotal.toLocaleString()} ₽</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCheckout('CASH')}
              disabled={cart.length === 0 || createOrderMutation.isPending || hasStockErrors}
              className="flex items-center justify-center gap-2.5 h-14 bg-neutral-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-40 active:scale-95 shadow-lg shadow-black/10"
            >
              {createOrderMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Banknote size={18} />}
              Наличные
            </button>
            <button
              onClick={() => handleCheckout('ONLINE')}
              disabled={cart.length === 0 || createOrderMutation.isPending || hasStockErrors}
              className="flex items-center justify-center gap-2.5 h-14 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-40 active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              {createOrderMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-white rounded-lg flex items-center justify-center p-0.5">
                    <img src="https://sbp.nspk.ru/wp-content/themes/sbp/assets/img/logo.svg" className="w-full h-full" alt="SBP" />
                  </span>
                  СБП
                </div>
              )}
            </button>
          </div>
          
          {pointsToUse > 0 && (
            <div className="flex items-center justify-between text-[9px] font-black text-amber-600 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Ticket size={12} /> Скидка {pointsToUse} ₽</span>
              <span className="text-neutral-400 tabular-nums">из {total} ₽</span>
            </div>
          )}
        </div>

        {/* ── Cart items (Scrollable area) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Позиции ({itemCount})</span>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors">
                Очистить корзину
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                <ShoppingBag size={24} className="text-neutral-200" />
              </div>
              <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Корзина пуста</p>
            </div>
          ) : (
            cart.map(item => {
              const img = getImagePath(item.imageUrl)
              const available = getStockForProduct(item.id!)
              const isLowStock = item.quantity > available

              return (
                <div key={item.id} className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all group animate-in slide-in-from-right-4 duration-200",
                  isLowStock ? "bg-rose-50 border-rose-200" : "bg-neutral-50 border-neutral-100"
                )}>
                  <div className="h-11 w-11 rounded-xl bg-white border border-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {img ? <img src={img} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-neutral-200" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-neutral-900 truncate">{item.name}</p>
                      {isLowStock && <AlertCircle size={12} className="text-rose-500 animate-pulse" />}
                    </div>
                    <p className="text-[10px] font-bold text-neutral-400 mt-0.5 tabular-nums">
                      {(item.currentPrice || 0)} ₽ × {item.quantity} = <span className="text-neutral-700">{((item.currentPrice || 0) * item.quantity).toLocaleString()} ₽</span>
                    </p>
                    {isLowStock && (
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1">
                        Недостаточно! Доступно: {available} [ID: {item.id?.slice(0,8)}]
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                      <button onClick={() => item.id && updateQty(item.id, -1)} className="h-7 w-7 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all">
                        <Minus size={12} />
                      </button>
                      <input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => item.id && setQty(item.id, parseInt(e.target.value) || 1)}
                        onFocus={(e) => e.target.select()}
                        className="w-12 text-center text-xs font-black text-neutral-900 tabular-nums bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-x border-neutral-100 h-full"
                      />
                      <button onClick={() => item.id && updateQty(item.id, +1)} className="h-7 w-7 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))}
                      className="h-7 w-7 flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {isCustomerModalOpen && (
        <CustomerSearchModal onSelect={c => { setSelectedCustomer(c); setIsCustomerModalOpen(false) }} onClose={() => setIsCustomerModalOpen(false)} />
      )}
      {lastOrder && <ReceiptModal orderData={lastOrder} onClose={() => setLastOrder(null)} />}
      {sbpData && (
        <PaymentQRModal 
          orderId={sbpData.id}
          orderNumber={sbpData.number}
          amount={sbpData.amount}
          qrData={sbpData.qr}
          onSuccess={handleSbpSuccess}
          onClose={() => setSbpData(null)}
        />
      )}
    </div>
  )
}
