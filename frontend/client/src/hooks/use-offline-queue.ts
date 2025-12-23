import { useState, useEffect, useCallback } from 'react';
import { useIndexedDB } from './use-indexed-db';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high';
  conflictResolution?: 'overwrite' | 'merge' | 'skip';
}

interface OfflineQueueState {
  queue: QueuedRequest[];
  isOnline: boolean;
  isProcessing: boolean;
  pendingCount: number;
  failedCount: number;
  addToQueue: (request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  processQueue: () => Promise<void>;
  clearQueue: () => Promise<void>;
  removeFromQueue: (id: string) => Promise<void>;
}

const OFFLINE_QUEUE_CONFIG = {
  dbName: 'imarisha-offline-queue',
  version: 1,
  stores: [{
    name: 'requests',
    keyPath: 'id',
    indexes: [
      { name: 'timestamp', keyPath: 'timestamp' },
      { name: 'priority', keyPath: 'priority' },
      { name: 'retryCount', keyPath: 'retryCount' }
    ]
  }]
};

export function useOfflineQueue(): OfflineQueueState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queue, setQueue] = useState<QueuedRequest[]>([]);

  const {
    add: addToDB,
    remove: removeFromDB,
    clear: clearDB,
    getAll: refreshQueue
  } = useIndexedDB('imarisha-offline-queue', 'requests');

  // Load queue on mount
  useEffect(() => {
    refreshQueue().then((items: any[]) => {
      setQueue(items || []);
    }).catch(() => {
      setQueue([]);
    });
  }, [refreshQueue]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-process queue when coming back online
      setTimeout(() => processQueue(), 1000);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processQueue]);

  // Auto-process queue when online and not processing
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      const timer = setTimeout(() => processQueue(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, isProcessing, processQueue]);

  const addToQueue = useCallback(async (request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>) => {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    await addToDB(queuedRequest);
    console.log('[Offline Queue] Request added to queue:', queuedRequest.id);
  }, [addToDB]);

  const processQueue = useCallback(async () => {
    if (!isOnline || isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    console.log('[Offline Queue] Processing queue...', queue.length, 'requests');

    // Sort by priority and timestamp
    const sortedQueue = [...queue].sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 3, normal: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });

    const failedRequests: QueuedRequest[] = [];

    for (const request of sortedQueue) {
      try {
        console.log('[Offline Queue] Processing request:', request.id, request.method, request.url);

        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });

        if (response.ok) {
          await removeFromDB(request.id);
          console.log('[Offline Queue] Request processed successfully:', request.id);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('[Offline Queue] Request failed:', request.id, error);

        const updatedRequest = {
          ...request,
          retryCount: request.retryCount + 1
        };

        if (updatedRequest.retryCount < request.maxRetries) {
          // Update retry count in DB
          await removeFromDB(request.id);
          await addToDB(updatedRequest);
          failedRequests.push(updatedRequest);
        } else {
          // Max retries reached, remove from queue
          await removeFromDB(request.id);
          console.log('[Offline Queue] Request removed after max retries:', request.id);
        }
      }
    }

    setIsProcessing(false);

    if (failedRequests.length > 0) {
      console.log('[Offline Queue] Processing complete with', failedRequests.length, 'failed requests');
    } else {
      console.log('[Offline Queue] All requests processed successfully');
    }
  }, [isOnline, isProcessing, queue, removeFromDB, addToDB]);

  const clearQueue = useCallback(async () => {
    await clearDB();
    console.log('[Offline Queue] Queue cleared');
  }, [clearDB]);

  const removeFromQueue = useCallback(async (id: string) => {
    await removeFromDB(id);
    console.log('[Offline Queue] Request removed from queue:', id);
  }, [removeFromDB]);

  const pendingCount = queue.filter(req => req.retryCount === 0).length;
  const failedCount = queue.filter(req => req.retryCount > 0).length;

  return {
    queue,
    isOnline,
    isProcessing,
    pendingCount,
    failedCount,
    addToQueue,
    processQueue,
    clearQueue,
    removeFromQueue
  };
}
