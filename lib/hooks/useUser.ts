'use client';

import { useUser as useClerkUser } from '@clerk/nextjs';

/**
 * Custom hook that wraps Clerk's useUser to provide consistent user access
 * Returns userId and loading state for use throughout the app
 */
export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser();

  return {
    userId: user?.id || null,
    user,
    isLoaded,
    isSignedIn,
  };
}
