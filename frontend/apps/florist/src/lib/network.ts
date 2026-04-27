import { getQueueCount, flushOfflineQueue } from './offlineQueue';
import { useOfflineStore } from '../store/offlineStore';

export async function initNetworkSync() {
  useOfflineStore.getState().setPendingCount(await getQueueCount());
  useOfflineStore.getState().setOnline(navigator.onLine);

  const onOnline = async () => {
    useOfflineStore.getState().setOnline(true);
    await flushOfflineQueue();
    useOfflineStore.getState().setPendingCount(await getQueueCount());
  };
  const onOffline = () => {
    useOfflineStore.getState().setOnline(false);
  };

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
}
