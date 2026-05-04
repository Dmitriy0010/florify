import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Search,
  AlertTriangle,
  RefreshCw,
  Box,
  ArrowRight,
  ShoppingBag,
  ClipboardList,
  History,
  Info,
  ChevronRight,
} from 'lucide-react';
import { inventoryApi } from '../lib/inventoryApi';
import { catalogApi } from '../lib/catalogApi';
import { getMediaUrl } from '../lib/utils';

/* ── Flower image fallbacks ── */
const FLOWER_IMG_MAP: Record<string, string> = {
  'роза':      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200',
  'тюльпан':   'https://images.unsplash.com/photo-1520323232427-81c328dc290f?auto=format&fit=crop&q=80&w=200',
  'хризантем': 'https://images.unsplash.com/photo-1508784411316-02b8cdbe5941?auto=format&fit=crop&q=80&w=200',
  'лилия':     'https://images.unsplash.com/photo-1508313880080-c4bef0730395?auto=format&fit=crop&q=80&w=200',
  'букет':     'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=200',
};
const FALLBACK = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=200';

function resolveImg(url: string | null | undefined, name: string): string {
  if (!url || url.includes('picsum') || url.includes('placeholder') || url.includes('loremflickr')) {
    const lower = name.toLowerCase();
    for (const [kw, img] of Object.entries(FLOWER_IMG_MAP)) {
      if (lower.includes(kw)) return img;
    }
    return FALLBACK;
  }
  return url.startsWith('http') ? url : getMediaUrl(url);
}

export default function InventoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: catalog = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => catalogApi.getProducts({ size: 1000 }),
  });

  const { data: stock = [], isLoading: stockLoading, refetch: refetchStock } = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: inventoryApi.getAllBalances,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const items = useMemo(() => {
    let list = catalog.map(p => {
      // stock entries may use productId OR id field depending on backend
      const stockEntry = stock.find(
        s => s.productId === p.id || (s as any).id === p.id
      );
      return {
        ...p,
        _img: resolveImg(p.imageUrl, p.name),
        _qty: stockEntry?.quantity ?? 0,
      };
    });

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(s) ||
        (item.sku && item.sku.toLowerCase().includes(s))
      );
    }
    return list;
  }, [catalog, stock, search]);

  const lowStockCount = items.filter(i => i._qty < 5).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }}
         className="fade-in">

      {/* ── HEADER ── */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'var(--color-text-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Box size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Учет товаров
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Всего:</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-primary)' }}>{catalog.length}</span>
              </div>
              <div style={{ width: 1, height: 10, background: 'var(--color-border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>К пополнению:</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: lowStockCount > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>{lowStockCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate('/inventory/audit')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 10,
              background: 'var(--color-text-primary)', color: 'white',
              border: 0, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
            <RefreshCw size={14} /> Инвентаризация
          </button>
          <button
            onClick={() => refetchStock()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 10,
              background: 'white', color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
            <RefreshCw size={13} /> Обновить
          </button>
          <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 4px' }} />
          <Link to="/pos" style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid var(--color-border)', background:'white', color:'var(--color-text-secondary)', fontSize:12, fontWeight:600, textDecoration:'none' }}>
            <ShoppingBag size={14}/> Терминал
          </Link>
          <Link to="/orders" style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid var(--color-border)', background:'white', color:'var(--color-text-secondary)', fontSize:12, fontWeight:600, textDecoration:'none' }}>
            <ClipboardList size={14}/> Заказы
          </Link>
        </div>
      </div>

      {/* ── SEARCH ── */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Поиск по названию или артикулу..."
          className="input input-lg"
          style={{ paddingLeft: 40, borderRadius: 12 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── LIST ── */}
      <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 120px 120px 60px',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-sunken)',
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Фото</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Наименование</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Артикул</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Остаток</span>
          <span />
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
          {stockLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60, opacity: 0.2 }}>
              <RefreshCw size={32} className="spin" />
            </div>
          ) : items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, opacity: 0.15, gap: 12 }}>
              <Package size={48} strokeWidth={1} />
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Товары не найдены</span>
            </div>
          ) : (
            items.map(item => (
              <InventoryRow key={item.id} item={item} onClick={() => navigate(`/inventory/${item.id}`)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InventoryRow({ item, onClick }: { item: any; onClick: () => void }) {
  const isLow = item._qty < 5;
  const isOut = item._qty <= 0;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr 120px 120px 60px',
        alignItems: 'center',
        padding: '10px 20px',
        borderBottom: '1px solid var(--color-border)',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F9F9F8')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Img */}
      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--color-bg-sunken)' }}>
        <img src={item._img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isOut ? 0.5 : 1 }} />
      </div>

      {/* Name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.name}</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{item.unit || 'шт'}</span>
      </div>

      {/* SKU */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
          {item.sku || '—'}
        </span>
      </div>

      {/* Qty */}
      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
        {isLow && <AlertTriangle size={14} color="var(--color-error)" />}
        <span style={{
          fontSize: 18,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          color: isOut ? 'var(--color-error)' : isLow ? 'var(--color-warning)' : 'var(--color-text-primary)'
        }}>
          {item._qty}
        </span>
      </div>

      {/* Arrow */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
