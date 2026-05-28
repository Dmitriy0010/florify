import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Navigation2,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  RefreshCw,
  Navigation,
  AlertCircle,
  Package,
  ChevronDown,
  ChevronUp,
  Truck,
  Zap,
} from 'lucide-react';
import { deliveryApi } from '../lib/deliveryApi';
import type { DeliveryTask } from '../lib/deliveryApi';
import { ordersApi } from '../lib/ordersApi';
import type { OrderDetail } from '../lib/types';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export default function DeliveriesPage() {
  const qc = useQueryClient();
  const myId = useAuthStore(state => state.userId);

  // Load free tasks
  const { data: freeTasks = [], isLoading: freeLoading } = useQuery({
    queryKey: ['delivery', 'free'],
    queryFn: () => deliveryApi.getFreeTasks(),
    refetchInterval: 15000,
  });

  // Load my tasks
  const { data: myTasks = [], isLoading: myLoading } = useQuery({
    queryKey: ['delivery', 'my'],
    queryFn: () => deliveryApi.getMyTasks(),
    refetchInterval: 10000,
  });

  const activeMyTasks = myTasks.filter((t: DeliveryTask) =>
    t.status !== 'DELIVERED' && t.status !== 'FAILED' && t.status !== 'CANCELLED'
  );

  const assignMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!myId) throw new Error('Not authenticated');
      return deliveryApi.assignCourier(taskId, myId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery'] });
      toast.success('Доставка принята!');
    },
    onError: (e: any) => toast.error('Ошибка: ' + e.message),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ taskId, status, reason }: { taskId: string; status: string; reason?: string }) => {
      return deliveryApi.updateStatus(taskId, status, reason);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['delivery'] });
      if (variables.status === 'DELIVERED') {
        toast.success('🎉 Доставка выполнена!');
      } else if (variables.status === 'PICKED_UP') {
        toast.success('Заказ забран, в пути к клиенту');
      } else {
        toast.success('Статус обновлён');
      }
    },
    onError: (e: any) => toast.error('Ошибка: ' + e.message),
  });

  const isLoading = freeLoading || myLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }}
         className="fade-in">

      {/* ── HEADER STATS ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        flexShrink: 0,
      }}>
        <StatMini
          label="Мои"
          value={activeMyTasks.length}
          color="#7C3AED"
          icon={<Navigation2 size={14} />}
        />
        <StatMini
          label="Свободные"
          value={freeTasks.length}
          color="#3B82F6"
          icon={<Package size={14} />}
        />
        <StatMini
          label="В пути"
          value={activeMyTasks.filter(t => t.status === 'PICKED_UP').length}
          color="#10B981"
          icon={<Truck size={14} />}
        />
      </div>

      {/* ── TASK LIST ── */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'var(--color-brand-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RefreshCw size={24} className="spin" color="var(--color-brand)" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Загрузка доставок...
            </span>
          </div>
        ) : activeMyTasks.length === 0 && freeTasks.length === 0 ? (
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
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Доставок пока нет
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                Новые задачи появятся автоматически
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
            {/* My Active Tasks */}
            {activeMyTasks.length > 0 && (
              <>
                <SectionHeader label="Мои доставки" count={activeMyTasks.length} color="#7C3AED" />
                {activeMyTasks.map((task: DeliveryTask) => (
                  <DeliveryCard
                    key={task.id}
                    task={task}
                    onStatusUpdate={(status, reason) => statusMutation.mutate({ taskId: task.id, status, reason })}
                    isWorking={statusMutation.isPending && statusMutation.variables?.taskId === task.id}
                  />
                ))}
              </>
            )}

            {/* Free Tasks */}
            {freeTasks.length > 0 && (
              <>
                <SectionHeader label="Свободные доставки" count={freeTasks.length} color="#3B82F6" />
                {freeTasks.map((task: DeliveryTask) => (
                  <DeliveryCard
                    key={task.id}
                    task={task}
                    onAssign={() => assignMutation.mutate(task.id)}
                    isWorking={assignMutation.isPending && assignMutation.variables === task.id}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Stat Mini Card ────────────────────── */
function StatMini({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ── Section Header ────────────────────── */
function SectionHeader({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px' }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 20, height: 20, borderRadius: 100,
        background: `${color}18`, color: color,
        fontSize: 11, fontWeight: 800, padding: '0 6px',
      }}>
        {count}
      </span>
    </div>
  );
}

/* ── Delivery Card ─────────────────────── */
function DeliveryCard({ task, onAssign, onStatusUpdate, isWorking }: {
  task: DeliveryTask;
  onAssign?: () => void;
  onStatusUpdate?: (status: string, reason?: string) => void;
  isWorking?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const isCreated = task.status === 'CREATED';
  const isAssigned = task.status === 'ASSIGNED';
  const isPickedUp = task.status === 'PICKED_UP';

  // Fetch Order details for composition and customer info
  const { data: order } = useQuery<OrderDetail>({
    queryKey: ['orders', task.orderId],
    queryFn: () => ordersApi.getById(task.orderId),
  });

  const getBadgeClass = () => {
    if (isCreated) return 'badge badge-new';
    if (isAssigned) return 'badge badge-assigned';
    if (isPickedUp) return 'badge badge-pickedup';
    return 'badge badge-delivered';
  };

  const getStatusText = () => {
    if (isCreated) return 'Ждёт курьера';
    if (isAssigned) return 'Назначен';
    if (isPickedUp) return 'В пути';
    return task.status;
  };

  const getCardClass = () => {
    let cls = 'delivery-card';
    if (isPickedUp) cls += ' pickedup';
    if (isAssigned) cls += ' active-task';
    return cls;
  };

  return (
    <div className={getCardClass()}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Top Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                #{order ? (order.orderNumber || order.id.slice(0, 8)) : task.orderId.slice(0, 8)}
              </h3>
              <span className={getBadgeClass()}>
                {getStatusText()}
              </span>
            </div>
            {order && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                  {order.items?.length || 0} тов.
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--color-text-tertiary)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {(order.finalAmount || 0).toLocaleString('ru-RU')} ₽
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--color-text-tertiary)' }} />
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: order.isPaid ? 'var(--color-success)' : 'var(--color-warning)',
                }}>
                  {order.isPaid ? '✓ Оплачено' : '₽ При получении'}
                </span>
              </div>
            )}
          </div>
          {isPickedUp && (
            <div style={{
              padding: '4px 10px', borderRadius: 8,
              background: 'rgba(139, 92, 246, 0.12)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Zap size={12} color="#8B5CF6" />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase' }}>В пути</span>
            </div>
          )}
        </div>

        {/* Address */}
        <div style={{
          background: isPickedUp ? 'rgba(139, 92, 246, 0.06)' : 'var(--color-bg-elevated)',
          padding: 14, borderRadius: 14,
          border: `1px solid ${isPickedUp ? 'rgba(139, 92, 246, 0.15)' : 'var(--color-border)'}`,
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: isPickedUp ? 'rgba(139, 92, 246, 0.12)' : 'var(--color-bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isPickedUp ? '#8B5CF6' : 'var(--color-text-secondary)',
            flexShrink: 0,
            border: `1px solid ${isPickedUp ? 'rgba(139, 92, 246, 0.2)' : 'var(--color-border)'}`,
          }}>
            <MapPin size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 10, fontWeight: 700,
              color: isPickedUp ? '#8B5CF6' : 'var(--color-text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Адрес доставки
            </p>
            <p style={{
              fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)',
              marginTop: 4, lineHeight: 1.35,
            }}>
              {task.deliveryAddress}
            </p>
          </div>
          <button
            onClick={() => {
              const url = `https://yandex.ru/maps/?text=${encodeURIComponent(task.deliveryAddress)}`;
              window.open(url, '_blank');
            }}
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#3B82F6', cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            <Navigation size={18} fill="#3B82F6" />
          </button>
        </div>

        {/* Customer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-tertiary)',
            }}>
              <Phone size={14} />
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                {order ? (order.customerName || order.guestName || 'Клиент') : '...'}
              </span>
              {order && (order.customerPhone || order.guestPhone) && (
                <a
                  href={`tel:${order.customerPhone || order.guestPhone}`}
                  style={{ display: 'block', fontSize: 11, color: 'var(--color-brand)', fontWeight: 600, textDecoration: 'none', marginTop: 1 }}
                >
                  {order.customerPhone || order.guestPhone}
                </a>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            <Clock size={12} />
            <span style={{ fontWeight: 600 }}>{task.slotId ? 'По времени' : 'ASAP'}</span>
          </div>
        </div>

        {/* Expandable order composition */}
        {order && order.items && order.items.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '10px 14px',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 12, cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                fontSize: 12, fontWeight: 700,
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Package size={14} />
                Состав заказа ({order.items.length} поз.)
              </span>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded && (
              <div className="fade-in" style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: idx < (order.items?.length || 0) - 1 ? '1px solid var(--color-border)' : 'none',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {item.productName || 'Товар'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)',
                        background: 'var(--color-bg-surface)', padding: '2px 8px', borderRadius: 6,
                      }}>
                        ×{item.quantity}
                      </span>
                      {item.lineTotal != null && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                          {item.lineTotal.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {order.comment && (
                  <div style={{
                    padding: '10px 14px',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: 12, color: 'var(--color-text-tertiary)', fontStyle: 'italic',
                  }}>
                    💬 {order.comment}
                  </div>
                )}
                {order.deliveryComment && (
                  <div style={{
                    padding: '10px 14px',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: 12, color: 'var(--color-warning)', fontWeight: 600,
                  }}>
                    📌 {order.deliveryComment}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        padding: 14,
        borderTop: `1px solid ${isPickedUp ? 'rgba(139,92,246,0.15)' : 'var(--color-border)'}`,
        background: isPickedUp ? 'rgba(139,92,246,0.03)' : 'transparent',
      }}>
        {isCreated && onAssign && (
          <button
            disabled={isWorking}
            onClick={onAssign}
            style={{
              width: '100%', height: 52,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white', border: 0, borderRadius: 14,
              fontSize: 14, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: isWorking ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {isWorking ? <RefreshCw className="spin" size={18} /> : <>
              <Truck size={18} /> Взять доставку
            </>}
          </button>
        )}

        {isAssigned && onStatusUpdate && (
          <button
            disabled={isWorking}
            onClick={() => onStatusUpdate('PICKED_UP')}
            style={{
              width: '100%', height: 52,
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: 'white', border: 0, borderRadius: 14,
              fontSize: 14, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: isWorking ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {isWorking ? <RefreshCw className="spin" size={18} /> : <>
              <Package size={18} /> Забрал заказ
            </>}
          </button>
        )}

        {isPickedUp && onStatusUpdate && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              disabled={isWorking}
              onClick={() => onStatusUpdate('DELIVERED')}
              style={{
                flex: 1, height: 52,
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: 'white', border: 0, borderRadius: 14,
                fontSize: 14, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.04em',
                cursor: isWorking ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {isWorking ? <RefreshCw className="spin" size={18} /> : <>
                <CheckCircle2 size={18} /> Доставлено
              </>}
            </button>
            <button
              disabled={isWorking}
              onClick={() => {
                const reason = prompt('Причина недоставки?');
                if (reason) onStatusUpdate('FAILED', reason);
              }}
              style={{
                width: 52, height: 52,
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              <AlertCircle size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
