import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Package,
  Navigation2,
} from 'lucide-react';
import { deliveryApi } from '../lib/deliveryApi';
import type { DeliveryTask } from '../lib/deliveryApi';
import { ordersApi } from '../lib/ordersApi';
import type { OrderDetail } from '../lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function HistoryPage() {
  const { data: myTasks = [], isLoading } = useQuery({
    queryKey: ['delivery', 'my'],
    queryFn: () => deliveryApi.getMyTasks(),
  });

  const completedTasks = myTasks.filter((t: DeliveryTask) =>
    t.status === 'DELIVERED' || t.status === 'FAILED'
  );

  const deliveredCount = completedTasks.filter(t => t.status === 'DELIVERED').length;
  const failedCount = completedTasks.filter(t => t.status === 'FAILED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }}
         className="fade-in">

      {/* Header */}
      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16, padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-secondary)',
          }}>
            <Clock size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              История
            </h1>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Завершённые доставки
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-success)', fontVariantNumeric: 'tabular-nums' }}>{deliveredCount}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Успешно</div>
          </div>
          <div style={{ width: 1, background: 'var(--color-border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-error)', fontVariantNumeric: 'tabular-nums' }}>{failedCount}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Неудачно</div>
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="shimmer" style={{ width: '100%', height: 120, borderRadius: 16 }} />
          </div>
        ) : completedTasks.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 60, gap: 16,
          }}>
            <div className="float" style={{
              width: 80, height: 80, borderRadius: 24,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Navigation2 size={36} strokeWidth={1.5} color="var(--color-text-tertiary)" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-tertiary)' }}>
              Нет завершённых доставок
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
            {completedTasks.map((task: DeliveryTask) => (
              <HistoryCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ task }: { task: DeliveryTask }) {
  const isDelivered = task.status === 'DELIVERED';

  const { data: order } = useQuery<OrderDetail>({
    queryKey: ['orders', task.orderId],
    queryFn: () => ordersApi.getById(task.orderId),
  });

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      padding: 16,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: isDelivered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isDelivered
              ? <CheckCircle2 size={16} color="#10B981" />
              : <XCircle size={16} color="#EF4444" />
            }
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              #{order ? (order.orderNumber || order.id.slice(0, 8)) : task.orderId.slice(0, 8)}
            </span>
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 700,
              color: isDelivered ? 'var(--color-success)' : 'var(--color-error)',
            }}>
              {isDelivered ? 'Доставлено' : 'Не доставлено'}
            </span>
          </div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
          {task.actualDeliveredAt
            ? format(new Date(task.actualDeliveredAt), 'd MMM, HH:mm', { locale: ru })
            : format(new Date(task.updatedAt), 'd MMM, HH:mm', { locale: ru })
          }
        </span>
      </div>

      {/* Address */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MapPin size={14} color="var(--color-text-tertiary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
          {task.deliveryAddress}
        </span>
      </div>

      {/* Order info */}
      {order && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={14} color="var(--color-text-tertiary)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            {order.items?.length || 0} тов. — {(order.finalAmount || 0).toLocaleString('ru-RU')} ₽
          </span>
        </div>
      )}

      {/* Failure reason */}
      {task.failureReason && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.12)',
          borderRadius: 10,
          fontSize: 12, color: 'var(--color-error)', fontWeight: 600,
        }}>
          Причина: {task.failureReason}
        </div>
      )}
    </div>
  );
}
