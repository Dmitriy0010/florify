import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingBasket,
  Trash2,
  Package,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Banknote,
  CreditCard,
  RefreshCw,
  Smartphone,
  ChevronRight,
  Filter,
  UserPlus,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import { isToday } from 'date-fns';
import { cn, getMediaUrl } from '../lib/utils';
import { catalogApi } from '../lib/catalogApi';
import { ordersApi } from '../lib/ordersApi';
import { customerApi } from '../lib/customerApi';
import { paymentApi } from '../lib/paymentApi';
import { inventoryApi } from '../lib/inventoryApi';
import type { CatalogProduct, Customer } from '../lib/types';
import { useStoreStore } from '../store/useStoreStore';
import { useAuthStore } from '../store/authStore';

const FALLBACK_FLOWER = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800';

const FLOWER_IMG_MAP: Record<string, string> = {
  'роза': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
  'тюльпан': 'https://images.unsplash.com/photo-1520323232427-81c328dc290f?auto=format&fit=crop&q=80&w=600',
  'хризантем': 'https://images.unsplash.com/photo-1508784411316-02b8cdbe5941?auto=format&fit=crop&q=80&w=600',
  'лилия': 'https://images.unsplash.com/photo-1508313880080-c4bef0730395?auto=format&fit=crop&q=80&w=600',
  'орхидея': 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&q=80&w=600',
  'пион': 'https://images.unsplash.com/photo-1490750967868-88df5691cc56?auto=format&fit=crop&q=80&w=600',
  'гипсофил': 'https://images.unsplash.com/photo-1471086569966-db3eebc25a59?auto=format&fit=crop&q=80&w=600',
  'гладиол': 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=600',
  'букет': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600',
};
const BAD_IMG = ['heatmap', 'chart', 'matrix', 'aerial', 'kitchen', 'bedroom', 'correlation', 'apartment', 'building', 'city', 'car', 'food', 'laptop', 'computer', 'office', 'sports', 'portrait', 'unsplash.com/photo-1485'];

function resolveFlowerImg(imageUrl: string | null | undefined, name: string): string {
  const url = (imageUrl || '').toLowerCase();
  const isBad = !imageUrl || BAD_IMG.some(p => url.includes(p)) || url.includes('picsum') || url.includes('loremflickr') || url.includes('placeholder');
  if (isBad) {
    const lower = name.toLowerCase();
    for (const [kw, img] of Object.entries(FLOWER_IMG_MAP)) {
      if (lower.includes(kw)) return img;
    }
    return FALLBACK_FLOWER;
  }
  if (!url.startsWith('http')) return getMediaUrl(imageUrl!);
  return imageUrl!;
}

