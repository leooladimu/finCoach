"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { assessmentQuestions } from "@/lib/assessment";
import type { AssessmentResult } from "@/types";
import { useUser } from "@/lib/hooks/useUser";
import { updateUserProfileAction } from "@/lib/actions";

// Toast notification component
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto z-50 animate-in slide-in-from-top-2 duration-300">
      <div
        className={`glass rounded-xl p-4 pr-12 border flex items-start gap-3 w-full md:min-w-[320px] md:max-w-md ${
          type === "error"
            ? "border-red-500/30 bg-red-500/10"
            : "border-emerald-500/30 bg-emerald-500/10"
        }`}
      >
        <div
          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
            type === "error" ? "bg-red-500" : "bg-emerald-500"
          }`}
        >
          {type === "error" ? (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <p className="text-white text-sm flex-1">{message}</p>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors touch-manipulation"
          aria-label="Close notification"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

const STORAGE_KEY = "fincoach-assessment-progress";
const RATE_LIMIT_KEY = "fincoach-assessment-last-submit";
const RATE_LIMIT_COOLDOWN = 60000; // 1 minute cooldown between submissions

export default function AssessmentPage() {
  const router = useRouter();
  const { userId } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<
    Array<{
      questionId: number;
      dimension: string;
      score: number;
    }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  // Refs for focus management
  const questionCardRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Detect slow connection
  useEffect(() => {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const connection = (
        navigator as Navigator & {
          connection?: EventTarget & {
            effectiveType?: string;
            saveData?: boolean;
          };
        }
      ).connection;
      if (connection) {
        const checkConnection = () => {
          // Consider 2G or slow-2g as slow
          const isSlow =
            connection.effectiveType === "2g" ||
            connection.effectiveType === "slow-2g" ||
            connection.saveData === true;
          setIsSlowConnection(isSlow);
        };

        checkConnection();
        connection.addEventListener("change", checkConnection);

        return () => {
          connection.removeEventListener("change", checkConnection);
        };
      }
    }
  }, []);

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { currentQuestion: savedQuestion, answers: savedAnswers } =
          JSON.parse(saved);
        // Validate saved state before restoring
        if (
          savedQuestion > 0 &&
          savedQuestion < assessmentQuestions.length &&
          Array.isArray(savedAnswers) &&
          savedAnswers.length <= assessmentQuestions.length
        ) {
          setCurrentQuestion(savedQuestion);
          setAnswers(savedAnswers);
          setToast({
            message: "Welcome back! Your progress has been restored.",
            type: "success",
          });
        } else {
          // Invalid saved state, clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.error("Failed to restore progress:", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    if (answers.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentQuestion, answers }),
      );
    }
  }, [currentQuestion, answers]);

  // Safety check: Ensure currentQuestion is within bounds
  const safeCurrentQuestion = Math.min(
    currentQuestion,
    assessmentQuestions.length - 1,
  );
  const question = assessmentQuestions[safeCurrentQuestion];
  const progress =
    ((safeCurrentQuestion + 1) / assessmentQuestions.length) * 100;

  // Reset focus to first option when question changes
  useEffect(() => {
    setFocusedOptionIndex(0);
    // Focus the question card for screen readers to announce the new question
    if (questionCardRef.current) {
      questionCardRef.current.focus();
    }
  }, [currentQuestion]);

  // Focus the selected option after render
  useEffect(() => {
    if (optionRefs.current[focusedOptionIndex]) {
      optionRefs.current[focusedOptionIndex]?.focus();
    }
  }, [focusedOptionIndex]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const optionsCount = question.options.length;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          setFocusedOptionIndex((prev) => (prev + 1) % optionsCount);
          break;

        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          setFocusedOptionIndex(
            (prev) => (prev - 1 + optionsCount) % optionsCount,
          );
          break;

        case "Enter":
        case " ":
          e.preventDefault();
          handleAnswer(focusedOptionIndex);
          break;

        case "Backspace":
          if (currentQuestion > 0 && !e.shiftKey) {
            e.preventDefault();
            handleBack();
          }
          break;

        case "1":
        case "2":
        case "3":
        case "4":
          e.preventDefault();
          const numIndex = parseInt(e.key) - 1;
          if (numIndex < optionsCount) {
            handleAnswer(numIndex);
          }
          break;
      }
    },
    [focusedOptionIndex, currentQuestion, question.options.length],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = async (optionIndex: number) => {
    // Prevent multiple submissions or answers beyond the last question
    if (isSubmitting || answers.length >= assessmentQuestions.length) {
      console.log("handleAnswer blocked:", {
        isSubmitting,
        answersLength: answers.length,
        questionsLength: assessmentQuestions.length,
      });
      return;
    }

    const selectedOption = question.options[optionIndex];
    const newAnswer = {
      questionId: question.id,
      dimension: question.dimension,
      score: selectedOption.score,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // Save progress to localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentQuestion: currentQuestion + 1,
        answers: updatedAnswers,
      }),
    );

    // Move to next question or submit
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setFocusedOptionIndex(0); // Reset focus for next question
    } else {
      // Submit assessment - this is the final (20th) question
      console.log(
        "Submitting assessment with",
        updatedAnswers.length,
        "answers",
      );
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
        throw new Error(
          `Incomplete assessment: ${finalAnswers.length}/${assessmentQuestions.length} questions answered`,
        );
      }

      // Validation 2: Verify answer structure
      const invalidAnswers = finalAnswers.filter(
        (answer) =>
          typeof answer.questionId !== "number" ||
          typeof answer.dimension !== "string" ||
          typeof answer.score !== "number" ||
          answer.score < -2 ||
          answer.score > 2,
      );

      if (invalidAnswers.length > 0) {
        console.error("Invalid answers:", invalidAnswers);
        throw new Error(
          "Invalid answer format detected. Please refresh and try again.",
        );
      }

      // Validation 3: Check for duplicate question IDs
      const questionIds = finalAnswers.map((a) => a.questionId);
      const uniqueIds = new Set(questionIds);
      if (questionIds.length !== uniqueIds.size) {
        throw new Error(
          "Duplicate answers detected. Please refresh and retake the assessment.",
        );
      }

      // Validation 4: Ensure all dimensions are covered
      const requiredDimensions = ["EI", "SN", "TF", "JP"];
      const answeredDimensions = new Set(finalAnswers.map((a) => a.dimension));
      const missingDimensions = requiredDimensions.filter(
        (d) => !answeredDimensions.has(d),
      );
      if (missingDimensions.length > 0) {
        throw new Error(
          `Missing required dimensions: ${missingDimensions.join(", ")}`,
        );
      }

      // Rate Limiting: Check last submission time
      const lastSubmitTime = localStorage.getItem(RATE_LIMIT_KEY);
      if (lastSubmitTime) {
        const timeSinceLastSubmit = Date.now() - parseInt(lastSubmitTime);
        if (timeSinceLastSubmit < RATE_LIMIT_COOLDOWN) {
          const remainingSeconds = Math.ceil(
            (RATE_LIMIT_COOLDOWN - timeSinceLastSubmit) / 1000,
          );
          throw new Error(
            `Please wait ${remainingSeconds} seconds before submitting again.`,
          );
        }
      }

      // Record this submission attempt
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

      // Use real userId if available, fallback to demo user
      const effectiveUserId = userId || "demo-user-" + Date.now();

      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          answers: finalAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));

        // Special handling for rate limit errors
        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 60;
          throw new Error(
            `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          );
        }

        throw new Error(
          errorData.error || `Request failed with status ${response.status}`,
        );
      }

      const assessmentResult: AssessmentResult = await response.json();

      // Log rate limit headers for debugging
      const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
      if (rateLimitRemaining && parseInt(rateLimitRemaining) <= 2) {
        console.warn(
          `Low rate limit remaining: ${rateLimitRemaining} submissions left`,
        );
      }

      // Save to KV only if we have a real userId
      if (userId) {
        await updateUserProfileAction(userId, {
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
      setIsSubmitting(false); // Important: Reset submitting state to show results

      // Auto-redirect to goals after 2 seconds to show results briefly
      setTimeout(() => {
        router.push("/goals");
      }, 2000);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit assessment. Please check your connection and try again.";
      setToast({ message: errorMessage, type: "error" });
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    router.push("/goals");
  };

  if (result) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div
          className="max-w-2xl w-full glass rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10"
          role="region"
          aria-labelledby="results-heading"
        >
          <div className="text-center mb-6 sm:mb-8">
            <div
              className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 sm:mb-6"
              role="img"
              aria-label="Success"
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1
              id="results-heading"
              className="text-2xl sm:text-3xl font-semibold text-white mb-2"
            >
              Your Money Style:{" "}
              <span className="gradient-text">{result.type}</span>
            </h1>
          </div>

          <div className="space-y-3 sm:space-y-4" role="list">
            <div
              className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:border-emerald-500/30 transition-all"
              role="listitem"
            >
              <h2 className="text-base sm:text-lg font-medium text-white mb-2 sm:mb-3">
                What This Means
              </h2>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                {result.moneyStyleDescription}
              </p>
            </div>

            <div
              className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:border-blue-500/30 transition-all"
              role="listitem"
            >
              <h2 className="text-base sm:text-lg font-medium text-white mb-2 sm:mb-3">
                How We&apos;ll Work Together
              </h2>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                {result.coachingApproach}
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white py-3 sm:py-4 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 touch-manipulation active:scale-[0.98]"
              aria-label="Continue to your personalized dashboard"
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div
          className="text-center max-w-md w-full"
          role="status"
          aria-live="polite"
          aria-label="Analyzing your responses"
        >
          <div
            className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6"
            aria-hidden="true"
          >
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin"></div>
          </div>
          <p className="text-neutral-400 text-base sm:text-lg mb-2">
            Analyzing your Money Style...
          </p>
          {isSlowConnection ? (
            <p className="text-amber-500 text-sm flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Slow connection detected - this may take longer
            </p>
          ) : (
            <p className="text-neutral-600 text-sm">
              This usually takes just a few seconds
            </p>
          )}
          <span className="sr-only">
            Please wait while we analyze your assessment responses.
          </span>

          {/* Progress dots animation */}
          <div className="flex justify-center gap-1.5 mt-6" aria-hidden="true">
            <div
              className="w-2 h-2 rounded-full bg-emerald-500/40 animate-pulse"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-emerald-500/40 animate-pulse"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-emerald-500/40 animate-pulse"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
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
        <div className="mb-8" role="region" aria-label="Assessment progress">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-neutral-400" aria-current="step">
              Question {safeCurrentQuestion + 1} of {assessmentQuestions.length}
            </span>
            <span className="text-sm text-neutral-500" aria-live="polite">
              ~
              {Math.ceil(
                (assessmentQuestions.length - safeCurrentQuestion - 1) * 9,
              )}
              s remaining
            </span>
          </div>
          <div
            className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden"
            role="progressbar"
            aria-valuenow={safeCurrentQuestion + 1}
            aria-valuemin={1}
            aria-valuemax={assessmentQuestions.length}
            aria-label={`Assessment progress: question ${safeCurrentQuestion + 1} of ${assessmentQuestions.length}`}
          >
            <div
              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-1 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div
          ref={questionCardRef}
          className="glass rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10"
          role="group"
          aria-labelledby="question-text"
          aria-describedby="question-instructions"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <h2
            id="question-text"
            className="text-xl sm:text-2xl font-medium text-white mb-6 sm:mb-8 leading-relaxed"
            role="heading"
            aria-level={1}
          >
            {question.questionText}
          </h2>

          <div
            className="space-y-2 sm:space-y-3"
            role="radiogroup"
            aria-labelledby="question-text"
            aria-required="true"
          >
            {question.options.map((option, index) => (
              <button
                key={index}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                onClick={() => handleAnswer(index)}
                onFocus={() => setFocusedOptionIndex(index)}
                className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 group touch-manipulation active:scale-[0.98] ${
                  focusedOptionIndex === index
                    ? "border-emerald-500 bg-white/5 ring-2 ring-emerald-500/30"
                    : "border-white/10 hover:border-emerald-500/50 hover:bg-white/5 active:border-emerald-500"
                }`}
                role="radio"
                aria-checked={focusedOptionIndex === index}
                aria-label={`Option ${index + 1}: ${option.text}`}
                tabIndex={focusedOptionIndex === index ? 0 : -1}
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-3 sm:mr-4 transition-colors ${
                      focusedOptionIndex === index
                        ? "border-emerald-500 bg-emerald-500/20"
                        : "border-neutral-600 group-hover:border-emerald-500 group-active:border-emerald-500"
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-base sm:text-lg transition-colors ${
                      focusedOptionIndex === index
                        ? "text-white font-medium"
                        : "text-neutral-300 group-hover:text-white group-active:text-white"
                    }`}
                  >
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
              className="mt-4 sm:mt-6 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 active:bg-white/15 text-neutral-300 hover:text-white rounded-xl font-medium transition-all border border-white/10 hover:border-white/20 flex items-center gap-2 touch-manipulation active:scale-[0.98]"
              aria-label="Go back to previous question"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous Question
            </button>
          )}
        </div>

        {/* Info text */}
        <p
          id="question-instructions"
          className="text-center text-neutral-500 mt-6 text-sm"
          role="note"
          aria-live="polite"
        >
          Choose the option that feels most natural to you. There are no right
          or wrong answers.
          <span className="sr-only">
            {" "}
            Use arrow keys to navigate, Enter or Space to select, or press 1-
            {question.options.length} to choose directly.
            {currentQuestion > 0 && " Press Backspace to go back."}
          </span>
        </p>

        {/* Debug info and reset button */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-600 mb-2">
            Debug: {answers.length} answers | Question {currentQuestion} |{" "}
            {isSubmitting ? "Submitting..." : "Ready"}
          </p>
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(RATE_LIMIT_KEY);
              window.location.reload();
            }}
            className="text-xs text-neutral-500 hover:text-neutral-300 underline"
          >
            Reset Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
