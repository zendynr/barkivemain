'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Reminder } from '@/lib/types';

export function useReminders(userId: string | null, petId: string | null) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !petId) {
      setReminders([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', userId, 'pets', petId, 'reminders'),
      orderBy('due', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const remindersData: Reminder[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        remindersData.push({
          id: doc.id,
          ...data,
          due: (data.due as Timestamp)?.toDate(),
        } as Reminder);
      });
      setReminders(remindersData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching reminders: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, petId]);

  return { reminders, loading };
}
