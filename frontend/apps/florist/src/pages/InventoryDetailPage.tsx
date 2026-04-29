import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
   ChevronLeft,
   Layers,
   History,
   Trash2,
   Calendar,
   ArrowDownCircle,
   ArrowUpCircle,
   Tag,
   Package,
   Clock,
   RefreshCw,
   Box,
   TrendingUp
} from 'lucide-react';
import { inventoryApi } from '../lib/inventoryApi';
import { WriteOffModal } from '../components/WriteOffModal';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function InventoryDetailPage() {
   const { productId } = useParams<{ productId: string }>();
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const [isWriteOffOpen, setWriteOffOpen] = useState(false);

   const balanceQuery = useQuery({
      queryKey: ['inventory', 'balance', productId],
      queryFn: () => inventoryApi.getBalance(productId ?? ''),
      enabled: Boolean(productId),
   });
   const batchesQuery = useQuery({
      queryKey: ['inventory', 'batches', productId],
      queryFn: () => inventoryApi.getBatches(productId ?? ''),
      enabled: Boolean(productId),
   });
   const txQuery = useQuery({
      queryKey: ['inventory', 'tx', productId],
      queryFn: () => inventoryApi.getTransactions(productId ?? ''),
      enabled: Boolean(productId),
   });
   const allProductsQuery = useQuery({
      queryKey: ['inventory', 'all'],
      queryFn: inventoryApi.getAllBalances,
   });

   if (balanceQuery.isLoading) return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.2 }}>
         <RefreshCw size={32} className="spin" />
      </div>
   );

   const data = balanceQuery.data;

   return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }} className="fade-in">
         
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
               <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }} className="truncate max-w-[200px]">
                 {data?.name || data?.productName || 'Детали товара'}
               </h1>
               <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3, display: 'block' }}>
                 Контроль складских запасов
               </span>
             </div>
           </div>
           <button 
              onClick={() => setWriteOffOpen(true)}
              className="btn btn-danger" style={{ height: 36, borderRadius: 10, fontSize: 11 }}
           >
              <Trash2 size={14} /> Списать брак
           </button>
         </div>

         <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }} className="no-scrollbar">
            
            {/* ── STATS SUMMARY ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
               <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Текущий остаток</p>
                  <div style={{ fontSize: 48, fontWeight: 950, color: 'var(--color-text-primary)', tracking: '-0.04em', lineHeight: 1 }}>
                     {data?.quantity ?? 0}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-success)', marginTop: 8 }}>единиц в наличии</p>
               </div>
               <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Ср. стоимость (WAC)</p>
                  <div style={{ fontSize: 48, fontWeight: 950, color: 'var(--color-text-primary)', tracking: '-0.04em', lineHeight: 1 }}>
                     {(data?.averageCost ?? 0).toFixed(0)} <span style={{ fontSize: 18, color: 'var(--color-text-tertiary)' }}>₽</span>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-info)', marginTop: 8 }}>себестоимость за ед.</p>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, paddingBottom: 40 }}>
               
               {/* ── BATCHES ── */}
               <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
                     <Layers size={14} className="text-brand" />
                     <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>Партии товара</h3>
                  </div>
                  {batchesQuery.data?.length === 0 ? (
                     <div className="card" style={{ padding: 32, textAlign: 'center', opacity: 0.3 }}>
                        <Box size={24} style={{ marginBottom: 8 }} />
                        <p style={{ fontSize: 11, fontWeight: 700 }}>Партий не обнаружено</p>
                     </div>
                  ) : batchesQuery.data?.map(batch => (
                     <div key={batch.id} className="card" style={{ padding: 12, borderLeftWidth: 4, borderLeftColor: 'var(--color-success)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                           <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)' }}>ID: {batch.id.slice(-8).toUpperCase()}</span>
                           <span className="badge badge-ready">Активна</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)' }}>
                              <Calendar size={14} />
                              <span style={{ fontSize: 12, fontWeight: 700 }}>{batch.expiresAt ? format(new Date(batch.expiresAt), 'dd.MM.yyyy') : 'Бессрочно'}</span>
                           </div>
                           <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-text-primary)' }}>
                              {batch.quantity} <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>ед.</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </section>

               {/* ── HISTORY ── */}
               <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
                     <History size={14} className="text-brand" />
                     <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>История операций</h3>
                  </div>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                     {txQuery.data?.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', opacity: 0.3 }}>
                           <Clock size={24} style={{ marginBottom: 8 }} />
                           <p style={{ fontSize: 11, fontWeight: 700 }}>Движений не было</p>
                        </div>
                     ) : txQuery.data?.slice(0, 8).map((tx, i) => (
                        <div key={tx.id} style={{ 
                           padding: '10px 16px', 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'space-between',
                           borderBottom: i === 7 ? 0 : '1px solid var(--color-border)'
                        }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ 
                                 width: 28, height: 28, borderRadius: 8, 
                                 background: tx.type === 'INBOUND' ? 'var(--color-status-ready-bg)' : 'var(--color-error)',
                                 color: tx.type === 'INBOUND' ? 'var(--color-status-ready)' : 'white',
                                 display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                 {tx.type === 'INBOUND' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                              </div>
                              <div>
                                 <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{tx.type === 'INBOUND' ? 'Приход' : 'Списание'}</p>
                                 <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>{format(new Date(tx.createdAt), 'dd.MM HH:mm')}</p>
                              </div>
                           </div>
                           <div style={{ 
                              fontSize: 14, fontWeight: 900, 
                              color: tx.type === 'INBOUND' ? 'var(--color-success)' : 'var(--color-error)'
                           }}>
                              {tx.type === 'INBOUND' ? '+' : '−'}{tx.quantity}
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

            </div>
         </div>

         <WriteOffModal
            open={isWriteOffOpen}
            onClose={() => setWriteOffOpen(false)}
            products={allProductsQuery.data ?? []}
            defaultProductId={productId}
            onSuccess={() => {
               queryClient.invalidateQueries({ queryKey: ['inventory'] });
               queryClient.invalidateQueries({ queryKey: ['inventory', 'balance', productId] });
               queryClient.invalidateQueries({ queryKey: ['inventory', 'tx', productId] });
            }}
         />
      </div>
   );
}
