'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Memory } from '@/lib/types';

export function useMemories(userId: string | null, petId: string | null, count?: number) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !petId) {
      setLoading(false);
      return;
    }

    const memoriesCollection = collection(db, 'users', userId, 'pets', petId, 'memories');
    const q = count 
      ? query(memoriesCollection, orderBy('timestamp', 'desc'), limit(count))
      : query(memoriesCollection, orderBy('timestamp', 'desc'));


    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const memoriesData: Memory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        memoriesData.push({
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp)?.toDate(),
        } as Memory);
      });
      setMemories(memoriesData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching memories: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, petId, count]);

  return { memories, loading };
}
