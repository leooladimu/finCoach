import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * API Route: /api/analyze/trigger
 * 
 * Invokes AWS Lambda function to detect behavioral contradictions
 * 
 * Methods:
 * - POST: Trigger contradiction analysis for a user
 * 
 * Request Body:
 * {
 *   userId: string;
 *   timeRange?: 'week' | 'month' | 'year';
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   contradictions: Contradiction[];
 *   breakdown: { high: number; medium: number; low: number };
 *   timestamp: string;
 * }
 */

// TODO: Install AWS SDK with: npm install @aws-sdk/client-lambda
// Uncomment when ready to deploy:
// import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

export async function POST(req: NextRequest) {
  try {
    const { userId, timeRange = 'month' } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // ============================================================================
    // PHASE 1: Mock Response (Current - for development without AWS)
    // ============================================================================
    
    console.log(`[Lambda Mock] Analyzing contradictions for user: ${userId}, range: ${timeRange}`);
    
    // Return mock data for now
    const mockResponse = {
      success: true,
      userId,
      contradictions: [
        {
          id: 'dining-overspending',
          type: 'spending-vs-goal',
          severity: 'high' as const,
          emoji: '🍽️',
          title: 'Dining Spending vs Savings Goal',
          description: 'Your dining expenses are significantly higher than recommended for someone saving for a house down payment.',
          stated: {
            label: 'Primary Goal',
            value: 'Save $50,000 for house down payment'
          },
          actual: {
            label: 'Monthly Dining',
            value: '$850 (should be ~$300)'
          },
          suggestion: 'Consider meal prepping 3x/week. This could save you $550/month toward your goal.',
          potentialSavings: 550
        },
        {
          id: 'impulse-shopping',
          type: 'personality-alignment',
          severity: 'medium' as const,
          emoji: '🛍️',
          title: 'Small Impulse Purchases',
          description: 'As an INTJ (Judger), you prefer structure and planning. However, 45% of your transactions are small, unplanned purchases under $20.',
          stated: {
            label: 'Money Style',
            value: 'Structured planner (J type)'
          },
          actual: {
            label: 'Spending Pattern',
            value: '15 impulse buys this month'
          },
          suggestion: 'Try a "24-hour rule" for purchases under $50. This aligns better with your planning strengths and could save $200/month.',
          potentialSavings: 200
        },
        {
          id: 'goal-progress',
          type: 'goal-progress',
          severity: 'high' as const,
          emoji: '🎯',
          title: 'House Fund Behind Schedule',
          description: 'To reach your $50,000 goal by Dec 2025, you need to save $3,167/month. Currently averaging $1,800/month.',
          stated: {
            label: 'Target Progress',
            value: '$3,167/month needed'
          },
          actual: {
            label: 'Current Progress',
            value: '$1,800/month (57% of target)'
          },
          suggestion: 'You\'re $1,367/month short. Reducing dining ($550) and shopping ($200) gets you 55% closer. Consider a side project for the remaining gap.',
          potentialSavings: 1367
        }
      ],
      analysisTimestamp: new Date().toISOString(),
      totalDetected: 3,
      breakdown: {
        high: 2,
        medium: 1,
        low: 0
      }
    };

    return NextResponse.json(mockResponse);

    // ============================================================================
    // PHASE 2: Real AWS Lambda Integration (Uncomment when ready)
    // ============================================================================
    
    /*
    // Fetch user data from localStorage/Vercel KV
    // For now, we'll use mock data. In production, fetch from Vercel KV:
    // const profile = await kv.hgetall(`user:${userId}:profile`);
    // const transactions = await kv.lrange(`user:${userId}:transactions`, 0, -1);
    // const goals = await kv.lrange(`user:${userId}:goals`, 0, -1);
    
    const profile = {
      type: 'INTJ',
      scores: { EI: -5, SN: 3, TF: 4, JP: 6 },
      statedPreferences: {
        riskTolerance: 'moderate',
        savingsGoal: 50000,
        priorityGoals: ['Buy a house', 'Build emergency fund'],
        spendingStyle: 'planner'
      }
    };

    const transactions = [
      // Sample transactions - replace with real data from Plaid/KV
      { id: '1', date: '2024-12-01', amount: 2100, category: 'Housing', merchant: 'Rent Payment' },
      // ... more transactions
    ];

    const goals = [
      {
        id: 'house-downpayment',
        title: 'House Down Payment',
        targetAmount: 50000,
        currentAmount: 12000,
        targetDate: '2025-12-31',
        category: 'savings'
      }
    ];

    // Initialize Lambda client
    const lambda = new LambdaClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Prepare Lambda event
    const lambdaEvent = {
      userId,
      profile,
      transactions,
      goals,
      timeRange,
    };

    // Invoke Lambda function
    const command = new InvokeCommand({
      FunctionName: process.env.LAMBDA_FUNCTION_NAME || 'fincoach-contradiction-detector',
      Payload: JSON.stringify(lambdaEvent),
    });

    console.log(`[Lambda] Invoking function for user: ${userId}, range: ${timeRange}`);

    const response = await lambda.send(command);
    
    // Parse response
    const payload = JSON.parse(new TextDecoder().decode(response.Payload));
    const body = JSON.parse(payload.body);

    // Store results in Vercel KV (optional - for caching)
    // await kv.hset(`user:${userId}:contradictions`, {
    //   contradictions: body.contradictions,
    //   lastAnalysis: body.analysisTimestamp,
    //   breakdown: body.breakdown
    // });

    console.log(`[Lambda] Analysis complete: ${body.totalDetected} contradictions detected`);

    return NextResponse.json(body);
    */

  } catch (error) {
    console.error('[Lambda] Error triggering analysis:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to trigger analysis'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    status: 'healthy',
    service: 'Lambda Contradiction Analyzer',
    version: '1.0.0',
    phase: 'mock', // Change to 'production' when AWS integration is live
    endpoints: {
      POST: '/api/analyze/trigger - Trigger contradiction analysis'
    }
  });
}
