import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserProfile, getLatestFinancialSnapshot } from '@/lib/kv';
import { detectContradictions } from '@/lib/contradictions';

/**
 * POST /api/analyze/trigger
 * Runs contradiction detection for the authenticated user and returns results.
 * 
 * Body: { userId: string; timeRange?: 'week' | 'month' | 'year' }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, timeRange = 'month' } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const profile = await getUserProfile(userId);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    // Ensure stated preferences exist for contradiction detection
    if (!profile.statedPreferences) {
      profile.statedPreferences = {
        riskTolerance: 'moderate',
        savingsGoal: 1000,
        investmentStyle: 'passive',
        priorityGoals: [],
      };
    }

    const snapshot = await getLatestFinancialSnapshot(userId);
    if (!snapshot) {
      return NextResponse.json({
        success: true,
        contradictions: [],
        breakdown: { high: 0, medium: 0, low: 0 },
        message: 'No financial data yet — connect a bank account to enable analysis.',
        timestamp: new Date().toISOString(),
      });
    }

    const contradictions = await detectContradictions(userId, profile);

    const breakdown = {
      high: contradictions.filter((c) => c.severity === 'high').length,
      medium: contradictions.filter((c) => c.severity === 'medium').length,
      low: contradictions.filter((c) => c.severity === 'low').length,
    };

    return NextResponse.json({
      success: true,
      userId,
      contradictions,
      totalDetected: contradictions.length,
      breakdown,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[analyze/trigger] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'healthy', service: 'Contradiction Analyzer' });
}
