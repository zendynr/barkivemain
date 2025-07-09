'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { HealthLog } from '@/lib/types';

export function useHealthLogs(userId: string | null, petId: string | null) {
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !petId) {
      setHealthLogs([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', userId, 'pets', petId, 'healthLogs'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logs: HealthLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp)?.toDate(),
        } as HealthLog);
      });
      setHealthLogs(logs);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching health logs: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, petId]);

  return { healthLogs, loading };
}
