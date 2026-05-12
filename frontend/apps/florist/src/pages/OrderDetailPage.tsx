import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  User, 
  MapPin, 
  MessageSquare, 
  Play, 
  CheckCircle2, 
  Phone,
  Package,
  Clock,
  ShoppingBag,
  CreditCard,
  RefreshCw,
  Truck,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { ordersApi } from '../lib/ordersApi';
import { deliveryApi } from '../lib/deliveryApi';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import { enqueueMutation } from '../lib/offlineQueue';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

/* ─── Next-step logic ─── */
type OrderStatus = string;

interface NextAction {
  label: string;
  targetStatus: OrderStatus;
  color: 'green' | 'blue' | 'purple' | 'dark';
  icon: React.ElementType;
}

function getNextAction(order: any, myId: string | null): NextAction | null {
  const { status, type, assignedFloristId } = order;
  const isPickup = type === 'PICKUP' || type === 'POS';
  const isDelivery = type === 'DELIVERY';
  const isMine = assignedFloristId === myId;

  switch (status) {
    case 'PENDING_STOCK':
    case 'NEW':
    case 'CONFIRMED':
      return {
        label: 'Принять в работу',
        targetStatus: 'IN_PROGRESS',
        color: 'green',
        icon: Play,
      };

    case 'IN_PROGRESS':
      if (!isMine) return null;
      return {
        label: 'Отметить готовым',
        targetStatus: 'READY',
        color: 'dark',
        icon: CheckCircle2,
      };

    case 'READY':
      if (isPickup) {
        // Pickup orders skip courier → go straight to COMPLETED
        return {
          label: 'Выдать клиенту',
          targetStatus: 'COMPLETED',
          color: 'green',
          icon: CheckCircle2,
        };
      }
      if (isDelivery) {
        return {
          label: 'Передать курьеру',
          targetStatus: 'OUT_FOR_DELIVERY',
          color: 'purple',
          icon: Truck,
        };
      }
      return {
        label: 'Завершить заказ',
        targetStatus: 'COMPLETED',
        color: 'green',
        icon: CheckCircle2,
      };

    case 'OUT_FOR_DELIVERY':
      return {
        label: 'Завершить доставку',
        targetStatus: 'COMPLETED',
        color: 'green',
        icon: CheckCircle2,
      };

    default:
      return null;
  }
}

const ACTION_COLORS: Record<string, string> = {
  green:  'background: #10B981; color: white;',
  blue:   'background: #3B82F6; color: white;',
  purple: 'background: #8B5CF6; color: white;',
  dark:   'background: #0F172A; color: white;',
};

const STATUS_MAP: Record<string, string> = {
  PENDING_STOCK:    'Новый (онлайн)',
  NEW:              'Новый',
  CONFIRMED:        'Принят',
  IN_PROGRESS:      'Сборка',
  READY:            'Готов',
  OUT_FOR_DELIVERY: 'У курьера',
  COMPLETED:        'Выполнен',
  CANCELLED:        'Отменён',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING_STOCK: 'bg-slate-50 text-slate-500 border-slate-100',
  NEW:           'bg-blue-50 text-blue-600 border-blue-100',
  CONFIRMED:     'bg-blue-50 text-blue-600 border-blue-100',
  IN_PROGRESS:   'bg-amber-50 text-amber-600 border-amber-100',
  READY:         'bg-emerald-50 text-emerald-600 border-emerald-100',
  OUT_FOR_DELIVERY: 'bg-purple-50 text-purple-600 border-purple-100',
  COMPLETED:     'bg-emerald-50 text-emerald-600 border-emerald-100',
  CANCELLED:     'bg-rose-50 text-rose-500 border-rose-100',
};

