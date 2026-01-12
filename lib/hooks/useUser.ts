'use client';

import { useUser as useClerkUser } from '@clerk/nextjs';

/**
 * Custom hook that provides consistent user access
 * Wraps Clerk's useUser hook for the application
 */
export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser();
  
  return {
    userId: user?.id || null,
    user: user,
    isLoaded,
    isSignedIn: isSignedIn || false,
  };
}
