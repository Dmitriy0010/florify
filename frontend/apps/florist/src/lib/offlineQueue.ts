import { dbPromise } from './db';
import { useOfflineStore } from '../store/offlineStore';
import { inventoryApi } from './inventoryApi';
import { ordersApi } from './ordersApi';
import { timesheetApi } from './timesheetApi';
import type { OfflineMutation, WriteOffPayload } from './types';

async function sendMutation(item: OfflineMutation) {
  if (item.type === 'write-off') {
    await inventoryApi.writeOff(item.payload as WriteOffPayload);
    return;
  }
  if (item.type === 'status-change') {
    const payload = item.payload as { orderId: string; status: 'IN_PROGRESS' | 'READY'; floristId?: string };
    if (payload.status === 'IN_PROGRESS' && payload.floristId) {
      await ordersApi.takeOrder(payload.orderId, payload.floristId);
      return;
    }
    await ordersApi.markReady(payload.orderId);
    return;
  }
  if (item.type === 'clock-in') {
    const payload = item.payload as { employeeId: string };
    await timesheetApi.checkin(payload.employeeId);
    return;
  }
  if (item.type === 'clock-out') {
    const payload = item.payload as { employeeId: string };
    await timesheetApi.checkout(payload.employeeId);
    return;
  }
  if (item.type === 'inventory-audit') {
    await inventoryApi.writeOff(item.payload as WriteOffPayload);
  }
}

export async function getQueueCount() {
  const db = await dbPromise;
  return db.count('offlineQueue');
}

export async function enqueueMutation(item: Omit<OfflineMutation, 'id' | 'attempts' | 'createdAt'>) {
  const db = await dbPromise;
  await db.add('offlineQueue', {
    ...item,
    attempts: 0,
    createdAt: Date.now(),
  });
  useOfflineStore.getState().incrementPending();
}

export async function flushOfflineQueue() {
  const store = useOfflineStore.getState();
  if (!store.isOnline) return;
  store.setFlushing(true);
  const db = await dbPromise;
  const all = await db.getAll('offlineQueue');

  for (const item of all) {
    try {
      await sendMutation(item);
      if (typeof item.id === 'number') {
        await db.delete('offlineQueue', item.id);
        useOfflineStore.getState().decrementPending();
      }
    } catch {
      if (typeof item.id === 'number') {
        await db.put('offlineQueue', { ...item, attempts: item.attempts + 1 });
      }
    }
  }
  useOfflineStore.getState().setFlushing(false);
  useOfflineStore.getState().setLastSyncAt(new Date());
}
