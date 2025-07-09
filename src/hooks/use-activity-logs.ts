'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ActivityLog } from '@/lib/types';

export function useActivityLogs(userId: string | null, petId: string | null) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !petId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', userId, 'pets', petId, 'activityLogs'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logs: ActivityLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp)?.toDate(),
        } as ActivityLog);
      });
      setActivityLogs(logs);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching activity logs: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, petId]);

  return { activityLogs, loading };
}
