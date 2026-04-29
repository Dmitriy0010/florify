import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Truck,
  MapPin,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Navigation,
  Navigation2,
} from 'lucide-react';
import { ordersApi } from '../lib/ordersApi';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function CourierTerminal() {
  const qc = useQueryClient();

  // Load orders that need delivery
  const { data: delivering = [], isLoading: delLoading } = useQuery({
    queryKey: ['orders', 'status', 'OUT_FOR_DELIVERY'],
    queryFn: () => ordersApi.getKanban('OUT_FOR_DELIVERY' as any),
    refetchInterval: 15000,
  });

  const { data: readyForDel = [], isLoading: readyLoading } = useQuery({
    queryKey: ['orders', 'status', 'READY_DELIVERY'], // Custom filter for READY + type DELIVERY
    queryFn: async () => {
      const allReady = await ordersApi.getKanban('READY' as any);
      return allReady.filter((o: any) => o.type === 'DELIVERY');
    },
    refetchInterval: 15000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      if (status === 'OUT_FOR_DELIVERY') return ordersApi.takeOrder(orderId, 'CUR-001' as any); // Mock courier ID
      if (status === 'COMPLETED') return ordersApi.markReady(orderId); // Adjust based on real API
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const orders = [...readyForDel, ...delivering].sort((a, b) => 
     (a.status === 'OUT_FOR_DELIVERY' ? 0 : 1) - (b.status === 'OUT_FOR_DELIVERY' ? 0 : 1)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }}
         className="fade-in">

      {/* ── HEADER ── */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: '#8B5CF6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Navigation2 size={18} fill="currentColor" />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>Доставка</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
               <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Активных:</span>
               <span style={{ fontSize: 11, fontWeight: 800, color: '#8B5CF6' }}>{orders.length}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
           <div style={{ padding: '6px 12px', background: 'var(--color-bg-sunken)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Смена открыта • 14:00
           </div>
        </div>
      </div>

      {/* ── LIST ── */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
        {delLoading || readyLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 100, opacity: 0.1 }}>
            <RefreshCw size={48} className="spin" />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, opacity: 0.2, gap: 12 }}>
            <Truck size={64} strokeWidth={1} />
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Доставок пока нет</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 100 }}>
            {orders.map(order => (
              <CourierOrderCard key={order.id} order={order} onAction={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourierOrderCard({ order, onAction }: { order: any; onAction: () => void }) {
  const isDelivering = order.status === 'OUT_FOR_DELIVERY';
  
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)' }}>#{order.orderNumber || '001'}</h3>
                <span className={cn("badge", isDelivering ? 'badge-delivery' : 'badge-ready')}>
                   {isDelivering ? 'В пути' : 'Готов к отправке'}
                </span>
             </div>
             <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 4 }}>
                {order.items?.length || 0} тов. • {(order.finalAmount || 0).toLocaleString()} ₽
             </p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Время доставки</p>
             <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 2 }}>{order.deliverySlot || 'Как можно скорее'}</p>
          </div>
        </div>

        {/* Address Card */}
        <div style={{ 
          background: isDelivering ? '#F5F3FF' : 'var(--color-bg-sunken)', 
          padding: 14, borderRadius: 14, 
          border: `1px solid ${isDelivering ? '#E0DBFA' : 'var(--color-border)'}`,
          display: 'flex', gap: 12
        }}>
           <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDelivering ? '#8B5CF6' : 'var(--color-text-primary)', shrink: 0, shadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <MapPin size={18} />
           </div>
           <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: isDelivering ? '#8B5CF6' : 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Адрес получателя</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 4, lineHeight: 1.3 }}>{order.deliveryAddress || 'Центральный район, ул. Ленина 42, кв 15'}</p>
           </div>
           <button style={{ alignSelf: 'center', width: 44, height: 44, borderRadius: 12, background: 'white', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', cursor: 'pointer' }}>
              <Navigation size={18} fill="#3B82F6" />
           </button>
        </div>

        {/* Customer & Items */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                 <Phone size={14} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>+7 (999) 123-45-67</span>
           </div>
           <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>
              {order.customerName || 'Клиент'}
           </div>
        </div>
      </div>

      {/* Button Action */}
      <div style={{ padding: 12, borderTop: `1px solid ${isDelivering ? '#E0DBFA' : 'var(--color-border)'}`, background: isDelivering ? '#F5F3FF' : 'white' }}>
         {isDelivering ? (
           <button 
             className="btn" 
             style={{ width: '100%', height: 48, background: '#10B981', color: 'white', border: 0, borderRadius: 12, fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}
           >
              <CheckCircle2 size={18} style={{ marginRight: 8 }} /> Доставлен заказ
           </button>
         ) : (
           <button 
             className="btn" 
             style={{ width: '100%', height: 48, background: '#8B5CF6', color: 'white', border: 0, borderRadius: 12, fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}
           >
              Взять доставку <ArrowRight size={18} style={{ marginLeft: 8 }} />
           </button>
         )}
      </div>
    </div>
  );
}