const DELIVERY_STATUS_LABELS: Record<string, string> = {
  CREATED:   'Ожидает курьера',
  ASSIGNED:  'Курьер едет',
  PICKED_UP: 'В пути к клиенту',
  DELIVERED: 'Доставлен',
  FAILED:    'Не доставлен',
  CANCELLED: 'Отменено',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const myId = useAuthStore((state) => state.userId);
  const isOnline = useOfflineStore((state) => state.isOnline);

  const { data: order, isLoading } = useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
    refetchInterval: 15_000,
  });

  const { data: deliveryTask } = useQuery({
    queryKey: ['deliveryTask', id],
    queryFn: () => deliveryApi.getTaskByOrderId(id!),
    enabled: !!id && order?.type === 'DELIVERY',
    retry: false,
  });

  /* Generic next-step mutation */
  const nextMutation = useMutation({
    mutationFn: async ({ targetStatus }: { targetStatus: OrderStatus }) => {
      if (!id) return;
      const floristId = targetStatus === 'IN_PROGRESS' ? (myId ?? undefined) : undefined;
      if (isOnline) return ordersApi.updateStatus(id, targetStatus as any, floristId);
      await enqueueMutation({ type: 'status-change', payload: { orderId: id, status: targetStatus, floristId } });
    },
    onSuccess: (_data, { targetStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'all'] });
      if (targetStatus === 'COMPLETED' || targetStatus === 'READY') {
        navigate('/orders');
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Ошибка смены статуса');
    },
  });

  /* Cancel mutation */
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      if (isOnline) return ordersApi.updateStatus(id, 'CANCELLED' as any);
      await enqueueMutation({ type: 'status-change', payload: { orderId: id, status: 'CANCELLED' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/orders');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Ошибка отмены');
    },
  });

  if (isLoading || !order) {
    return (
      <div className="flex-1 flex items-center justify-center h-full opacity-10">
        <RefreshCw className="animate-spin" size={40} />
      </div>
    );
  }

  const isPickup = order.type === 'PICKUP' || order.type === 'POS';
  const isMine = order.assignedFloristId === myId;
  const nextAction = getNextAction(order, myId);
  const isTerminal = order.status === 'COMPLETED' || order.status === 'CANCELLED';
  const isOtherFloristWorking = order.status === 'IN_PROGRESS' && !isMine;

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in relative">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="premium-btn premium-btn-outline p-2 w-10 h-10 min-w-0">
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-black uppercase tracking-tight">
                Заказ #{order.orderNumber || order.id?.slice(0, 8)}
              </h1>
              <span className={cn(
                'px-3 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm',
                STATUS_COLOR[order.status] ?? 'bg-amber-50 text-amber-600 border-amber-100'
              )}>
                {STATUS_MAP[order.status] ?? order.status}
              </span>
              {/* Order type badge */}
              <span className={cn(
                'px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border',
                isPickup ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-purple-50 text-purple-600 border-purple-100'
              )}>
                {isPickup ? 'Самовывоз' : 'Доставка'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
              Создан: {order.createdAt ? format(new Date(order.createdAt), 'd MMMM, HH:mm', { locale: ru }) : '--:--'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={20} />
          <span className="text-lg font-black text-slate-900 tracking-tighter tabular-nums">
            {order.createdAt ? format(new Date(order.createdAt), 'HH:mm') : ''}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 pb-36">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

          {/* Customer / Address / Delivery */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User size={18} className="text-emerald-600" />
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Клиент</h3>
              </div>
              {(order.guestPhone || (order as any).customerPhone) && (
                <a
                  href={`tel:${order.guestPhone ?? (order as any).customerPhone}`}
                  className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border-0 cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  <Phone size={14} />
                </a>
              )}
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">
                {order.customerName ?? order.guestName ?? 'Обычный клиент'}
              </p>
              {(order.guestPhone || (order as any).customerPhone) && (
                <p className="text-sm text-slate-500 mt-1">{order.guestPhone ?? (order as any).customerPhone}</p>
              )}
            </div>

            {/* Pickup vs Delivery block */}
            {isPickup ? (
              <div className="mt-2 p-4 bg-sky-50 rounded-xl border border-sky-100 flex items-start gap-3">
                <ShoppingBag size={18} className="text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Самовывоз</p>
                  <p className="text-sm font-bold text-sky-800">
                    Клиент заберёт заказ сам — доставка не нужна
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3">
                <div className="flex gap-3">
                  <MapPin size={18} className="text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-slate-700">
                    {order.deliveryAddress ?? (order as any).address ?? 'Адрес не указан'}
                  </p>
                </div>
                {deliveryTask && (
                  <div className="flex gap-3 items-center border-t border-slate-200 pt-3">
                    <Truck size={16} className="text-slate-400 shrink-0" />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Доставка</span>
                      <span className="text-[11px] font-black uppercase text-purple-600 px-2 py-1 bg-purple-50 rounded-md">
                        {DELIVERY_STATUS_LABELS[deliveryTask.status] ?? deliveryTask.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {order.notes && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 italic text-sm text-amber-900">
                <MessageSquare size={18} className="shrink-0 text-amber-500" />
                <span>"{order.notes}"</span>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="glass-card p-6 bg-slate-900 text-white border-0 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-400" />
              <h3 className="text-[10px] font-black uppercase text-white/50 tracking-widest">Оплата</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-4xl font-black tracking-tighter">
                {(order.finalAmount || order.totalAmount || 0).toLocaleString()}
                <span className="text-lg opacity-40"> ₽</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase border border-white/10 tracking-widest">
                  {order.paymentMethod === 'CARD'   ? 'Карта' :
                   order.paymentMethod === 'SBP'    ? 'СБП' :
                   order.paymentMethod === 'ONLINE'  ? 'Онлайн' :
                   order.paymentMethod === 'CASH'   ? 'Наличные' :
                   order.paymentMethod ?? 'Наличные'}
                </span>
                {order.isPaid ? (
                  <span className="px-3 py-1 bg-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    Оплачено ✓
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    При получении
                  </span>
                )}
              </div>
              {/* Order number for cashier */}
              {order.orderNumber && (
                <div className="flex items-center gap-2 mt-4 opacity-40">
                  <Tag size={12} />
                  <span className="text-[10px] font-mono tracking-widest">{order.orderNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-slate-400" />
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Состав заказа</h3>
            <span className="ml-auto text-[10px] font-black text-slate-300">{order.items?.length ?? 0} позиц.</span>
          </div>
          <div className="flex flex-col gap-3">
            {order.items?.map((item: any, idx: number) => (
              <div key={item.productId ?? idx} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl border border-slate-50 transition-all">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 shrink-0">
                  <ShoppingBag size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-slate-900 truncate">{item.productName ?? 'Товар'}</p>
                  {item.sku && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      АРТ: {item.sku}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">×{item.quantity}</p>
                  <p className="text-sm font-black text-emerald-600">{(item.unitPrice ?? 0).toLocaleString()} ₽</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ACTION BAR ── */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50 px-4">
        <div className="w-full max-w-lg pointer-events-auto flex flex-col gap-2">

          {/* "Another florist working" block */}
          {isOtherFloristWorking && (
            <div className="w-full py-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
              <RefreshCw size={16} className="animate-spin" />
              <span>Заказ собирает другой флорист</span>
            </div>
          )}

          {/* PRIMARY NEXT-STEP BUTTON */}
          {nextAction && !isOtherFloristWorking && (
            <button
              onClick={() => nextMutation.mutate({ targetStatus: nextAction.targetStatus })}
              disabled={nextMutation.isPending}
              className="w-full py-5 rounded-2xl text-sm font-black flex items-center justify-center gap-3 shadow-2xl border-0 transition-all active:scale-95 hover:opacity-90"
              style={{
                background:
                  nextAction.color === 'green'  ? '#10B981' :
                  nextAction.color === 'purple' ? '#8B5CF6' :
                  nextAction.color === 'blue'   ? '#3B82F6' :
                  '#0F172A',
                color: 'white',
              }}
            >
              {nextMutation.isPending
                ? <RefreshCw className="animate-spin" size={20} />
                : <nextAction.icon size={20} fill={nextAction.color === 'green' || nextAction.color === 'dark' ? 'currentColor' : 'none'} />
              }
              {nextAction.label.toUpperCase()}
              {!nextMutation.isPending && <ArrowRight size={16} className="opacity-60" />}
            </button>
          )}

          {/* Cancel button — only for non-terminal orders */}
          {!isTerminal && (
            <button
              onClick={() => {
                if (confirm('Вы уверены, что хотите отменить этот заказ? Это действие необратимо.')) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
              className="w-full py-3 bg-white text-rose-500 rounded-2xl border border-rose-100 text-[10px] font-black uppercase tracking-widest flex items-center justify-center shadow-sm hover:bg-rose-50 transition-colors"
            >
              {cancelMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : 'Отменить заказ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
