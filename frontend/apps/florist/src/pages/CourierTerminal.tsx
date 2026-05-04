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
  User,
  AlertCircle
} from 'lucide-react';
import { deliveryApi, DeliveryTask } from '../lib/deliveryApi';
import { ordersApi } from '../lib/ordersApi';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CourierTerminal() {
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

  // Filter out DELIVERED/FAILED from myTasks to show active
  const activeMyTasks = myTasks.filter((t: DeliveryTask) => t.status !== 'DELIVERED' && t.status !== 'FAILED' && t.status !== 'CANCELLED');
  const allTasks = [...activeMyTasks, ...freeTasks];

  const assignMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!myId) throw new Error('Not authenticated');
      return deliveryApi.assignCourier(taskId, myId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery'] });
      toast.success('Задача взята в работу');
    },
    onError: (e: any) => toast.error('Ошибка: ' + e.message)
  });

  const statusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      return deliveryApi.updateStatus(taskId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery'] });
      toast.success('Статус обновлен');
    },
    onError: (e: any) => toast.error('Ошибка: ' + e.message)
  });

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
               <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Мои активные:</span>
               <span style={{ fontSize: 11, fontWeight: 800, color: '#8B5CF6' }}>{activeMyTasks.length}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
           <div style={{ padding: '6px 12px', background: 'var(--color-bg-sunken)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Смена открыта
           </div>
        </div>
      </div>

      {/* ── LIST ── */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
        {freeLoading || myLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 100, opacity: 0.1 }}>
            <RefreshCw size={48} className="spin" />
          </div>
        ) : allTasks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, opacity: 0.2, gap: 12 }}>
            <Truck size={64} strokeWidth={1} />
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Доставок пока нет</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 100 }}>
            {/* Show My Tasks First */}
            {activeMyTasks.length > 0 && (
              <>
                <div style={{ padding: '0 8px', fontSize: 11, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Мои задачи</div>
                {activeMyTasks.map((task: DeliveryTask) => (
                  <CourierTaskCard 
                    key={task.id} 
                    task={task} 
                    onStatusUpdate={(status) => statusMutation.mutate({ taskId: task.id, status })}
                    isWorking={statusMutation.isPending && statusMutation.variables?.taskId === task.id}
                  />
                ))}
              </>
            )}

            {/* Show Free Tasks */}
            {freeTasks.length > 0 && (
              <>
                <div style={{ padding: '0 8px', fontSize: 11, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 12 }}>Свободные задачи</div>
                {freeTasks.map((task: DeliveryTask) => (
                  <CourierTaskCard 
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

function CourierTaskCard({ task, onAssign, onStatusUpdate, isWorking }: { 
  task: DeliveryTask; 
  onAssign?: () => void;
  onStatusUpdate?: (s: string) => void;
  isWorking?: boolean;
}) {
  const isCreated = task.status === 'CREATED';
  const isAssigned = task.status === 'ASSIGNED';
  const isPickedUp = task.status === 'PICKED_UP';

  // Fetch Order details for this task to show customer info
  const { data: order } = useQuery({
    queryKey: ['orders', task.orderId],
    queryFn: () => ordersApi.getById(task.orderId),
  });

  const getBadgeStyle = () => {
    if (isCreated) return 'badge-new';
    if (isAssigned) return 'badge-ready'; // yellow
    if (isPickedUp) return 'badge-delivery'; // purple/blue
    return 'badge-done';
  };

  const getStatusText = () => {
    if (isCreated) return 'Ждет курьера';
    if (isAssigned) return 'Идет к флористу';
    if (isPickedUp) return 'В пути к клиенту';
    return task.status;
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-primary)' }}>
                  #{order ? (order.orderNumber || order.id.slice(0, 8)) : task.orderId.slice(0,8)}
                </h3>
                <span className={cn("badge", getBadgeStyle())}>
                   {getStatusText()}
                </span>
             </div>
             {order && (
               <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 4 }}>
                  {order.items?.length || 0} тов. • {(order.finalAmount || 0).toLocaleString()} ₽
               </p>
             )}
          </div>
          <div style={{ textAlign: 'right' }}>
             <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Слот</p>
             <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 2 }}>
                {task.slotId ? 'По времени' : 'Как можно скорее'}
             </p>
          </div>
        </div>

        {/* Address Card */}
        <div style={{ 
          background: isPickedUp ? '#F5F3FF' : 'var(--color-bg-sunken)', 
          padding: 14, borderRadius: 14, 
          border: `1px solid ${isPickedUp ? '#E0DBFA' : 'var(--color-border)'}`,
          display: 'flex', gap: 12
        }}>
           <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPickedUp ? '#8B5CF6' : 'var(--color-text-primary)', shrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <MapPin size={18} />
           </div>
           <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: isPickedUp ? '#8B5CF6' : 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Адрес получателя</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 4, lineHeight: 1.3 }}>{task.deliveryAddress}</p>
           </div>
           <button 
             onClick={() => window.open(`yandexmaps://maps.yandex.ru/?text=${encodeURIComponent(task.deliveryAddress)}`)}
             style={{ alignSelf: 'center', width: 44, height: 44, borderRadius: 12, background: 'white', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', cursor: 'pointer' }}>
              <Navigation size={18} fill="#3B82F6" />
           </button>
        </div>

        {/* Customer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                 <Phone size={14} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                {order ? (order.customerPhone || order.guestPhone || 'Телефон не указан') : '...'}
              </span>
           </div>
           <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>
              {order ? (order.customerName || order.guestName || 'Обычный клиент') : '...'}
           </div>
        </div>
      </div>

      {/* Button Action */}
      <div style={{ padding: 12, borderTop: `1px solid ${isPickedUp ? '#E0DBFA' : 'var(--color-border)'}`, background: isPickedUp ? '#F5F3FF' : 'white' }}>
         {isCreated && onAssign && (
           <button 
             disabled={isWorking}
             onClick={onAssign}
             className="btn" 
             style={{ width: '100%', height: 48, background: '#10B981', color: 'white', border: 0, borderRadius: 12, fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}
           >
              {isWorking ? <RefreshCw className="spin" size={18} /> : 'Взять доставку'}
           </button>
         )}
         
         {isAssigned && onStatusUpdate && (
           <button 
             disabled={isWorking}
             onClick={() => onStatusUpdate('PICKED_UP')}
             className="btn" 
             style={{ width: '100%', height: 48, background: '#F59E0B', color: 'white', border: 0, borderRadius: 12, fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}
           >
              {isWorking ? <RefreshCw className="spin" size={18} /> : 'Забрал заказ у флориста'}
           </button>
         )}

         {isPickedUp && onStatusUpdate && (
           <div style={{ display: 'flex', gap: 8 }}>
             <button 
               disabled={isWorking}
               onClick={() => onStatusUpdate('DELIVERED')}
               className="btn" 
               style={{ flex: 1, height: 48, background: '#8B5CF6', color: 'white', border: 0, borderRadius: 12, fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}
             >
                {isWorking ? <RefreshCw className="spin" size={18} /> : <><CheckCircle2 size={18} style={{ marginRight: 8 }} /> Доставлен</>}
             </button>
             <button 
               disabled={isWorking}
               onClick={() => {
                 const reason = prompt("Причина отмены/недоставки?");
                 if (reason) onStatusUpdate('FAILED');
               }}
               className="btn" 
               style={{ width: 48, height: 48, background: '#FEE2E2', color: '#DC2626', border: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             >
                <AlertCircle size={20} />
             </button>
           </div>
         )}
      </div>
    </div>
  );
}
