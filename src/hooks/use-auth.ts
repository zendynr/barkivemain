'use client';

import { useAppContext } from '@/contexts/AuthContext';

// This hook is now a simple wrapper around the context consumer.
// This makes it easy to swap out the auth implementation in the future
// without refactoring components that use this hook.
export function useAuth() {
  const { user, userId, loading, activePet, pets, setActivePetId, petsLoading } = useAppContext();
  return { user, userId, loading, activePet, petId: activePet?.id || null, pets, setActivePetId, petsLoading };
}
