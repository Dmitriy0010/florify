import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersApi } from '../lib/ordersApi';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import type { OrderKanbanItem } from '../lib/types';
import { enqueueMutation } from '../lib/offlineQueue';

const KANBAN_OPTIONS = {
  refetchInterval: 30_000,
  staleTime: 15_000,
};

function OrderCard({
  order,
  onTake,
  onReady,
  myId,
}: {
  order: OrderKanbanItem;
  onTake: (id: string) => void;
  onReady: (id: string) => void;
  myId: string | null;
}) {
  const isMine = order.assignedFloristId === myId;
  return (
    <div className={`order-card ${isMine ? 'mine' : ''}`}>
      <div className="order-number">#{order.orderNumber || order.id}</div>
      <div className="order-meta">{order.customerName || 'Гостевой заказ'}</div>
      <div className="order-meta">
        {order.items?.slice(0, 2).map((item) => `${item.productName} x${item.quantity}`).join(', ') || 'Состав уточняется'}
      </div>
      <Link to={`/orders/${order.id}`} className="secondary-btn">
        Открыть
      </Link>
      {order.status === 'CONFIRMED' ? (
        <button className="primary-btn" onClick={() => onTake(order.id)}>
          Взять в работу
        </button>
      ) : null}
      {order.status === 'IN_PROGRESS' ? (
        <button className="primary-btn" onClick={() => onReady(order.id)}>
          Букет готов
        </button>
      ) : null}
    </div>
  );
}

export default function KanbanPage() {
  const queryClient = useQueryClient();
  const myId = useAuthStore((state) => state.userId);
  const isOnline = useOfflineStore((state) => state.isOnline);

  const confirmed = useQuery({
    queryKey: ['kanban', 'CONFIRMED'],
    queryFn: () => ordersApi.getKanban('CONFIRMED', 50),
    ...KANBAN_OPTIONS,
  });
  const inProgress = useQuery({
    queryKey: ['kanban', 'IN_PROGRESS'],
    queryFn: () => ordersApi.getKanban('IN_PROGRESS', 50),
    ...KANBAN_OPTIONS,
  });
  const ready = useQuery({
    queryKey: ['kanban', 'READY'],
    queryFn: () => ordersApi.getKanban('READY', 50),
    ...KANBAN_OPTIONS,
  });

  const takeMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (isOnline && myId) {
        return ordersApi.takeOrder(orderId, myId);
      }
      await enqueueMutation({
        type: 'status-change',
        payload: { orderId, status: 'IN_PROGRESS', floristId: myId ?? undefined },
      });
      return null;
    },
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: ['kanban', 'CONFIRMED'] });
      const previous = queryClient.getQueryData<OrderKanbanItem[]>(['kanban', 'CONFIRMED']);
      queryClient.setQueryData<OrderKanbanItem[]>(['kanban', 'CONFIRMED'], (old = []) =>
        old.filter((item) => item.id !== orderId),
      );
      return { previous };
    },
    onError: (_error, _orderId, ctx) => {
      queryClient.setQueryData(['kanban', 'CONFIRMED'], ctx?.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kanban'] }),
  });
  const readyMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (isOnline) {
        return ordersApi.markReady(orderId);
      }
      await enqueueMutation({
        type: 'status-change',
        payload: { orderId, status: 'READY' },
      });
      return null;
    },
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: ['kanban', 'IN_PROGRESS'] });
      const previous = queryClient.getQueryData<OrderKanbanItem[]>(['kanban', 'IN_PROGRESS']);
      queryClient.setQueryData<OrderKanbanItem[]>(['kanban', 'IN_PROGRESS'], (old = []) =>
        old.filter((item) => item.id !== orderId),
      );
      return { previous };
    },
    onError: (_error, _orderId, ctx) => {
      queryClient.setQueryData(['kanban', 'IN_PROGRESS'], ctx?.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kanban'] }),
  });

  if (confirmed.isError || inProgress.isError || ready.isError) {
    return <div className="center-message">Не удалось загрузить канбан. Проверьте соединение.</div>;
  }

  return (
    <div className="kanban-page">
      <section className="kanban-column confirmed">
        <h2>Назначено ({confirmed.data?.length || 0})</h2>
        {confirmed.isLoading ? <p className="order-meta">Загрузка...</p> : null}
        {!confirmed.isLoading && (confirmed.data?.length ?? 0) === 0 ? <p className="order-meta">Пусто</p> : null}
        {confirmed.data?.map((order) => (
          <OrderCard key={order.id} order={order} onTake={takeMutation.mutate} onReady={readyMutation.mutate} myId={myId} />
        ))}
      </section>

      <section className="kanban-column progress">
        <h2>Собираю ({inProgress.data?.length || 0})</h2>
        {inProgress.isLoading ? <p className="order-meta">Загрузка...</p> : null}
        {!inProgress.isLoading && (inProgress.data?.length ?? 0) === 0 ? <p className="order-meta">Пусто</p> : null}
        {inProgress.data?.map((order) => (
          <OrderCard key={order.id} order={order} onTake={takeMutation.mutate} onReady={readyMutation.mutate} myId={myId} />
        ))}
      </section>

      <section className="kanban-column ready">
        <h2>Готово ({ready.data?.length || 0})</h2>
        {ready.isLoading ? <p className="order-meta">Загрузка...</p> : null}
        {!ready.isLoading && (ready.data?.length ?? 0) === 0 ? <p className="order-meta">Пусто</p> : null}
        {ready.data?.map((order) => (
          <OrderCard key={order.id} order={order} onTake={takeMutation.mutate} onReady={readyMutation.mutate} myId={myId} />
        ))}
      </section>
    </div>
  );
}
