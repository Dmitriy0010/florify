import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '../lib/inventoryApi';
import { useOfflineStore } from '../store/offlineStore';
import { enqueueMutation } from '../lib/offlineQueue';

export default function InventoryAuditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOfflineStore((state) => state.isOnline);
  const [actualMap, setActualMap] = useState<Record<string, number>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSaving, setSaving] = useState(false);

  const inventoryQuery = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: inventoryApi.getAllBalances,
  });

  const rows = useMemo(() => inventoryQuery.data ?? [], [inventoryQuery.data]);

  const applyAudit = async () => {
    setSaving(true);
    const nextWarnings: string[] = [];
    for (const row of rows) {
      const actual = actualMap[row.productId];
      if (typeof actual !== 'number') continue;
      if (actual < row.quantity) {
        const diff = row.quantity - actual;
        if (isOnline) {
          await inventoryApi.writeOff({
            productId: row.productId,
            quantity: diff,
            reason: 'INVENTORY_LOSS',
            comment: 'Корректировка инвентаризации',
          });
        } else {
          await enqueueMutation({
            type: 'inventory-audit',
            payload: {
              productId: row.productId,
              quantity: diff,
              reason: 'INVENTORY_LOSS',
              comment: 'Корректировка инвентаризации',
            },
          });
        }
      } else if (actual > row.quantity) {
        nextWarnings.push(`${row.productName}: излишек ${actual - row.quantity} шт`);
      }
    }
    setWarnings(nextWarnings);
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
  };

  return (
    <div className="detail-page">
      <button className="secondary-btn" onClick={() => navigate(-1)}>
        ← Назад
      </button>
      <h2>Инвентаризация</h2>
      <div className="stack-list">
        {rows.map((row) => {
          const actual = actualMap[row.productId];
          const diff = typeof actual === 'number' ? actual - row.quantity : 0;
          return (
            <div className="audit-row" key={row.productId}>
              <div className="inventory-title">{row.productName}</div>
              <div className="order-meta">Системно: {row.quantity}</div>
              <input
                type="number"
                placeholder="Фактически"
                value={typeof actual === 'number' ? actual : ''}
                onChange={(event) =>
                  setActualMap((prev) => ({
                    ...prev,
                    [row.productId]: Number(event.target.value),
                  }))
                }
              />
              <div className={diff < 0 ? 'stock-zero' : diff > 0 ? 'stock-low' : ''}>
                Разница: {diff}
              </div>
            </div>
          );
        })}
      </div>
      <button className="primary-btn" onClick={applyAudit} disabled={isSaving}>
        {isSaving ? 'Применяем...' : isOnline ? 'Применить корректировки' : 'Сохранить корректировки офлайн'}
      </button>
      {warnings.length > 0 ? (
        <div className="warnings">
          <strong>Излишки (сообщите администратору):</strong>
          {warnings.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
