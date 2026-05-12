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
   Package,
   Clock,
   RefreshCw,
   Box,
   Tag,
} from 'lucide-react';
import { inventoryApi } from '../lib/inventoryApi';
import { WriteOffModal } from '../components/WriteOffModal';
import { getMediaUrl } from '../lib/utils';
import { useStoreStore } from '../store/useStoreStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function InventoryDetailPage() {
   const { productId } = useParams<{ productId: string }>();
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const [isWriteOffOpen, setWriteOffOpen] = useState(false);
   const { currentStoreId } = useStoreStore();

   // Use enhanced balance from /balance/all — has name, imageUrl, sku
   const allBalancesQuery = useQuery({
      queryKey: ['inventory', 'all', currentStoreId],
      queryFn: () => inventoryApi.getAllBalances(currentStoreId),
      enabled: Boolean(productId),
      staleTime: 10_000,
   });

   const batchesQuery = useQuery({
      queryKey: ['inventory', 'batches', productId],
      queryFn: () => inventoryApi.getBatches(productId ?? ''),
      enabled: Boolean(productId),
      refetchInterval: 30_000,
   });

   // Transactions come back as PagedResult<StockTransaction> with .content field
   const txQuery = useQuery({
      queryKey: ['inventory', 'tx', productId],
      queryFn: async () => {
         const raw = await inventoryApi.getTransactions(productId ?? '');
         // Backend returns PagedResult<T> with .content, or plain array
         if (Array.isArray(raw)) return raw;
         const paged = raw as any;
         return paged?.content ?? paged?.data ?? [];
      },
      enabled: Boolean(productId),
      refetchInterval: 30_000,
   });

   const isLoading = allBalancesQuery.isLoading;

   if (isLoading) return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.2 }}>
         <RefreshCw size={32} className="spin" />
      </div>
   );

   // Find our product in the full list
   const data = allBalancesQuery.data?.find(b => b.productId === productId);
   const qty = Number(data?.quantity ?? 0);
   const avgCost = Number(data?.averageCost ?? 0);
   const productName = data?.name || data?.productName || 'Детали товара';
   const imgUrl = data?.imageUrl ? (data.imageUrl.startsWith('http') ? data.imageUrl : getMediaUrl(data.imageUrl)) : null;

   const transactions = txQuery.data ?? [];
   const batches = batchesQuery.data ?? [];

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
             {/* Product image */}
             <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: 'var(--color-bg-sunken)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {imgUrl
                 ? <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 : <Package size={20} color="var(--color-text-tertiary)" strokeWidth={1.5} />
               }
             </div>
             <div>
               <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                 {productName}
               </h1>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                 {data?.sku && (
                   <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                     <Tag size={10} /> {data.sku}
                   </span>
                 )}
                 <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                   {data?.unit || 'шт'}
                 </span>
               </div>
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
                  <div style={{ fontSize: 48, fontWeight: 950, color: qty <= 0 ? 'var(--color-error)' : qty < 5 ? 'var(--color-warning)' : 'var(--color-text-primary)', lineHeight: 1 }}>
                     {qty}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: qty <= 0 ? 'var(--color-error)' : 'var(--color-success)', marginTop: 8 }}>
                     {qty <= 0 ? 'нет в наличии' : 'единиц в наличии'}
                  </p>
               </div>
               <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Ср. стоимость (WAC)</p>
                  <div style={{ fontSize: 48, fontWeight: 950, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                     {avgCost.toFixed(0)} <span style={{ fontSize: 18, color: 'var(--color-text-tertiary)' }}>₽</span>
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
                     <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)' }}>{batches.length}</span>
                  </div>
                  {batchesQuery.isLoading ? (
                     <div className="card" style={{ padding: 32, textAlign: 'center', opacity: 0.2 }}>
                        <RefreshCw size={20} className="spin" style={{ margin: '0 auto' }} />
                     </div>
                  ) : batches.length === 0 ? (
                     <div className="card" style={{ padding: 32, textAlign: 'center', opacity: 0.3 }}>
                        <Box size={24} style={{ marginBottom: 8, margin: '0 auto 8px' }} />
                        <p style={{ fontSize: 11, fontWeight: 700 }}>Партий не обнаружено</p>
                     </div>
                  ) : batches.map(batch => {
                     const remaining = Number(batch.quantityRemaining ?? 0);
                     const statusColor = batch.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-text-tertiary)';
                     return (
                        <div key={String(batch.id)} className="card" style={{ padding: 12, borderLeft: `3px solid ${statusColor}` }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)' }}>
                                 ID: {String(batch.id).slice(-8).toUpperCase()}
                              </span>
                              <span style={{ fontSize: 9, fontWeight: 700, color: statusColor, textTransform: 'uppercase' }}>
                                 {batch.status === 'ACTIVE' ? 'Активна' : batch.status === 'DEPLETED' ? 'Израсходована' : 'Истекла'}
                              </span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)' }}>
                                 <Calendar size={14} />
                                 <span style={{ fontSize: 12, fontWeight: 700 }}>
                                    {batch.expiresAt ? format(new Date(batch.expiresAt as any), 'dd.MM.yyyy') : 'Бессрочно'}
                                 </span>
                              </div>
                              <div>
                                 <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-text-primary)' }}>{remaining}</span>
                                 {' '}<span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{data?.unit || 'ед.'}</span>
                              </div>
                           </div>
                           {batch.unitCost && Number(batch.unitCost) > 0 && (
                              <div style={{ marginTop: 6, fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                                 Цена закупки: {Number(batch.unitCost).toFixed(2)} ₽/ед.
                              </div>
                           )}
                        </div>
                     );
                  })}
               </section>

               {/* ── HISTORY ── */}
               <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
                     <History size={14} className="text-brand" />
                     <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>История операций</h3>
                     <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)' }}>{transactions.length}</span>
                  </div>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                     {txQuery.isLoading ? (
                        <div style={{ padding: 32, textAlign: 'center', opacity: 0.2 }}>
                           <RefreshCw size={20} className="spin" style={{ margin: '0 auto' }} />
                        </div>
                     ) : transactions.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', opacity: 0.3 }}>
                           <Clock size={24} style={{ marginBottom: 8, margin: '0 auto 8px' }} />
                           <p style={{ fontSize: 11, fontWeight: 700 }}>Движений не было</p>
                        </div>
                     ) : transactions.slice(0, 20).map((tx: any, i: number) => {
                        const isInbound = tx.type === 'INBOUND';
                        const txLabel: Record<string, string> = {
                           'INBOUND': 'Приход',
                           'OUTBOUND': 'Списание (заказ)',
                           'WRITE_OFF': 'Списание (брак)',
                           'ADJUSTMENT': 'Корректировка',
                        };
                        return (
                           <div key={tx.id} style={{ 
                              padding: '10px 16px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              borderBottom: i < transactions.length - 1 ? '1px solid var(--color-border)' : 0
                           }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                 <div style={{ 
                                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                    background: isInbound ? '#ECFDF5' : '#FEF2F2',
                                    color: isInbound ? 'var(--color-success)' : 'var(--color-error)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                 }}>
                                    {isInbound ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                                 </div>
                                 <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                       {txLabel[tx.type] ?? tx.type}
                                    </p>
                                    <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>
                                       {tx.createdAt ? format(new Date(tx.createdAt), 'dd MMM HH:mm', { locale: ru }) : '—'}
                                       {tx.writeOffReason ? ` · ${tx.writeOffReason}` : ''}
                                    </p>
                                 </div>
                              </div>
                              <div style={{ 
                                 fontSize: 15, fontWeight: 900, fontVariantNumeric: 'tabular-nums',
                                 color: isInbound ? 'var(--color-success)' : 'var(--color-error)'
                              }}>
                                 {isInbound ? '+' : '−'}{Number(tx.quantity ?? 0)}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </section>

            </div>
         </div>

         <WriteOffModal
            open={isWriteOffOpen}
            onClose={() => setWriteOffOpen(false)}
            products={allBalancesQuery.data ?? []}
            defaultProductId={productId}
            onSuccess={() => {
               queryClient.invalidateQueries({ queryKey: ['inventory'] });
            }}
         />
      </div>
   );
}
