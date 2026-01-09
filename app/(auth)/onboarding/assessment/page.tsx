'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentQuestions } from '@/lib/assessment';
import type { AssessmentResult } from '@/types';
import { useUser } from '@/lib/hooks/useUser';
import { updateUserProfile } from '@/lib/kv';

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'error' | 'success'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`glass rounded-xl p-4 pr-12 border flex items-start gap-3 min-w-[320px] ${
        type === 'error' 
          ? 'border-red-500/30 bg-red-500/10' 
          : 'border-emerald-500/30 bg-emerald-500/10'
      }`}>
        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          {type === 'error' ? (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <p className="text-white text-sm">{message}</p>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const STORAGE_KEY = 'fincoach-assessment-progress';
const RATE_LIMIT_KEY = 'fincoach-assessment-last-submit';
const RATE_LIMIT_COOLDOWN = 60000; // 1 minute cooldown between submissions

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
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { currentQuestion: savedQuestion, answers: savedAnswers } = JSON.parse(saved);
        if (savedQuestion > 0) {
          setCurrentQuestion(savedQuestion);
          setAnswers(savedAnswers);
          setToast({ message: 'Welcome back! Your progress has been restored.', type: 'success' });
        }
      } catch (e) {
        console.error('Failed to restore progress:', e);
      }
    }
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    if (answers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentQuestion, answers }));
    }
  }, [currentQuestion, answers]);
  
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

  const handleBack = () => {
    if (currentQuestion > 0) {
      // Remove the last answer and go back one question
      setAnswers(answers.slice(0, -1));
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const submitAssessment = async (finalAnswers: typeof answers) => {
    setIsSubmitting(true);
    
    try {
      // Validation 1: Check if all questions are answered
      if (finalAnswers.length !== assessmentQuestions.length) {
        throw new Error(`Incomplete assessment: ${finalAnswers.length}/${assessmentQuestions.length} questions answered`);
      }

      // Validation 2: Verify answer structure
      const invalidAnswers = finalAnswers.filter(answer => 
        typeof answer.questionId !== 'number' ||
        typeof answer.dimension !== 'string' ||
        typeof answer.score !== 'number' ||
        answer.score < 0 || 
        answer.score > 3
      );

      if (invalidAnswers.length > 0) {
        throw new Error('Invalid answer format detected. Please refresh and try again.');
      }

      // Validation 3: Check for duplicate question IDs
      const questionIds = finalAnswers.map(a => a.questionId);
      const uniqueIds = new Set(questionIds);
      if (questionIds.length !== uniqueIds.size) {
        throw new Error('Duplicate answers detected. Please refresh and retake the assessment.');
      }

      // Validation 4: Ensure all dimensions are covered
      const requiredDimensions = ['EI', 'SN', 'TF', 'JP'];
      const answeredDimensions = new Set(finalAnswers.map(a => a.dimension));
      const missingDimensions = requiredDimensions.filter(d => !answeredDimensions.has(d));
      if (missingDimensions.length > 0) {
        throw new Error(`Missing required dimensions: ${missingDimensions.join(', ')}`);
      }

      // Rate Limiting: Check last submission time
      const lastSubmitTime = localStorage.getItem(RATE_LIMIT_KEY);
      if (lastSubmitTime) {
        const timeSinceLastSubmit = Date.now() - parseInt(lastSubmitTime);
        if (timeSinceLastSubmit < RATE_LIMIT_COOLDOWN) {
          const remainingSeconds = Math.ceil((RATE_LIMIT_COOLDOWN - timeSinceLastSubmit) / 1000);
          throw new Error(`Please wait ${remainingSeconds} seconds before submitting again.`);
        }
      }

      // Record this submission attempt
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Special handling for rate limit errors
        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 60;
          throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
        }
        
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      const assessmentResult: AssessmentResult = await response.json();
      
      // Log rate limit headers for debugging
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      if (rateLimitRemaining && parseInt(rateLimitRemaining) <= 2) {
        console.warn(`Low rate limit remaining: ${rateLimitRemaining} submissions left`);
      }
      
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
      
      // Clear saved progress after successful submission
      localStorage.removeItem(STORAGE_KEY);
      setResult(assessmentResult);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to submit assessment. Please check your connection and try again.';
      setToast({ message: errorMessage, type: 'error' });
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
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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

          {/* Back button */}
          {currentQuestion > 0 && (
            <button
              onClick={handleBack}
              className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-xl font-medium transition-all border border-white/10 hover:border-white/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Question
            </button>
          )}
        </div>
        
        {/* Info text */}
        <p className="text-center text-neutral-500 mt-6 text-sm">
          Choose the option that feels most natural to you. There are no right or wrong answers.
        </p>
      </div>
    </div>
  );
}
