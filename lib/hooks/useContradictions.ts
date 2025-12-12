import { useState, useEffect } from 'react';
import { detectContradictions } from '@/lib/contradictions';
import { initializeMockData } from '@/lib/kv';
import type { Contradiction, UserProfile } from '@/types';

/**
 * Hook to detect and manage behavioral contradictions
 * Integrates user profile, financial data, and behavior tracking
 */
export function useContradictions(timeRange: 'week' | 'month' | 'year' = 'month') {
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function analyzeContradictions() {
      try {
        setLoading(true);
        setError(null);

        // Load user profile from localStorage (will be from KV in production)
        const profileData = localStorage.getItem('profile');
        const moneyStyleData = localStorage.getItem('moneyStyle');
        
        if (!profileData || !moneyStyleData) {
          // No profile data yet, show empty state
          setContradictions([]);
          setLoading(false);
          return;
        }

        const profile: UserProfile = JSON.parse(profileData);
        const moneyStyle = JSON.parse(moneyStyleData);
        
        // Enhance profile with money style
        profile.moneyStyle = moneyStyle;
        
        // Add stated preferences if not already set (for demo purposes)
        if (!profile.statedPreferences) {
          profile.statedPreferences = {
            riskTolerance: 'moderate',
            savingsGoal: 1000, // $1000/month savings goal
            investmentStyle: 'passive',
            priorityGoals: ['House Down Payment', 'Emergency Fund'],
          };
        }

        // Initialize mock KV data for demo user
        await initializeMockData('demo-user');

        // Run contradiction detection (async)
        // Note: In production, this will use userId from auth context
        const detected = await detectContradictions('demo-user', profile);        setContradictions(detected);
      } catch (err) {
        console.error('Error detecting contradictions:', err);
        setError('Failed to analyze spending patterns');
        setContradictions([]);
      } finally {
        setLoading(false);
      }
    }

    analyzeContradictions();
  }, [timeRange]);

  return { contradictions, loading, error };
}
