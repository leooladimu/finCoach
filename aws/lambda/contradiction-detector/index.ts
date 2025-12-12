/**
 * AWS Lambda Function: Contradiction Detection Engine
 * 
 * Analyzes user financial behavior and detects contradictions between
 * stated preferences (from Money Style assessment) and actual spending patterns.
 * 
 * Triggered by: API Gateway or EventBridge Schedule
 * Returns: Array of detected contradictions with severity levels
 */

interface MoneyStyleProfile {
  type: string; // MBTI type (e.g., 'INTJ')
  scores: {
    EI: number;
    SN: number;
    TF: number;
    JP: number;
  };
  statedPreferences?: {
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    savingsGoal?: number;
    priorityGoals?: string[];
    spendingStyle?: 'planner' | 'spontaneous';
  };
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  description?: string;
}

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
}

interface Contradiction {
  id: string;
  detectedAt: string;
  type: 'stated_vs_actual' | 'goal_vs_behavior' | 'plan_vs_execution';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  stated: {
    description: string;
    source: string;
    value: string | number | boolean;
  };
  actual: {
    description: string;
    evidence: string[];
    value: string | number | boolean;
  };
  suggestion: string;
  emoji: string;
  hypothesis?: string;
  resolved: boolean;
}

interface LambdaEvent {
  userId: string;
  profile: MoneyStyleProfile;
  transactions: Transaction[];
  goals: FinancialGoal[];
  timeRange?: 'week' | 'month' | 'year';
}

interface LambdaResponse {
  statusCode: number;
  body: string;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
  };
}

/**
 * Main Lambda handler
 */
export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  console.log('Contradiction Detection Lambda triggered', { userId: event.userId });

  try {
    const { profile, transactions, goals, timeRange = 'month' } = event;

    // Run all contradiction detection algorithms
    const contradictions: Contradiction[] = [];

    // 1. Spending vs Goals Analysis
    const spendingContradictions = analyzeSpendingVsGoals(transactions, goals, profile);
    contradictions.push(...spendingContradictions);

    // 2. Category Overspending Analysis
    const categoryContradictions = analyzeCategoryPatterns(transactions, timeRange);
    contradictions.push(...categoryContradictions);

    // 3. Personality vs Behavior Analysis
    const personalityContradictions = analyzePersonalityAlignment(profile, transactions);
    contradictions.push(...personalityContradictions);

    // 4. Goal Progress vs Spending Analysis
    const progressContradictions = analyzeGoalProgress(goals, transactions);
    contradictions.push(...progressContradictions);

    // 5. Positive Patterns (Celebrations)
    const positivePatterns = detectPositivePatterns(transactions, goals, profile);
    contradictions.push(...positivePatterns);

    // Sort by severity (high → medium → low)
    const sortedContradictions = contradictions.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    console.log(`Detected ${sortedContradictions.length} contradictions for user ${event.userId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        userId: event.userId,
        contradictions: sortedContradictions,
        analysisTimestamp: new Date().toISOString(),
        totalDetected: sortedContradictions.length,
        breakdown: {
          high: sortedContradictions.filter(c => c.severity === 'high').length,
          medium: sortedContradictions.filter(c => c.severity === 'medium').length,
          low: sortedContradictions.filter(c => c.severity === 'low').length,
        },
      }),
    };
  } catch (error) {
    console.error('Error in contradiction detection:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to analyze contradictions',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

/**
 * Analyze spending patterns vs stated financial goals
 */
function analyzeSpendingVsGoals(
  transactions: Transaction[],
  goals: FinancialGoal[],
  profile: MoneyStyleProfile
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // Calculate discretionary spending
  const discretionaryCategories = ['Entertainment', 'Shopping', 'Dining', 'Travel'];
  const discretionarySpending = transactions
    .filter(t => discretionaryCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
  const discretionaryPercent = (discretionarySpending / totalSpending) * 100;

  // Check if user has savings goals but high discretionary spending
  const savingsGoals = goals.filter(g => 
    g.category === 'savings' || g.title.toLowerCase().includes('save') || g.title.toLowerCase().includes('fund')
  );

  if (savingsGoals.length > 0 && discretionaryPercent > 25) {
    const goal = savingsGoals[0];
    const monthlyTarget = goal.targetAmount / 12; // Rough estimate
    const monthlyDiscretionary = discretionarySpending;

    if (monthlyDiscretionary > monthlyTarget * 0.5) {
      contradictions.push({
        id: `spending-vs-goal-${Date.now()}`,
        detectedAt: new Date().toISOString(),
        type: 'goal_vs_behavior',
        severity: 'high',
        title: `Discretionary spending conflicts with ${goal.title}`,
        description: `You're spending ${discretionaryPercent.toFixed(0)}% of your budget on discretionary items while trying to save for ${goal.title}. Your non-essential spending (${monthlyDiscretionary.toLocaleString()}) is significantly impacting your savings goal.`,
        stated: {
          description: `Goal: ${goal.title} - Target: $${goal.targetAmount.toLocaleString()}`,
          source: 'goal_setting',
          value: goal.targetAmount,
        },
        actual: {
          description: `Discretionary spending: $${discretionarySpending.toLocaleString()} (${discretionaryPercent.toFixed(0)}% of budget)`,
          evidence: transactions
            .filter(t => discretionaryCategories.includes(t.category))
            .slice(0, 5)
            .map(t => `${t.merchant}: $${t.amount}`),
          value: discretionarySpending,
        },
        suggestion: adaptSuggestionToPersonality(
          `Consider reducing discretionary spending by $${(monthlyDiscretionary * 0.3).toFixed(0)}/month. This would accelerate your ${goal.title} by ${calculateMonthsSaved(monthlyDiscretionary * 0.3, goal)} months.`,
          profile.type
        ),
        emoji: '⚠️',
        hypothesis: 'User may benefit from automatic savings transfers before discretionary spending',
        resolved: false,
      });
    }
  }

  return contradictions;
}

