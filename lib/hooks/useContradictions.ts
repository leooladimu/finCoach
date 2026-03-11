import { useState, useEffect } from 'react';
import { detectContradictionsAction } from '@/lib/actions';
import { useUser } from '@/lib/hooks/useUser';
import type { Contradiction } from '@/types';

/**
 * Hook to detect and manage behavioral contradictions
 * Integrates user profile, financial data, and behavior tracking
 */
export function useContradictions(timeRange: 'week' | 'month' | 'year' = 'month') {
  const { userId, isLoaded } = useUser();
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function analyzeContradictions() {
      // Wait for auth to load
      if (!isLoaded) {
        return;
      }

      // User not authenticated
      if (!userId) {
        setContradictions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const detected = await detectContradictionsAction(userId);
        setContradictions(detected);
      } catch (err) {
        console.error('Error detecting contradictions:', err);
        setError('Failed to analyze spending patterns');
        setContradictions([]);
      } finally {
        setLoading(false);
      }
    }

    analyzeContradictions();
  }, [timeRange, userId, isLoaded]);

  return { contradictions, loading, error };
}
