import { NextRequest, NextResponse } from 'next/server';
import type { MBTIScores, MBTIType, AssessmentResult } from '@/types';
// import { updateUserProfile } from '@/lib/kv';
import { moneyStyleDescriptions, coachingApproaches } from '@/lib/assessment';

// In-memory rate limiting (for production, use Redis or similar)
const submissionTracker = new Map<string, number[]>();
const MAX_SUBMISSIONS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts?: number; retryAfter?: number } {
  const now = Date.now();
  const submissions = submissionTracker.get(identifier) || [];
  
  // Remove submissions older than the rate limit window
  const recentSubmissions = submissions.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR) {
    const oldestSubmission = Math.min(...recentSubmissions);
    const retryAfter = Math.ceil((oldestSubmission + RATE_LIMIT_WINDOW - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Update tracker
  recentSubmissions.push(now);
  submissionTracker.set(identifier, recentSubmissions);
  
  return { 
    allowed: true, 
    remainingAttempts: MAX_SUBMISSIONS_PER_HOUR - recentSubmissions.length 
  };
}

// Calculate MBTI type from scores
function calculateMBTIType(scores: MBTIScores): MBTIType {
  const E_or_I = scores.EI >= 0 ? 'E' : 'I';
  const S_or_N = scores.SN >= 0 ? 'N' : 'S';
  const T_or_F = scores.TF >= 0 ? 'F' : 'T';
  const J_or_P = scores.JP >= 0 ? 'P' : 'J';
  
  return `${E_or_I}${S_or_N}${T_or_F}${J_or_P}` as MBTIType;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, answers } = body;
    
    // Validation 1: Check required fields
    if (!userId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and answers' },
        { status: 400 }
      );
    }

    // Validation 2: Check answer count
    if (!Array.isArray(answers) || answers.length !== 20) {
      return NextResponse.json(
        { error: `Invalid answer count: expected 20, received ${answers?.length || 0}` },
        { status: 400 }
      );
    }

    // Validation 3: Validate answer structure and values
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      
      if (typeof answer.questionId !== 'number') {
        return NextResponse.json(
          { error: `Invalid answer ${i}: questionId must be a number` },
          { status: 400 }
        );
      }

      if (typeof answer.dimension !== 'string' || !['EI', 'SN', 'TF', 'JP'].includes(answer.dimension)) {
        return NextResponse.json(
          { error: `Invalid answer ${i}: dimension must be one of EI, SN, TF, JP` },
          { status: 400 }
        );
      }

      if (typeof answer.score !== 'number' || answer.score < -2 || answer.score > 2) {
        return NextResponse.json(
          { error: `Invalid answer ${i}: score must be a number between -2 and 2` },
          { status: 400 }
        );
      }
    }

    // Validation 4: Check for duplicate question IDs
    const questionIds = answers.map((a: { questionId: number }) => a.questionId);
    const uniqueIds = new Set(questionIds);
    if (questionIds.length !== uniqueIds.size) {
      return NextResponse.json(
        { error: 'Duplicate question IDs detected' },
        { status: 400 }
      );
    }

    // Validation 5: Ensure all dimensions are covered
    const dimensions = answers.map((a: { dimension: string }) => a.dimension);
    const requiredDimensions = ['EI', 'SN', 'TF', 'JP'];
    const missingDimensions = requiredDimensions.filter(
      d => !dimensions.includes(d)
    );
    if (missingDimensions.length > 0) {
      return NextResponse.json(
        { error: `Missing required dimensions: ${missingDimensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Rate Limiting: Check submission rate
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimitIdentifier = `${userId}-${clientIp}`;
    const rateLimitCheck = checkRateLimit(rateLimitIdentifier);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Too many submissions. Please try again in ${rateLimitCheck.retryAfter} seconds.`,
          retryAfter: rateLimitCheck.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitCheck.retryAfter?.toString() || '3600',
            'X-RateLimit-Limit': MAX_SUBMISSIONS_PER_HOUR.toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }
    
    // Calculate scores from answers
    // answers is an array of { questionId, dimension, score }
    const scores: MBTIScores = {
      EI: 0,
      SN: 0,
      TF: 0,
      JP: 0,
    };
    
    answers.forEach((answer: { questionId: number; dimension: string; score: number }) => {
      const dimension = answer.dimension as keyof MBTIScores;
      scores[dimension] += answer.score;
    });
    
    // Determine MBTI type
    const type = calculateMBTIType(scores);
    
    // Get descriptions
    const moneyStyleDescription = moneyStyleDescriptions[type] || 'Your unique money style';
    const coachingApproach = coachingApproaches[type] || 'Personalized coaching approach';
    
    // Save to user profile (TODO: Enable when Vercel KV is configured)
    // await updateUserProfile(userId, {
    //   moneyStyle: {
    //     type,
    //     scores,
    //     assessmentDate: new Date().toISOString(),
    //   },
    // });
    
    const result: AssessmentResult = {
      type,
      scores,
      moneyStyleDescription,
      coachingApproach,
    };
    
    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Limit': MAX_SUBMISSIONS_PER_HOUR.toString(),
        'X-RateLimit-Remaining': (rateLimitCheck.remainingAttempts || 0).toString(),
      }
    });
  } catch (error) {
    console.error('Assessment error:', error);
    
    // Provide more specific error messages
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON format in request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process assessment. Please try again.' },
      { status: 500 }
    );
  }
}
