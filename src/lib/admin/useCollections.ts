'use client';

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem, STORAGE_KEYS } from './localStorage';
import type { Collection } from '@/lib/types';

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    setCollections(getItem<Collection[]>(STORAGE_KEYS.COLLECTIONS, []));
  }, []);

  const save = (updated: Collection[]) => {
    setCollections(updated);
    setItem(STORAGE_KEYS.COLLECTIONS, updated);
  };

  const addCollection = useCallback((collection: Collection) => {
    save([...collections, collection]);
  }, [collections]);

  const updateCollection = useCallback((id: string, updates: Partial<Collection>) => {
    save(collections.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)));
  }, [collections]);

  const deleteCollection = useCallback((id: string) => {
    save(collections.filter((c) => c.id !== id));
  }, [collections]);

  return { collections, addCollection, updateCollection, deleteCollection };
}
