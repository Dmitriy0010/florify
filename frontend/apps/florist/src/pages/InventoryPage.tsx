import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { inventoryApi } from '../lib/inventoryApi';

function isExpiringSoon(date?: string | null) {
  if (!date) return false;
  const diff = new Date(date).getTime() - Date.now();
  return diff <= 3 * 24 * 60 * 60 * 1000;
}

function getStockClass(quantity: number, hasExpiringBatch: boolean) {
  if (quantity === 0) return 'stock-zero';
  if (quantity <= 4 || hasExpiringBatch) return 'stock-low';
  return 'stock-ok';
}

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const inventoryQuery = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: inventoryApi.getAllBalances,
    refetchInterval: 60_000,
  });

  const filtered = useMemo(() => {
    const base = inventoryQuery.data ?? [];
    return base.filter((item) => {
      const bySearch = item.productName.toLowerCase().includes(search.toLowerCase());
      const hasExpiring = (item.batches ?? []).some((batch) => isExpiringSoon(batch.expiresAt));
      const isCritical = item.quantity <= 4 || hasExpiring;
      return bySearch && (!criticalOnly || isCritical);
    });
  }, [criticalOnly, inventoryQuery.data, search]);

  return (
    <div className="inventory-page">
      <div className="inventory-controls">
        <input
          placeholder="Поиск по товару"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <label className="checkbox-line">
          <input
            type="checkbox"
            checked={criticalOnly}
            onChange={(event) => setCriticalOnly(event.target.checked)}
          />
          Только критические
        </label>
      </div>

      <div className="inventory-actions-row">
        <Link to="/inventory/audit" className="secondary-btn">
          Провести инвентаризацию
        </Link>
      </div>

      {inventoryQuery.isLoading ? <div className="center-message">Загрузка склада...</div> : null}
      {inventoryQuery.isError ? <div className="center-message">Не удалось загрузить склад.</div> : null}

      {filtered.map((item) => {
        const hasExpiringBatch = (item.batches ?? []).some((batch) => isExpiringSoon(batch.expiresAt));
        const stockClass = getStockClass(item.quantity, hasExpiringBatch);
        return (
          <Link key={item.productId} to={`/inventory/${item.productId}`} className={`inventory-card ${stockClass}`}>
            <div>
              <div className="inventory-title">{item.productName}</div>
              <div className="order-meta">
                WAC: {item.averageCost.toFixed(2)} ₽
                {hasExpiringBatch ? ' · Истекает срок' : ''}
              </div>
            </div>
            <div className="inventory-qty">{item.quantity} шт</div>
          </Link>
        );
      })}
    </div>
  );
}
