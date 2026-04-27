import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersApi } from '../lib/ordersApi';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import { enqueueMutation } from '../lib/offlineQueue';
import { inventoryApi } from '../lib/inventoryApi';
import { WriteOffModal } from '../components/WriteOffModal';

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const myId = useAuthStore((state) => state.userId);
  const isOnline = useOfflineStore((state) => state.isOnline);
  const [isWriteOffOpen, setWriteOffOpen] = useState(false);

  const productsQuery = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: inventoryApi.getAllBalances,
  });

  const orderQuery = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id || ''),
    enabled: Boolean(id),
  });

  const takeMutation = useMutation({
    mutationFn: async () => {
      if (isOnline && id && myId) {
        return ordersApi.takeOrder(id, myId);
      }
      if (id) {
        await enqueueMutation({
          type: 'status-change',
          payload: { orderId: id, status: 'IN_PROGRESS', floristId: myId ?? undefined },
        });
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  const readyMutation = useMutation({
    mutationFn: async () => {
      if (isOnline && id) {
        return ordersApi.markReady(id);
      }
      if (id) {
        await enqueueMutation({
          type: 'status-change',
          payload: { orderId: id, status: 'READY' },
        });
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  if (orderQuery.isLoading) return <div className="center-message">Загрузка заказа...</div>;
  if (!orderQuery.data) return <div className="center-message">Заказ не найден</div>;

  const order = orderQuery.data;

  return (
    <div className="detail-page">
      <button className="secondary-btn" onClick={() => navigate(-1)}>
        ← Назад
      </button>
      <h2>#{order.orderNumber || order.id}</h2>
      <p className="order-meta">Статус: {order.status}</p>

      <h3>Состав букета</h3>
      <ul>
        {order.items?.map((item, idx) => (
          <li key={idx}>
            {item.productName} x{item.quantity}
          </li>
        ))}
      </ul>

      <h3>Клиент</h3>
      <p>{order.customerName || 'Гостевой заказ'}</p>
      {order.guestPhone ? <p>{order.guestPhone}</p> : null}

      {order.deliveryAddress ? (
        <>
          <h3>Доставка</h3>
          <p>{order.deliveryAddress}</p>
        </>
      ) : null}

      {order.comment ? (
        <>
          <h3>Комментарий</h3>
          <p>{order.comment}</p>
        </>
      ) : null}

      <div className="detail-actions">
        {order.status === 'CONFIRMED' ? (
          <button className="primary-btn" onClick={() => takeMutation.mutate()}>
            Взять в работу
          </button>
        ) : null}
        {order.status === 'IN_PROGRESS' ? (
          <button className="primary-btn" onClick={() => readyMutation.mutate()}>
            Букет готов
          </button>
        ) : null}
        <button className="secondary-btn" onClick={() => setWriteOffOpen(true)}>
          Открыть списание
        </button>
      </div>
      <WriteOffModal
        open={isWriteOffOpen}
        onClose={() => setWriteOffOpen(false)}
        products={productsQuery.data ?? []}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['inventory'] })}
      />
    </div>
  );
}
