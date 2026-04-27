import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryApi } from '../lib/inventoryApi';
import { WriteOffModal } from '../components/WriteOffModal';

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

  return (
    <div className="detail-page">
      <button className="secondary-btn" onClick={() => navigate(-1)}>
        ← Назад
      </button>
      <h2>{balanceQuery.data?.productName ?? 'Товар'}</h2>
      <p>Остаток: {balanceQuery.data?.quantity ?? 0} шт</p>
      <p>WAC: {(balanceQuery.data?.averageCost ?? 0).toFixed(2)} ₽</p>

      <h3>Партии</h3>
      <div className="stack-list">
        {batchesQuery.data?.map((batch) => (
          <div key={batch.id} className="list-row">
            <span>{batch.id.slice(0, 8)}</span>
            <span>{batch.quantity} шт</span>
            <span>{batch.expiresAt ? new Date(batch.expiresAt).toLocaleDateString() : '—'}</span>
            <span>{batch.status}</span>
          </div>
        ))}
      </div>

      <h3>Транзакции</h3>
      <div className="stack-list">
        {txQuery.data?.slice(0, 10).map((tx) => (
          <div key={tx.id} className="list-row">
            <span>{tx.type}</span>
            <span>{tx.quantity}</span>
            <span>{new Date(tx.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="detail-actions">
        <button className="primary-btn" onClick={() => setWriteOffOpen(true)}>
          Списать
        </button>
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
