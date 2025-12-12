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
      // Use real userId if available, otherwise use demo userId for local dev
      const effectiveUserId = userId || 'demo-user-local';
      
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
      
      // Save to KV
      await updateUserProfile(effectiveUserId, {
        moneyStyle: {
          type: assessmentResult.type,
          scores: assessmentResult.scores,
          assessmentDate: new Date().toISOString(),
        },
      });
      
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
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-red-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gradient-to-br from-stone-50/95 to-amber-50/90 backdrop-blur-sm rounded-lg shadow-2xl border-4 border-double border-amber-800/40 p-8 relative">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-amber-800/30 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-amber-800/30 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-amber-800/30 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-amber-800/30 rounded-br-lg" />
          <div className="text-center mb-8 relative z-10">
            <div className="inline-block bg-gradient-to-br from-amber-100 to-stone-100 rounded-full p-4 mb-4 border-2 border-amber-700/50 shadow-lg">
              <svg
                className="w-12 h-12 text-amber-900"
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
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
              Your Money Style: {result.type}
            </h1>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="bg-gradient-to-br from-amber-100/70 to-stone-100/60 rounded-lg p-6 border-2 border-amber-700/40 relative">
              <div className="absolute top-2 right-2 text-xs text-amber-800/30">❖</div>
              <h2 className="text-lg font-serif font-semibold text-stone-900 mb-2">
                What This Means
              </h2>
              <p className="text-stone-800/90 leading-relaxed">{result.moneyStyleDescription}</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-100/60 to-amber-100/60 rounded-lg p-6 border-2 border-red-800/40 relative">
              <div className="absolute top-2 right-2 text-xs text-red-800/30">❖</div>
              <h2 className="text-lg font-serif font-semibold text-red-950 mb-2">
                How We&apos;ll Work Together
              </h2>
              <p className="text-red-900/90 leading-relaxed">{result.coachingApproach}</p>
            </div>
            
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 text-stone-50 py-4 rounded-lg font-serif font-semibold hover:from-amber-950 hover:via-red-950 hover:to-amber-950 transition-all shadow-lg border-2 border-amber-950/40"
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
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-900 mx-auto mb-4"></div>
          <p className="text-stone-800 text-lg font-serif italic">Analyzing your Money Style...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B4513' fill-opacity='1'%3E%3Cpath d='M0 0h80v1H0zM0 20h80v1H0zM0 40h80v1H0zM0 60h80v1H0z'/%3E%3Cpath d='M0 0v80h1V0zM20 0v80h1V0zM40 0v80h1V0zM60 0v80h1V0z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px'
      }} />
      
      <div className="max-w-3xl w-full relative z-10">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-serif text-stone-800">
              Question {currentQuestion + 1} of {assessmentQuestions.length}
            </span>
            <span className="text-sm font-serif text-stone-700/70 italic">
              ~{Math.ceil((assessmentQuestions.length - currentQuestion - 1) * 9)}s remaining
            </span>
          </div>
          <div className="w-full bg-stone-200/60 rounded-full h-3 shadow-inner border border-amber-800/30">
            <div
              className="bg-gradient-to-r from-amber-800 via-red-900 to-amber-800 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Question card */}
        <div className="bg-gradient-to-br from-stone-50/95 to-amber-50/90 backdrop-blur-sm rounded-lg shadow-2xl border-4 border-double border-amber-800/40 p-8 relative">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-amber-800/30 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-amber-800/30 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-amber-800/30 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-amber-800/30 rounded-br-lg" />
          
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8 leading-relaxed relative z-10">
            {question.questionText}
          </h2>
          
          <div className="space-y-4 relative z-10">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left p-6 rounded-lg border-2 border-amber-700/40 hover:border-amber-800/70 hover:bg-gradient-to-r hover:from-amber-100/70 hover:to-stone-100/60 transition-all duration-200 group relative"
              >
                <div className="absolute top-2 right-2 text-xs text-amber-800/20 group-hover:text-amber-800/40">❖</div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-amber-700/50 group-hover:border-amber-900 mr-4 bg-stone-100/80" />
                  <span className="text-lg text-stone-900 group-hover:text-red-950 font-light leading-relaxed">
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Info text */}
        <p className="text-center text-stone-700/70 mt-6 text-sm font-light italic">
          Choose the option that feels most natural to you. There are no right or wrong answers.
        </p>
      </div>
    </div>
  );
}
