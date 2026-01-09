'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentQuestions } from '@/lib/assessment';
import type { AssessmentResult } from '@/types';
import { useUser } from '@/lib/hooks/useUser';
import { updateUserProfile } from '@/lib/kv';

export default function AssessmentPage() {
  const router = useRouter();
  const { userId } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    questionId: number;
    dimension: string;
    score: number;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  
  const question = assessmentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;
  
  const handleAnswer = async (optionIndex: number) => {
    const selectedOption = question.options[optionIndex];
    const newAnswer = {
      questionId: question.id,
      dimension: question.dimension,
      score: selectedOption.score,
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    // Move to next question or submit
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit assessment
      await submitAssessment(updatedAnswers);
    }
  };
  
  const submitAssessment = async (finalAnswers: typeof answers) => {
    setIsSubmitting(true);
    
    try {
      // Use real userId if available, fallback to demo user
      const effectiveUserId = userId || 'demo-user-' + Date.now();
      
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          answers: finalAnswers,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Assessment submission failed');
      }
      
      const assessmentResult: AssessmentResult = await response.json();
      
      // Save to KV only if we have a real userId
      if (userId) {
        await updateUserProfile(userId, {
          moneyStyle: {
            type: assessmentResult.type,
            scores: assessmentResult.scores,
            assessmentDate: new Date().toISOString(),
          },
        });
      }
      
      setResult(assessmentResult);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  const handleContinue = () => {
    router.push('/goals');
  };
  
  if (result) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full glass rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              Your Money Style: <span className="gradient-text">{result.type}</span>
            </h1>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all">
              <h2 className="text-lg font-medium text-white mb-3">
                What This Means
              </h2>
              <p className="text-neutral-400 leading-relaxed">{result.moneyStyleDescription}</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-all">
              <h2 className="text-lg font-medium text-white mb-3">
                How We&apos;ll Work Together
              </h2>
              <p className="text-neutral-400 leading-relaxed">{result.coachingApproach}</p>
            </div>
            
            <button
              onClick={handleContinue}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin"></div>
          </div>
          <p className="text-neutral-400 text-lg">Analyzing your Money Style...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-neutral-400">
              Question {currentQuestion + 1} of {assessmentQuestions.length}
            </span>
            <span className="text-sm text-neutral-500">
              ~{Math.ceil((assessmentQuestions.length - currentQuestion - 1) * 9)}s remaining
            </span>
          </div>
          <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-1 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Question card */}
        <div className="glass rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-medium text-white mb-8 leading-relaxed">
            {question.questionText}
          </h2>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left p-5 rounded-xl border border-white/10 hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-neutral-600 group-hover:border-emerald-500 mr-4 transition-colors" />
                  <span className="text-lg text-neutral-300 group-hover:text-white transition-colors">
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Info text */}
        <p className="text-center text-neutral-500 mt-6 text-sm">
          Choose the option that feels most natural to you. There are no right or wrong answers.
        </p>
      </div>
    </div>
  );
}