interface BasketItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function PosPage() {
  const queryClient = useQueryClient();
  const storeId = useStoreStore((state) => state.currentStoreId);
  const employeeId = useAuthStore((state) => state.userId);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'SBP' | 'CARD' | null>(null);

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCrmOpen, setCrmOpen] = useState(false);

  // Today's sales summary
  const { data: todayOrdersRaw = [] } = useQuery({
    queryKey: ['orders', 'kanban', 'COMPLETED'],
    queryFn: () => ordersApi.getKanban('COMPLETED' as any, 200),
    refetchInterval: 60_000,
  });
  const todayOrders = Array.isArray(todayOrdersRaw)
    ? todayOrdersRaw.filter((o: any) => o.createdAt && isToday(new Date(o.createdAt)))
    : [];
  const todayRevenue = todayOrders.reduce((s: number, o: any) => s + (o.finalAmount ?? 0), 0);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => catalogApi.getProducts({ categoryId: selectedCategory ?? undefined, size: 100 }),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', customerSearch],
    queryFn: () => customerApi.search(customerSearch),
    enabled: customerSearch.length > 2,
  });

  // Stock balances for POS cards
  const { data: stockBalances = [] } = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: inventoryApi.getAllBalances,
    refetchInterval: 60_000,
  });

  const getStock = (productId: string) =>
    stockBalances.find(s => s.productId === productId)?.quantity ?? null;

  const totalPrice = useMemo(() => basket.reduce((sum, item) => sum + item.price * item.quantity, 0), [basket]);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!storeId || !employeeId) throw new Error('Store or Employee not selected');
      
      // 1. Create the POS Order (Fixed field names for Backend)
      const order = await ordersApi.createOrder({
        storeId,
        items: basket.map(item => ({ 
          productId: item.productId, 
          productName: item.name,
          quantity: item.quantity, 
          unitPrice: item.price,
          lineTotal: item.price * item.quantity
        })),
        customerId: selectedCustomer?.id,
        type: 'PICKUP', // Backend expects DELIVERY or PICKUP
        source: 'POS',  // Backend requires OrderSource
        paymentMethod: paymentMethod === 'SBP' ? 'ONLINE' : paymentMethod, // Map SBP to ONLINE
        status: 'COMPLETED'
      });

      // 2. Handle Payment
      if (paymentMethod === 'SBP') {
        // For SBP we initiate the QR flow on the backend
        await paymentApi.initiateSbp(order.id).catch(err => console.error('SBP initiation error:', err));
      }
      // For CASH and CARD, the order-service handles it implicitly 
      // since we sent paymentMethod in createOrder request.

      // 3. Stock Reduction (Inventory Sync)
      for (const item of basket) {
        try {
          await inventoryApi.writeOff({
            productId: item.productId,
            quantity: item.quantity,
            type: 'SALE',
            reason: `POS SALE #${order.orderNumber || order.id.slice(0,6)} by ${employeeId}`
          });
        } catch (e) {
          console.error('Stock reduction failed for item:', item.productId, e);
        }
      }

      return order;
    },
    onSuccess: () => {
      setBasket([]);
      setCheckoutOpen(false);
      setPaymentMethod(null);
      setSelectedCustomer(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: any) => {
      console.error('Checkout failed:', error);
      alert(`Ошибка проведения продажи: ${error?.response?.data?.message || error.message || 'Неизвестная ошибка'}`);
    }
  });

  const addToBasket = (product: CatalogProduct) => {
    setBasket(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { productId: product.id, name: product.name, price: product.currentPrice, quantity: 1 }];
    });
  };

  const filteredProducts = useMemo(() => {
    let list = products.map(p => ({
      ...p,
      imageUrl: resolveFlowerImg(p.imageUrl, p.name),
    }));

    if (selectedCategory) list = list.filter(p => p.categoryId === selectedCategory);
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(p => p.name.toLowerCase().includes(s) || (p.sku && p.sku.toLowerCase().includes(s)));
  }, [products, search, selectedCategory]);


  return (
    <div className="flex h-full gap-4 animate-fade-in overflow-hidden">
      <div className="flex-1 flex flex-col gap-3 min-w-0 h-full">

        {/* ── TODAY STATS STRIP ── */}
        <div style={{
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color="var(--color-brand)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Сегодня:</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {todayOrders.length}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 4, fontWeight: 600 }}>продаж</span>
              </div>
              <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-brand)', fontVariantNumeric: 'tabular-nums' }}>
                  {todayRevenue.toLocaleString('ru-RU')} ₽
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 4, fontWeight: 600 }}>выручка</span>
              </div>
            </div>
          </div>
          <Link
            to="/orders"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'white', color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            <ClipboardList size={14} /> Заказы <ChevronRight size={13} />
          </Link>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="premium-input w-full h-14 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={20} className="absolute left-4 top-4 text-slate-400" />
            </div>
            <button
              onClick={() => setCrmOpen(true)}
              className={cn(
                "premium-btn h-14 px-6 min-w-[180px] max-w-[240px]",
                selectedCustomer ? "premium-btn-primary" : "premium-btn-outline"
              )}
            >
              {selectedCustomer ? <CheckCircle2 size={16} /> : <UserPlus size={16} />}
              <span className="truncate text-xs">{selectedCustomer ? `${selectedCustomer.firstName}` : 'КЛИЕНТ'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg mr-1 shrink-0">
              <Filter size={12} className="text-slate-400 ml-1" />
              <span className="text-[9px] font-black uppercase text-slate-400 pr-1">Разделы</span>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap border-0 shrink-0 cursor-pointer",
                !selectedCategory ? "bg-slate-900 text-white shadow-lg" : "bg-white border border-slate-200 text-slate-500"
              )}
            >
              Все товары
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap border-0 shrink-0 cursor-pointer",
                  selectedCategory === cat.id ? "bg-emerald-600 text-white shadow-lg" : "bg-white border border-slate-200 text-slate-500"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto no-scrollbar pr-2">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', paddingBottom: '10rem' }}>
            {productsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card" style={{ height: 350, background: '#f8fafc', animation: 'pulse 2s infinite' }} />
              ))
            ) : filteredProducts.map(p => {
              const img = p.imageUrl || FALLBACK_FLOWER;
              const stockQty = getStock(p.id);
              const isOutOfStock = stockQty !== null && stockQty <= 0;
              const isLowStock = stockQty !== null && stockQty > 0 && stockQty < 5;
              return (
                <button
                  key={p.id}
                  onClick={() => addToBasket(p)}
                  className="glass-card p-0 flex flex-col group text-left overflow-hidden relative border-0 cursor-pointer"
                  style={{ height: 340, opacity: isOutOfStock ? 0.6 : 1 }}
                >
                  <div className="relative overflow-hidden bg-slate-100 shrink-0" style={{ height: 210 }}>
                    <img
                      src={img}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={p.name}
                    />
                    {/* Price badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white shadow-md text-slate-900 text-xs font-black rounded-lg">
                      {p.currentPrice.toLocaleString()} ₽
                    </div>
                    {/* Stock badge */}
                    {stockQty !== null && (
                      <div
                        className="absolute bottom-3 left-3 px-2.5 py-1 text-[10px] font-black rounded-lg shadow-md"
                        style={{
                          background: isOutOfStock ? '#EF4444' : isLowStock ? '#F59E0B' : 'rgba(0,0,0,0.65)',
                          color: 'white',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {isOutOfStock ? 'Нет в наличии' : `На складе: ${stockQty} шт`}
                      </div>
                    )}
                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(255,255,255,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'white', padding: '4px 10px', borderRadius: 8 }}>Нет в наличии</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight h-8 overflow-hidden">{p.name}</h4>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">АРТ: {p.sku || 'Н/Д'}</p>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOutOfStock ? 'bg-red-50 text-red-300' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Plus size={16} />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="glass-card flex flex-col shadow-premium shrink-0" style={{ width: 360, border: 'none', background: 'white' }}>
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <ShoppingBasket size={18} />
            </div>
            <h3 className="text-base font-black tracking-tight uppercase">Корзина</h3>
          </div>
          <button onClick={() => setBasket([])} className="text-slate-400 hover:text-rose-500 p-2 border-0 bg-transparent cursor-pointer">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 flex flex-col gap-4 no-scrollbar">
          {basket.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 gap-4 py-20">
              <ShoppingBasket size={48} />
              <p className="text-xs font-black uppercase tracking-widest">Пусто</p>
            </div>
          ) : basket.map(item => (
            <div key={item.productId} className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                <Package size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm font-black text-emerald-600">{item.price.toLocaleString()} ₽</p>
                  <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[10px]">
                    <button onClick={() => setBasket(p => p.map(i => i.productId === item.productId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0))} className="p-1 border-0 bg-transparent text-slate-400 cursor-pointer"><Minus size={12} /></button>
                    <span className="font-bold min-w-[14px] text-center">{item.quantity}</span>
                    <button onClick={() => addToBasket({ id: item.productId, name: item.name, currentPrice: item.price } as any)} className="p-1 border-0 bg-transparent text-slate-400 cursor-pointer"><Plus size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Итого</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{totalPrice.toLocaleString()} ₽</p>
            </div>
          </div>
          <button
            disabled={basket.length === 0}
            onClick={() => setCheckoutOpen(true)}
            className={cn("premium-btn premium-btn-primary w-full h-14 text-sm border-0 cursor-pointer px-4", basket.length === 0 && "opacity-30 cursor-not-allowed")}
          >
            <span className="truncate">ОФОРМИТЬ ПРОДАЖУ</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {isCrmOpen && (
        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col h-[550px] shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-base font-black uppercase">Выбор клиента</h2>
              <button onClick={() => setCrmOpen(false)} className="p-2 border-0 bg-transparent cursor-pointer"><X size={24} /></button>
            </div>
            <div className="p-4 border-b">
              <input autoFocus placeholder="Имя или телефон..." className="premium-input w-full h-12 text-sm" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
            </div>
            <div className="flex-1 overflow-auto p-4 flex flex-col gap-2 no-scrollbar">
              {customers.map(c => (
                <button key={c.id} onClick={() => { setSelectedCustomer(c); setCrmOpen(false); }} className="p-4 hover:bg-slate-50 flex justify-between items-center border border-slate-100 rounded-xl bg-transparent cursor-pointer text-left">
                  <div>
                    <p className="text-sm font-bold">{c.firstName} {c.lastName}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{c.phoneNumber}</p>
                  </div>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'absolute', inset: 0, 
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300, padding: 20
          }}
        >
           <div 
             className="scale-in"
             style={{
               background: 'white', borderRadius: 28, 
               width: 320, boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
               overflow: 'hidden', display: 'flex', flexDirection: 'column'
             }}
           >
              {/* Header */}
              <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--color-text-tertiary)', uppercase: true, letterSpacing: '0.1em' }}>POS ТЕРМИНАЛ</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-text-primary)', marginTop: 2 }}>Оплата заказа</span>
                 </div>
                 <button 
                    onClick={() => setCheckoutOpen(false)} 
                    style={{ width: 32, height: 32, borderRadius: '50%', background: '#f8fafc', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}
                 >
                    <X size={16} />
                 </button>
              </div>

              {/* Amount Display */}
              <div style={{ padding: '0 24px 24px' }}>
                 <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    {totalPrice.toLocaleString()} 
                    <span style={{ fontSize: 18, color: '#cbd5e1', fontWeight: 700 }}>₽</span>
                 </div>
              </div>

              {/* Methods Grid — FIXED SIZES */}
              <div style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                 {[
                    { id: 'CASH', label: 'Нал', icon: Banknote },
                    { id: 'SBP', label: 'СБП', icon: Smartphone },
                    { id: 'CARD', label: 'Карта', icon: CreditCard }
                 ].map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => setPaymentMethod(m.id as any)} 
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 8, height: 80, borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                        background: paymentMethod === m.id ? 'var(--color-brand-light)' : 'white',
                        border: `2px solid ${paymentMethod === m.id ? 'var(--color-brand)' : '#f1f5f9'}`,
                        color: paymentMethod === m.id ? 'var(--color-brand)' : '#94a3b8'
                      }}
                    >
                       <m.icon size={20} strokeWidth={paymentMethod === m.id ? 3 : 2} />
                       <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                         {m.label}
                       </span>
                    </button>
                 ))}
              </div>

              {/* Action Button — SOLID AND TALL */}
              <div style={{ padding: '0 24px 24px' }}>
                 <button 
                   disabled={!paymentMethod || checkoutMutation.isPending} 
                   onClick={() => checkoutMutation.mutate()} 
                   className="btn btn-xl"
                   style={{
                     width: '100%', height: 56, borderRadius: 16,
                     background: !paymentMethod ? '#f1f5f9' : 'var(--color-brand)',
                     color: !paymentMethod ? '#cbd5e1' : 'white',
                     border: 0, fontSize: 13, fontWeight: 900, textTransform: 'uppercase',
                     letterSpacing: '0.15em', cursor: paymentMethod ? 'pointer' : 'not-allowed',
                     boxShadow: paymentMethod ? '0 10px 25px rgba(61, 122, 94, 0.3)' : 'none'
                   }}
                 >
                    {checkoutMutation.isPending ? (
                       <RefreshCw size={18} className="spin" />
                    ) : (
                       'Пробить чек'
                    )}
                 </button>
              </div>
           </div>
        </div>
      )}



    </div>
  );
}
