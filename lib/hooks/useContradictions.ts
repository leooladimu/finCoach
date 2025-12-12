import { useState, useEffect } from 'react';
import { detectContradictions } from '@/lib/contradictions';
import { initializeMockData, getUserProfile } from '@/lib/kv';
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

        // Load user profile from KV
        const profile = await getUserProfile(userId);
        
        if (!profile) {
          // No profile data yet, show empty state
          setContradictions([]);
          setLoading(false);
          return;
        }
        
        // Add stated preferences if not already set (for demo purposes)
        if (!profile.statedPreferences) {
          profile.statedPreferences = {
            riskTolerance: 'moderate',
            savingsGoal: 1000, // $1000/month savings goal
            investmentStyle: 'passive',
            priorityGoals: ['House Down Payment', 'Emergency Fund'],
          };
        }

        // Initialize mock KV data for this user (for demo purposes)
        await initializeMockData(userId);

        // Run contradiction detection
        const detected = await detectContradictions(userId, profile);        setContradictions(detected);
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
