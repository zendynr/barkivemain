'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { FeedingLog } from '@/lib/types';

export function useFeedingLogs(userId: string | null, petId: string | null) {
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !petId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', userId, 'pets', petId, 'feedingLogs'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logs: FeedingLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp)?.toDate(),
        } as FeedingLog);
      });
      setFeedingLogs(logs);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching feeding logs: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, petId]);

  return { feedingLogs, loading };
}
