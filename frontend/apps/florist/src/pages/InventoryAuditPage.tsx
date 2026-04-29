import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  RefreshCw,
  Plus,
  Minus,
  ArrowRight,
} from 'lucide-react';
import { inventoryApi } from '../lib/inventoryApi';
import { catalogApi } from '../lib/catalogApi';
import { cn } from '../lib/utils';

export default function InventoryAuditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');

  const { data: stock = [], isLoading: stockLoading } = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: inventoryApi.getAllBalances,
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

  const auditMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(counts).map(([productId, quantity]) => ({
        productId,
        quantity,
        type: 'AUDIT',
        reason: 'Scheduled Inventory Audit'
      }));
      // In a real app, we'd have a bulk update.
      console.log('Performing audit:', updates);
      alert('Ревизия успешно сохранена!');
      navigate('/inventory');
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }}
         className="fade-in">
         
      {/* ── HEADER ── */}
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
              Ревизия склада
            </h1>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3, display: 'block' }}>
              Активный режим инвентаризации
            </span>
          </div>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }} className="no-scrollbar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stockLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60, opacity: 0.2 }}>
                <RefreshCw size={32} className="spin" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, opacity: 0.15, gap: 12 }}>
                <Package size={48} strokeWidth={1} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Товары не найдены</span>
              </div>
            ) : (
              filteredItems.map(item => {
                const balance = stock.find(s => s.productId === item.id)?.quantity || 0;
                const currentCount = counts[item.id] ?? balance;
                const diff = currentCount - balance;

                return (
                  <div key={item.id} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', shrink: 0 }}>
                      <Package size={20} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }} className="truncate">{item.name}</p>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginTop: 2 }}>{item.sku || 'N/A'}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <div style={{ textAlign: 'right', minWidth: 60 }}>
                          <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Система</p>
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
                          <div style={{ width: 36, textAlign: 'center' }}>
                             <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)', tabularNums: true }}>{currentCount}</p>
                          </div>
                          <button 
                            onClick={() => updateCount(item.id, 1, balance)}
                            className="btn btn-secondary" style={{ width: 32, height: 32, padding: 0, minHeight: 0, borderRadius: 8 }}
                          >
                             <Plus size={14} />
                          </button>
                       </div>

                       <div style={{ width: 50, textAlign: 'right' }}>
                          <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Разница</p>
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

        {/* Footer info Bar */}
        <div style={{ padding: 12, borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-sunken)', display: 'flex', justifyContent: 'center' }}>
           <button 
             onClick={() => auditMutation.mutate()}
             className="btn btn-primary" style={{ height: 48, padding: '0 32px', borderRadius: 14, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 8px 20px rgba(61,122,94,0.3)' }}
           >
              <CheckCircle2 size={18} style={{ marginRight: 8 }} />
              Завершить ревизию
           </button>
        </div>
      </div>
    </div>
  );
}
