'use client';

/**
 * Custom hook that provides consistent user access
 * Returns userId and loading state for use throughout the app
 * For local development without Clerk, returns null (components use fallback IDs)
 */
export function useUser() {
  // Local dev without Clerk - return null user
  // Components will use 'demo-user-local' as fallback
  return {
    userId: null,
    user: null,
    isLoaded: true,
    isSignedIn: false,
  };
}
