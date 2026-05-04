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
} from 'lucide-react';
import { ordersApi } from '../lib/ordersApi';
import { deliveryApi } from '../lib/deliveryApi';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import { enqueueMutation } from '../lib/offlineQueue';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

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
  });

  const { data: deliveryTask } = useQuery({
    queryKey: ['deliveryTask', id],
    queryFn: () => deliveryApi.getTaskByOrderId(id!),
    enabled: !!id && order?.type === 'DELIVERY',
    retry: false
  });

  const takeMutation = useMutation({
    mutationFn: async () => {
      if (!id || !myId) return;
      if (isOnline) return ordersApi.takeOrder(id, myId);
      await enqueueMutation({ type: 'status-change', payload: { orderId: id, status: 'IN_PROGRESS', floristId: myId } });
      return null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const readyMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      if (isOnline) return ordersApi.markReady(id);
      await enqueueMutation({ type: 'status-change', payload: { orderId: id, status: 'READY' } });
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/orders');
    },
  });

  if (isLoading || !order) {
    return (
      <div className="flex-1 flex items-center justify-center h-full opacity-10">
         <RefreshCw className="animate-spin" size={40} />
      </div>
    );
  }

  const isMine = order.assignedFloristId === myId;
  const isConfirmed = order.status === 'CONFIRMED' || order.status === 'NEW';
  const isInProgress = order.status === 'IN_PROGRESS';

  const statusMap: Record<string, string> = {
    'NEW': 'Новый (Онлайн)',
    'CONFIRMED': 'Новый',
    'IN_PROGRESS': 'Сборка',
    'READY': 'Готов',
    'OUT_FOR_DELIVERY': 'В пути',
    'COMPLETED': 'Выполнен',
    'CANCELLED': 'Отменен'
  };

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="premium-btn premium-btn-outline p-2 w-10 h-10 min-w-0"><ChevronLeft size={18} /></button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black uppercase tracking-tight">Заказ #{order.orderNumber || order.id.slice(0, 8)}</h1>
              <span className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm",
                order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                order.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-amber-50 text-amber-600 border-amber-100'
              )}>
                {statusMap[order.status] || order.status}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Создан: {order.createdAt ? format(new Date(order.createdAt), 'd MMMM, HH:mm', { locale: ru }) : '--:--'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={20} />
          <span className="text-lg font-black text-slate-900 tracking-tighter tabular-nums">{order.createdAt ? format(new Date(order.createdAt), 'HH:mm') : ''}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 pb-32">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Customer */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User size={18} className="text-emerald-600" />
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Информация о клиенте</h3>
              </div>
              <button className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border-0 cursor-pointer"><Phone size={14} /></button>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">{order.customerName || 'Обычный клиент'}</p>
              {order.type === 'DELIVERY' && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3">
                  <div className="flex gap-3">
                    <MapPin size={18} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-slate-700">{order.deliveryAddress || order.address || 'Адрес не указан'}</p>
                  </div>
                  {deliveryTask && (
                    <div className="flex gap-3 items-center border-t border-slate-200 pt-3 mt-1">
                      <Truck size={16} className="text-slate-400 shrink-0" />
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Статус доставки</span>
                        <span className="text-[11px] font-black uppercase text-brand px-2 py-1 bg-brand/10 rounded-md">
                          {deliveryTask.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
              <p className="text-4xl font-black tracking-tighter">{(order.finalAmount || 0).toLocaleString()} <span className="text-lg opacity-40">₽</span></p>
              <div className="flex gap-2 mt-6">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase border border-white/10 tracking-widest">Наличные</span>
                <span className="px-3 py-1 bg-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Оплачено</span>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-slate-400" />
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Состав заказа</h3>
          </div>
          <div className="flex flex-col gap-3">
            {order.items?.map((item: any) => (
              <div key={item.productId} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl border border-slate-50 transition-all">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 shrink-0">
                  <ShoppingBag size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-slate-900 truncate">{item.productName || 'Товар'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">АРТ: {item.productId.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">x{item.quantity}</p>
                  <p className="text-sm font-black text-emerald-600">{(item.unitPrice || 0).toLocaleString()} ₽</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50 px-4">
        <div className="w-full max-w-lg pointer-events-auto">
          {isConfirmed && (
            <button 
              onClick={() => takeMutation.mutate()} 
              disabled={takeMutation.isPending}
              className="premium-btn premium-btn-primary w-full py-5 text-sm font-black flex items-center justify-center gap-3 shadow-2xl border-0"
            >
              {takeMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
              ПРИНЯТЬ В РАБОТУ
            </button>
          )}

          {isInProgress && isMine && (
            <button 
              onClick={() => readyMutation.mutate()} 
              disabled={readyMutation.isPending}
              className="premium-btn premium-btn-primary w-full py-5 bg-slate-900 border-slate-900 text-sm font-black flex items-center justify-center gap-3 shadow-2xl border-0"
            >
              {readyMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              ГОТОВ К ВЫДАЧЕ
            </button>
          )}

          {(!isMine && isInProgress) && (
            <div className="w-full py-5 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
              <RefreshCw size={16} className="animate-spin" />
              <span>Заказ собирает другой флорист</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
