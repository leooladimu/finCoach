// Myers-Briggs Type Indicator dimensions
export type EI = 'E' | 'I'; // Extraversion vs Introversion
export type SN = 'S' | 'N'; // Sensing vs Intuition
export type TF = 'T' | 'F'; // Thinking vs Feeling
export type JP = 'J' | 'P'; // Judging vs Perceiving

export type MBTIType = `${EI}${SN}${TF}${JP}`;

export interface MBTIScores {
  EI: number; // -10 to +10 (negative = I, positive = E)
  SN: number; // -10 to +10 (negative = S, positive = N)
  TF: number; // -10 to +10 (negative = T, positive = F)
  JP: number; // -10 to +10 (negative = J, positive = P)
}

// User profile stored in Vercel KV
export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  
  // Money Style (disguised MBTI)
  moneyStyle?: {
    type: MBTIType;
    scores: MBTIScores;
    assessmentDate: string;
  };
  
  // Life context
  lifeContext?: {
    age?: number;
    income?: number;
    dependents?: number;
    employmentStatus?: string;
    location?: string;
  };
  
  // Stated preferences
  statedPreferences?: {
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    savingsGoal?: number;
    investmentStyle?: 'passive' | 'active';
    priorityGoals?: string[];
  };
}

// Financial snapshot from Plaid
export interface FinancialSnapshot {
  timestamp: string;
  accounts: Account[];
  transactions: Transaction[];
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
  balance: number;
  institution: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  accountId: string;
}

// Behavioral tracking
export interface BehaviorAction {
  timestamp: string;
  type: 'transaction' | 'goal_set' | 'goal_complete' | 'plan_execute' | 'app_interaction';
  data: Record<string, unknown>;
  metadata?: {
    emotionalState?: string;
    timeOfDay?: string;
    context?: string;
  };
}

// Contradiction detection
export interface Contradiction {
  id: string;
  detectedAt: string;
  type: 'stated_vs_actual' | 'goal_vs_behavior' | 'plan_vs_execution' | 'spending_pattern' | 'positive_pattern';
  severity: 'low' | 'medium' | 'high';
  title?: string; // Human-readable title
  description?: string; // Detailed description
  emoji?: string; // Visual indicator
  
  stated: {
    description: string;
    source: string; // 'assessment' | 'goal_setting' | 'plan' | 'financial_best_practices'
    value: string | number | boolean;
  };
  
  actual: {
    description: string;
    evidence: string[]; // References to transactions, actions, etc.
    value: string | number | boolean;
  };
  
  hypothesis?: string;
  experiment?: string;
  suggestion?: string; // Actionable recommendation
  potentialSavings?: number; // Estimated monthly savings if addressed
  resolved: boolean;
  resolution?: {
    date: string;
    outcome: 'preference_adjusted' | 'behavior_changed' | 'context_explained';
    notes: string;
  };
}

// Assessment question structure
export interface AssessmentQuestion {
  id: number;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  questionText: string;
  options: AssessmentOption[];
}

export interface AssessmentOption {
  text: string;
  score: number; // Can be -1, 0, or +1
  description: string; // Hidden explanation of what it measures
}

// API responses
export interface AssessmentResult {
  type: MBTIType;
  scores: MBTIScores;
  moneyStyleDescription: string;
  coachingApproach: string;
}

export interface RecommendationResponse {
  mode: 'goals' | 'behavior' | 'plan';
  recommendations: Recommendation[];
  personalityAdaptation: string;
  contradictions?: Contradiction[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  steps?: string[];
  estimatedImpact?: string;
}

// Coaching tone/style based on MBTI
export interface CoachingStyle {
  tone: string; // 'direct' | 'supportive' | 'analytical' | 'inspirational'
  focusAreas: string[];
  communicationPreferences: string[];
  motivationalTriggers: string[];
}
