import { useState, useCallback } from 'react';

export function useIndexedDB(dbName: string, storeName: string) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  const initDB = useCallback(async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;
        setDb(database);
        setIsReady(true);
        resolve(database);
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
    });
  }, [dbName, storeName]);

  const add = useCallback(async (data: any) => {
    const database = db || (await initDB());
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [db, storeName, initDB]);

  const get = useCallback(async (id: any) => {
    const database = db || (await initDB());
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [db, storeName, initDB]);

  const getAll = useCallback(async () => {
    const database = db || (await initDB());
    return new Promise<any[]>((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [db, storeName, initDB]);

  const update = useCallback(async (data: any) => {
    const database = db || (await initDB());
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [db, storeName, initDB]);

  const remove = useCallback(async (id: any) => {
    const database = db || (await initDB());
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [db, storeName, initDB]);

  const clear = useCallback(async () => {
    const database = db || (await initDB());
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [db, storeName, initDB]);

  return {
    db,
    isReady,
    initDB,
    add,
    get,
    getAll,
    update,
    remove,
    clear,
  };
}
