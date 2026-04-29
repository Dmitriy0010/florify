import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  Search,
  RefreshCw,
  Package,
  Eye,
  EyeOff,
  ShoppingBag,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import { catalogApi } from '../lib/catalogApi';
import { inventoryApi } from '../lib/inventoryApi';
import { getMediaUrl } from '../lib/utils';

/* ── Flower image fallbacks by keyword ─────────── */
const FLOWER_IMAGES: Record<string, string> = {
  'роза':      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
  'тюльпан':   'https://images.unsplash.com/photo-1520323232427-81c328dc290f?auto=format&fit=crop&q=80&w=600',
  'хризантем': 'https://images.unsplash.com/photo-1508784411316-02b8cdbe5941?auto=format&fit=crop&q=80&w=600',
  'лилия':     'https://images.unsplash.com/photo-1508313880080-c4bef0730395?auto=format&fit=crop&q=80&w=600',
  'орхидея':   'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&q=80&w=600',
  'пион':      'https://images.unsplash.com/photo-1490750967868-88df5691cc56?auto=format&fit=crop&q=80&w=600',
  'гипсофил':  'https://images.unsplash.com/photo-1471086569966-db3eebc25a59?auto=format&fit=crop&q=80&w=600',
  'букет':     'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600',
  'цветок':    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=600',
  'flower':    'https://images.unsplash.com/photo-1490750967868-88df5691cc56?auto=format&fit=crop&q=80&w=600',
};
const FALLBACK = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600';

const BAD_IMAGE_PATTERNS = ['heatmap','chart','matrix','aerial','aerial','kitchen','bedroom','correlation','apartment','building','city','car','food','laptop','phone','computer','office','sports'];

function resolveImg(imageUrl: string | null | undefined, name: string): string {
  // Check if URL looks like a bad/unrelated image
  const url = (imageUrl || '').toLowerCase();
  const isBadUrl = BAD_IMAGE_PATTERNS.some(p => url.includes(p));
  if (!imageUrl || isBadUrl || url.includes('picsum') || url.includes('loremflickr')) {
    // Try to match by name
    const lower = name.toLowerCase();
    for (const [kw, img] of Object.entries(FLOWER_IMAGES)) {
      if (lower.includes(kw)) return img;
    }
    return FALLBACK;
  }
  if (!url.startsWith('http')) return getMediaUrl(imageUrl);
  return imageUrl;
}

export default function ShowcasePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => catalogApi.getProducts({ size: 1000 }),
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: () => inventoryApi.getAllBalances(),
  });

  const items = useMemo(() => {
    let list = products.map(p => ({
      ...p,
      _img: resolveImg(p.imageUrl, p.name),
      _qty: stockLevels.find(s => s.productId === p.id)?.quantity ?? 0,
    }));
    if (!showAll) list = list.filter(p => p.active);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || (p.sku && p.sku.toLowerCase().includes(s)));
    }
    return list;
  }, [products, stockLevels, search, showAll]);

  const activeCount = products.filter(p => p.active).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }}
         className="fade-in">

      {/* ── HEADER ── */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'var(--color-brand)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <LayoutGrid size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Витрина магазина
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)' }} className="pulse" />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {activeCount} позиций онлайн
              </span>
            </div>
          </div>
        </div>

        {/* Quick nav + filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowAll(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: showAll ? 'var(--color-bg-sunken)' : 'white',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
              color: 'var(--color-text-secondary)',
            }}>
            {showAll ? <Eye size={14}/> : <EyeOff size={14}/>}
            {showAll ? 'Все товары' : 'На витрине'}
          </button>
          <Link to="/pos" style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid var(--color-border)', background:'white', color:'var(--color-text-secondary)', fontSize:12, fontWeight:600, textDecoration:'none' }}>
            <ShoppingBag size={14}/> Терминал <ArrowRight size={12}/>
          </Link>
          <Link to="/orders" style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid var(--color-border)', background:'white', color:'var(--color-text-secondary)', fontSize:12, fontWeight:600, textDecoration:'none' }}>
            <ClipboardList size={14}/> Заказы <ArrowRight size={12}/>
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

      {/* ── GRID ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }} className="no-scrollbar">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80, opacity: 0.2 }}>
            <RefreshCw size={40} className="spin" />
          </div>
        ) : items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, opacity: 0.15, gap: 12 }}>
            <Package size={56} strokeWidth={1} />
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Товары не найдены</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {items.map(item => (
              <ShowcaseCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShowcaseCard({ item }: { item: any }) {
  const isOutOfStock = item._qty <= 0;
  const isLow = item._qty > 0 && item._qty < 5;

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      opacity: isOutOfStock ? 0.65 : 1,
      transition: 'box-shadow 0.15s, transform 0.15s',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 160, background: 'var(--color-bg-sunken)', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={item._img}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
        />
        {/* Stock badge */}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span style={{
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 10, fontWeight: 700,
            background: isOutOfStock ? '#EF4444' : isLow ? '#F59E0B' : 'rgba(255,255,255,0.92)',
            color: isOutOfStock || isLow ? 'white' : 'var(--color-text-primary)',
            backdropFilter: 'blur(4px)',
          }}>
            {isOutOfStock ? 'Нет' : `${item._qty} шт`}
          </span>
        </div>
        {/* Active / inactive */}
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          {item.active
            ? <span style={{ padding: '3px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: 'var(--color-brand)', color: 'white' }}>В витрине</span>
            : <span style={{ padding: '3px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: '#6B7280', color: 'white' }}>Скрыт</span>
          }
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3, flex: 1 }}>
          {item.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          АРТ: {item.sku || 'Н/Д'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {item.currentPrice.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>
    </div>
  );
}
