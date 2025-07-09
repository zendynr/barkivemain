'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Pet } from '@/lib/types';

export function usePetProfile(userId: string | null, petId: string | null) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !petId) {
      setLoading(false);
      return;
    }

    const petDocRef = doc(db, 'users', userId, 'pets', petId);

    const unsubscribe = onSnapshot(petDocRef, (doc) => {
      if (doc.exists()) {
        setPet({ id: doc.id, ...doc.data() } as Pet);
      } else {
        console.log("No such pet!");
        setPet(null);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching pet profile: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, petId]);

  return { pet, loading };
}