/**
 * Analyze spending patterns by category
 */
function analyzeCategoryPatterns(
  transactions: Transaction[],
  timeRange: string
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // Group by category and calculate totals
  const categoryTotals: Record<string, number> = {};
  transactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  // Define reasonable budgets by category (as percentage of total)
  const categoryBudgets: Record<string, number> = {
    'Food & Dining': 0.15,
    'Entertainment': 0.10,
    'Shopping': 0.10,
    'Transportation': 0.12,
    'Utilities': 0.08,
  };

  const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Check each category against budget
  Object.entries(categoryBudgets).forEach(([category, budgetPercent]) => {
    const spent = categoryTotals[category] || 0;
    const spentPercent = spent / totalSpending;
    const overagePercent = ((spentPercent - budgetPercent) / budgetPercent) * 100;

    if (overagePercent > 30) { // 30% over budget
      const severity: 'low' | 'medium' | 'high' = 
        overagePercent > 50 ? 'high' : overagePercent > 40 ? 'medium' : 'low';

      contradictions.push({
        id: `category-overage-${category}-${Date.now()}`,
        detectedAt: new Date().toISOString(),
        type: 'stated_vs_actual',
        severity,
        title: `${category} spending ${overagePercent.toFixed(0)}% over recommended budget`,
        description: `You're spending $${spent.toFixed(0)} on ${category}, which is ${overagePercent.toFixed(0)}% more than the recommended ${(budgetPercent * 100).toFixed(0)}% of your budget.`,
        stated: {
          description: `Recommended ${category} budget: ${(budgetPercent * 100).toFixed(0)}% of spending`,
          source: 'financial_best_practices',
          value: budgetPercent * totalSpending,
        },
        actual: {
          description: `Actual ${category} spending: $${spent.toFixed(0)}`,
          evidence: transactions
            .filter(t => t.category === category)
            .slice(0, 3)
            .map(t => `${t.merchant}: $${t.amount}`),
          value: spent,
        },
        suggestion: `Try reducing ${category} by $${(spent * 0.2).toFixed(0)} this ${timeRange}. Small changes like cooking at home or finding free alternatives can make a big difference.`,
        emoji: overagePercent > 50 ? '🚨' : '📊',
        resolved: false,
      });
    }
  });

  return contradictions;
}

/**
 * Analyze if spending aligns with personality type
 */
function analyzePersonalityAlignment(
  profile: MoneyStyleProfile,
  transactions: Transaction[]
): Contradiction[] {
  const contradictions: Contradiction[] = [];
  const { type } = profile;

  // Check if Judger (J) but many spontaneous purchases
  if (type.includes('J')) {
    const smallFrequentPurchases = transactions.filter(t => t.amount < 20).length;
    const totalTransactions = transactions.length;
    const impulseBuyPercent = (smallFrequentPurchases / totalTransactions) * 100;

    if (impulseBuyPercent > 40 && totalTransactions > 20) {
      contradictions.push({
        id: `personality-spontaneous-${Date.now()}`,
        detectedAt: new Date().toISOString(),
        type: 'stated_vs_actual',
        severity: 'medium',
        title: 'Spontaneous purchases don\'t match your planned Money Style',
        description: `As a ${type} type, you prefer structure and planning. However, ${impulseBuyPercent.toFixed(0)}% of your transactions are small, frequent purchases suggesting impulse buying.`,
        stated: {
          description: `${type} personality: Prefers planned, structured spending`,
          source: 'assessment',
          value: 'structured',
        },
        actual: {
          description: `${smallFrequentPurchases} small purchases out of ${totalTransactions} transactions`,
          evidence: ['Multiple small transactions detected', 'Pattern suggests unplanned spending'],
          value: smallFrequentPurchases,
        },
        suggestion: 'Try batching purchases weekly or using a "planned discretionary" budget to maintain structure while allowing flexibility.',
        emoji: '🎯',
        resolved: false,
      });
    }
  }

  return contradictions;
}

/**
 * Analyze goal progress vs current spending trajectory
 */
