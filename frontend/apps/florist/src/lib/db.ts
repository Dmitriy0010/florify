import { openDB, type DBSchema } from 'idb';
import type { EnhancedStockBalanceResponse, OfflineMutation, OrderKanbanItem } from './types';

interface FloristDB extends DBSchema {
  orders: {
    key: string;
    value: OrderKanbanItem & { cachedAt: number };
    indexes: { 'by-status': string };
  };
  inventory: {
    key: string;
    value: EnhancedStockBalanceResponse & { cachedAt: number };
  };
  offlineQueue: {
    key: number;
    value: OfflineMutation;
  };
}

export const dbPromise = openDB<FloristDB>('florify-v1', 1, {
  upgrade(db) {
    const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
    ordersStore.createIndex('by-status', 'status');
    db.createObjectStore('inventory', { keyPath: 'productId' });
    db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
  },
});
