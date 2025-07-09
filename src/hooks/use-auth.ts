'use client';

import { useAuthContext } from '@/contexts/AuthContext';

// This hook is now a simple wrapper around the context consumer.
// This makes it easy to swap out the auth implementation in the future
// without refactoring components that use this hook.
export function useAuth() {
  return useAuthContext();
}
