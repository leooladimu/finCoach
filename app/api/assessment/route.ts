import { NextRequest, NextResponse } from 'next/server';
import type { MBTIScores, MBTIType, AssessmentResult } from '@/types';
// import { updateUserProfile } from '@/lib/kv';
import { moneyStyleDescriptions, coachingApproaches } from '@/lib/assessment';

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
    
    if (!userId || !answers || answers.length !== 20) {
      return NextResponse.json(
        { error: 'Invalid request: userId and 20 answers required' },
        { status: 400 }
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
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    );
  }
}
