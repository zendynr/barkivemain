'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Pet } from '@/lib/types';

export function usePets(userId: string | null) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', userId, 'pets'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const petsData: Pet[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        petsData.push({
          id: doc.id,
          ...data,
          // Handle legacy data that might not have these fields
          species: data.species || 'Dog', 
          activityLevel: data.activityLevel || 'Playful',
        } as Pet);
      });
      setPets(petsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching pets: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { pets, loading };
}