function analyzeGoalProgress(
  goals: FinancialGoal[],
  transactions: Transaction[]
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  goals.forEach(goal => {
    const daysUntilTarget = Math.ceil(
      (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const monthsUntilTarget = daysUntilTarget / 30;

    if (monthsUntilTarget > 0 && monthsUntilTarget < 24) {
      const remaining = goal.targetAmount - goal.currentAmount;
      const monthlyRequired = remaining / monthsUntilTarget;
      const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;

      // Check if progress is too slow
      if (progressPercent < 30 && monthsUntilTarget < 12) {
        contradictions.push({
          id: `goal-progress-${goal.id}-${Date.now()}`,
          detectedAt: new Date().toISOString(),
          type: 'goal_vs_behavior',
          severity: progressPercent < 15 ? 'high' : 'medium',
          title: `${goal.title} progress is behind schedule`,
          description: `You're ${progressPercent.toFixed(0)}% toward your ${goal.title} goal with ${monthsUntilTarget.toFixed(0)} months remaining. At this rate, you'll need to save $${monthlyRequired.toFixed(0)}/month to reach your target.`,
          stated: {
            description: `Goal: ${goal.title} by ${new Date(goal.targetDate).toLocaleDateString()}`,
            source: 'goal_setting',
            value: goal.targetAmount,
          },
          actual: {
            description: `Current progress: $${goal.currentAmount} (${progressPercent.toFixed(0)}%)`,
            evidence: [`${remaining.toFixed(0)} remaining`, `${monthsUntilTarget.toFixed(0)} months left`],
            value: goal.currentAmount,
          },
          suggestion: `Boost your savings by $${monthlyRequired.toFixed(0)}/month or extend your timeline by ${(monthsUntilTarget * 0.5).toFixed(0)} months to make this goal more achievable.`,
          emoji: '⏰',
          resolved: false,
        });
      }
    }
  });

  return contradictions;
}

/**
 * Detect positive patterns (for celebration & reinforcement)
 */
function detectPositivePatterns(
  transactions: Transaction[],
  goals: FinancialGoal[],
  profile: MoneyStyleProfile
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // Check for goals with good progress
  goals.forEach(goal => {
    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
    
    if (progressPercent > 75) {
      contradictions.push({
        id: `positive-goal-${goal.id}-${Date.now()}`,
        detectedAt: new Date().toISOString(),
        type: 'goal_vs_behavior',
        severity: 'low',
        title: `Excellent progress on ${goal.title}!`,
        description: `You're ${progressPercent.toFixed(0)}% of the way to your ${goal.title} goal. Your consistent saving habit is paying off!`,
        stated: {
          description: goal.title,
          source: 'goal_setting',
          value: goal.targetAmount,
        },
        actual: {
          description: `Current: $${goal.currentAmount}`,
          evidence: ['Strong progress maintained'],
          value: goal.currentAmount,
        },
        suggestion: 'Keep up the great work! Consider celebrating this milestone in a budget-friendly way.',
        emoji: '🎉',
        resolved: false,
      });
    }
  });

  // Check for reduced spending in problem categories
  const essentialCategories = ['Housing', 'Utilities', 'Healthcare', 'Groceries'];
  const essentialSpending = transactions
    .filter(t => essentialCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
  const essentialPercent = (essentialSpending / totalSpending) * 100;

  if (essentialPercent > 60 && essentialPercent < 75) {
    contradictions.push({
      id: `positive-spending-${Date.now()}`,
      detectedAt: new Date().toISOString(),
      type: 'stated_vs_actual',
      severity: 'low',
      title: 'Great job prioritizing essential spending!',
      description: `${essentialPercent.toFixed(0)}% of your spending goes to essential categories. This shows strong financial discipline.`,
      stated: {
        description: 'Recommended essential spending: 50-70%',
        source: 'financial_best_practices',
        value: 65,
      },
      actual: {
        description: `Your essential spending: ${essentialPercent.toFixed(0)}%`,
        evidence: ['Balanced spending distribution'],
        value: essentialPercent,
      },
      suggestion: 'Your spending balance is healthy! This foundation gives you flexibility to pursue your financial goals.',
      emoji: '✨',
      resolved: false,
    });
  }

  return contradictions;
}

/**
 * Adapt suggestion language to user's personality type
 */
function adaptSuggestionToPersonality(baseSuggestion: string, mbtiType: string): string {
  // Thinking (T) vs Feeling (F)
  if (mbtiType.includes('F')) {
    // Add empathetic, values-focused language
    return `${baseSuggestion} Remember, small changes align with your values and long-term happiness.`;
  }
  
  // Default for Thinkers: keep it logical and data-focused
  return baseSuggestion;
}

/**
 * Calculate months saved by reducing spending
 */
function calculateMonthsSaved(monthlyReduction: number, goal: FinancialGoal): number {
  const remaining = goal.targetAmount - goal.currentAmount;
  const currentMonthsNeeded = remaining / (goal.currentAmount / 12); // rough estimate
  const newMonthsNeeded = remaining / (monthlyReduction + (goal.currentAmount / 12));
  return Math.max(0, currentMonthsNeeded - newMonthsNeeded);
}
