import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  CheckCircle2,
  ChevronLeft,
  RefreshCw,
  Plus,
  Minus,
  AlertTriangle,
} from 'lucide-react';
import { inventoryApi } from '../lib/inventoryApi';
import { catalogApi } from '../lib/catalogApi';
import { cn } from '../lib/utils';
import { useStoreStore } from '../store/useStoreStore';

export default function InventoryAuditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentStoreId } = useStoreStore();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [saveProgress, setSaveProgress] = useState<{ done: number; total: number } | null>(null);

  const { data: stock = [], isLoading: stockLoading } = useQuery({
    queryKey: ['inventory', 'all', currentStoreId],
    queryFn: () => inventoryApi.getAllBalances(currentStoreId),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => catalogApi.getProducts({ size: 1000 }),
  });

  const filteredItems = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const updateCount = (productId: string, delta: number, currentBalance: number) => {
    setCounts(prev => {
      const current = prev[productId] ?? currentBalance;
      return { ...prev, [productId]: Math.max(0, current + delta) };
    });
  };

  const setExactCount = (productId: string, value: number) => {
    setCounts(prev => ({ ...prev, [productId]: Math.max(0, value) }));
  };

  // Count how many items were changed
  const changedItems = Object.entries(counts).filter(([productId, qty]) => {
    const balance = stock.find(s => s.productId === productId)?.quantity ?? 0;
    return qty !== balance;
  });

  const auditMutation = useMutation({
    mutationFn: async () => {
      if (changedItems.length === 0) {
        navigate('/inventory');
        return;
      }

      setSaveProgress({ done: 0, total: changedItems.length });
      const errors: string[] = [];

      for (let i = 0; i < changedItems.length; i++) {
        const [productId, targetQty] = changedItems[i];
        const currentQty = stock.find(s => s.productId === productId)?.quantity ?? 0;
        try {
          await inventoryApi.adjustBalance({
            productId,
            targetQuantity: targetQty,
            currentQuantity: currentQty,
            reason: 'РРЅРІРµРЅС‚Р°СЂРёР·Р°С†РёСЏ',
          });
        } catch (e: any) {
          const name = products.find(p => p.id === productId)?.name || productId;
          errors.push(`${name}: ${e?.response?.data?.message || e.message}`);
        }
        setSaveProgress({ done: i + 1, total: changedItems.length });
      }

      if (errors.length > 0) {
        throw new Error(`РћС€РёР±РєРё РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё:\n${errors.join('\n')}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setSaveProgress(null);
      navigate('/inventory');
    },
    onError: (e: any) => {
      setSaveProgress(null);
      alert(e.message || 'РћС€РёР±РєР° РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё РёРЅРІРµРЅС‚Р°СЂРёР·Р°С†РёРё');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }}
         className="fade-in">
         
      {/* в”Ђв”Ђ HEADER в”Ђв”Ђ */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-secondary border-0" 
            style={{ width: 36, height: 36, padding: 0, borderRadius: 10 }}
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Р РµРІРёР·РёСЏ СЃРєР»Р°РґР°
            </h1>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3, display: 'block' }}>
              РђРєС‚РёРІРЅС‹Р№ СЂРµР¶РёРј РёРЅРІРµРЅС‚Р°СЂРёР·Р°С†РёРё
            </span>
          </div>
        </div>

        {changedItems.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            background: '#FFF8EB',
            border: '1px solid #F59E0B40',
            borderRadius: 10,
          }}>
            <AlertTriangle size={13} color="#F59E0B" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>
              РР·РјРµРЅРµРЅРѕ: {changedItems.length} РїРѕР·.
            </span>
          </div>
        )}
      </div>

      {/* в”Ђв”Ђ SEARCH в”Ђв”Ђ */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="РџРѕРёСЃРє РїРѕ РЅР°Р·РІР°РЅРёСЋ РёР»Рё Р°СЂС‚РёРєСѓР»Сѓ..."
          className="input input-lg"
          style={{ paddingLeft: 40, borderRadius: 12 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* в”Ђв”Ђ LIST в”Ђв”Ђ */}
      <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }} className="no-scrollbar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stockLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60, opacity: 0.2 }}>
                <RefreshCw size={32} className="spin" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, opacity: 0.15, gap: 12 }}>
                <Package size={48} strokeWidth={1} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>РўРѕРІР°СЂС‹ РЅРµ РЅР°Р№РґРµРЅС‹</span>
              </div>
            ) : (
              filteredItems.map(item => {
                const balance = stock.find(s => s.productId === item.id)?.quantity ?? 0;
                const currentCount = counts[item.id] ?? balance;
                const diff = currentCount - balance;
                const isChanged = diff !== 0;

                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      border: isChanged ? '1px solid #F59E0B40' : '1px solid var(--color-border)',
                      background: isChanged ? '#FFFBEB' : 'white',
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
                      <Package size={20} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }} className="truncate">{item.name}</p>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginTop: 2 }}>{item.sku || 'N/A'}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <div style={{ textAlign: 'right', minWidth: 60 }}>
                          <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>РЎРёСЃС‚РµРјР°</p>
                          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 1 }}>{balance}</p>
                       </div>

                       <div style={{ height: 24, width: 1, background: 'var(--color-border)' }} />

                       <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-bg-sunken)', padding: 4, borderRadius: 10, border: '1px solid var(--color-border)' }}>
                          <button 
                            onClick={() => updateCount(item.id, -1, balance)}
                            className="btn btn-secondary" style={{ width: 32, height: 32, padding: 0, minHeight: 0, borderRadius: 8 }}
                          >
                             <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={currentCount}
                            onChange={e => setExactCount(item.id, parseInt(e.target.value) || 0)}
                            style={{
                              width: 48, textAlign: 'center',
                              fontSize: 16, fontWeight: 900,
                              color: 'var(--color-text-primary)',
                              border: 0, background: 'transparent',
                              outline: 'none',
                            }}
                          />
                          <button 
                            onClick={() => updateCount(item.id, 1, balance)}
                            className="btn btn-secondary" style={{ width: 32, height: 32, padding: 0, minHeight: 0, borderRadius: 8 }}
                          >
                             <Plus size={14} />
                          </button>
                       </div>

                       <div style={{ width: 56, textAlign: 'right' }}>
                          <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Р Р°Р·РЅРёС†Р°</p>
                          <p style={{ 
                            fontSize: 14, fontWeight: 900, marginTop: 1,
                            color: diff > 0 ? 'var(--color-success)' : diff < 0 ? 'var(--color-error)' : 'var(--color-text-tertiary)'
                          }}>
                            {diff > 0 ? `+${diff}` : diff}
                          </p>
                       </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: 12, borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {saveProgress ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' }}>
              <RefreshCw size={16} className="spin" color="var(--color-brand)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-brand)' }}>
                РЎРѕС…СЂР°РЅРµРЅРёРµ {saveProgress.done}/{saveProgress.total}...
              </span>
              <div style={{ flex: 1, maxWidth: 200, height: 6, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: 'var(--color-brand)',
                  width: `${(saveProgress.done / saveProgress.total) * 100}%`,
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          ) : (
            <>
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                {changedItems.length === 0 ? 'РР·РјРµРЅРµРЅРёР№ РЅРµС‚' : `${changedItems.length} РїРѕР·. РёР·РјРµРЅРµРЅРѕ`}
              </span>
              <button 
                onClick={() => auditMutation.mutate()}
                disabled={auditMutation.isPending}
                className="btn btn-primary"
                style={{ height: 48, padding: '0 32px', borderRadius: 14, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 8px 20px rgba(61,122,94,0.3)' }}
              >
                <CheckCircle2 size={18} style={{ marginRight: 8 }} />
                {changedItems.length === 0 ? 'Р—Р°РєСЂС‹С‚СЊ Р±РµР· РёР·РјРµРЅРµРЅРёР№' : 'РЎРѕС…СЂР°РЅРёС‚СЊ СЂРµРІРёР·РёСЋ'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
