'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/config';
import type { Pet } from '@/lib/types';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const auth = getAuth(firebaseApp);

interface AppContextType {
  user: User | null;
  userId: string | null;
  loading: boolean;
  pets: Pet[];
  petsLoading: boolean;
  activePet: Pet | null;
  setActivePetId: (petId: string | null) => void;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  userId: null,
  loading: true,
  pets: [],
  petsLoading: true,
  activePet: null,
  setActivePetId: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [activePetId, setActivePetId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        // Clear pet data on sign out
        setPets([]);
        setActivePetId(null);
        setPetsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setPetsLoading(false);
      return;
    };

    setPetsLoading(true);
    const q = query(collection(db, 'users', user.uid, 'pets'));

    const unsubscribePets = onSnapshot(q, (querySnapshot) => {
      const petsData: Pet[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        petsData.push({
          id: doc.id,
          ...data,
          species: data.species || 'Dog', 
          activityLevel: data.activityLevel || 'Playful',
          unitPreference: data.unitPreference || 'metric',
        } as Pet);
      });
      setPets(petsData);

      // Set active pet if not already set or if it no longer exists
      if (petsData.length > 0) {
        const currentActivePetExists = petsData.some(p => p.id === activePetId);
        if (!activePetId || !currentActivePetExists) {
          setActivePetId(petsData[0].id);
        }
      } else {
        setActivePetId(null);
      }
      setPetsLoading(false);
    }, (error) => {
        console.error("Error fetching pets: ", error);
        setPetsLoading(false);
    });

    return () => unsubscribePets();
  }, [user, activePetId]);

  const activePet = pets.find(p => p.id === activePetId) || null;

  const value = {
    user,
    userId: user?.uid || null,
    loading,
    pets,
    petsLoading,
    activePet,
    setActivePetId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
