import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { inventoryApi } from '../lib/inventoryApi';
import { enqueueMutation } from '../lib/offlineQueue';
import { useOfflineStore } from '../store/offlineStore';
import type { EnhancedStockBalanceResponse, WriteOffReason } from '../lib/types';

const schema = z.object({
  productId: z.string().min(1, 'Выберите товар'),
  quantity: z.number().positive('Количество должно быть больше 0').max(10000),
  reason: z.enum(['SPOILAGE', 'DAMAGE', 'INVENTORY_LOSS']),
  comment: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

interface WriteOffModalProps {
  open: boolean;
  onClose: () => void;
  products: EnhancedStockBalanceResponse[];
  defaultProductId?: string;
  onSuccess?: () => void;
}

const reasonLabels: Record<WriteOffReason, string> = {
  SPOILAGE: 'Увядание / сгнил',
  DAMAGE: 'Поломка / повреждение',
  INVENTORY_LOSS: 'Недостача (инвентаризация)',
};

export function WriteOffModal({ open, onClose, products, defaultProductId, onSuccess }: WriteOffModalProps) {
  const isOnline = useOfflineStore((state) => state.isOnline);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: defaultProductId ?? products[0]?.productId ?? '',
      quantity: 1,
      reason: 'SPOILAGE',
      comment: '',
    },
  });

  if (!open) return null;

  const submit = async (data: FormData) => {
    if (isOnline) {
      await inventoryApi.writeOff({
        productId: data.productId,
        quantity: data.quantity,
        reason: data.reason,
        comment: data.comment,
      });
    } else {
      await enqueueMutation({
        type: 'write-off',
        payload: {
          productId: data.productId,
          quantity: data.quantity,
          reason: data.reason,
          comment: data.comment,
        },
      });
    }
    reset();
    onClose();
    onSuccess?.();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Списание товара</h3>
        <form className="modal-form" onSubmit={handleSubmit(submit)}>
          <label>
            Товар
            <select {...register('productId')}>
              {products.map((product) => (
                <option value={product.productId} key={product.productId}>
                  {product.productName}
                </option>
              ))}
            </select>
            {errors.productId ? <span className="field-error">{errors.productId.message}</span> : null}
          </label>

          <label>
            Количество
            <input type="number" min={1} {...register('quantity', { valueAsNumber: true })} />
            {errors.quantity ? <span className="field-error">{errors.quantity.message}</span> : null}
          </label>

          <label>
            Причина
            <select {...register('reason')}>
              {Object.entries(reasonLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Комментарий
            <textarea rows={3} {...register('comment')} />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняем...' : isOnline ? 'Списать' : 'Сохранить офлайн'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
