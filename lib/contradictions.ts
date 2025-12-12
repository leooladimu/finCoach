import type { Contradiction, UserProfile, BehaviorAction, FinancialSnapshot } from '@/types';
import { getBehaviorHistory, getLatestFinancialSnapshot } from './kv';

/**
 * Detect contradictions between stated preferences and actual behavior
 * 
 * Examples:
 * - User says "conservative risk tolerance" but makes frequent high-risk investments
 * - User sets "aggressive savings goal" but spending exceeds income
 * - User prioritizes "debt payoff" but continues high discretionary spending
 */

export async function detectContradictions(
  userId: string,
  profile: UserProfile
): Promise<Contradiction[]> {
  const contradictions: Contradiction[] = [];
  
  // Get user's behavioral data
  const actions = await getBehaviorHistory(userId, 200);
  const financialSnapshot = await getLatestFinancialSnapshot(userId);
  
  if (!financialSnapshot || !profile.statedPreferences) {
    return contradictions; // Not enough data yet
  }
  
  // Check stated risk tolerance vs actual investment behavior
  if (profile.statedPreferences.riskTolerance === 'conservative') {
    const riskContradiction = checkRiskToleranceContradiction(
      profile,
      financialSnapshot,
      actions
    );
    if (riskContradiction) {
      contradictions.push(riskContradiction);
    }
  }
  
  // Check stated savings goal vs actual spending patterns
  if (profile.statedPreferences.savingsGoal) {
    const savingsContradiction = checkSavingsGoalContradiction(
      profile,
      financialSnapshot,
      actions
    );
    if (savingsContradiction) {
      contradictions.push(savingsContradiction);
    }
  }
  
  // Check priority goals vs spending allocation
  if (profile.statedPreferences.priorityGoals) {
    const priorityContradiction = checkPriorityGoalsContradiction(
      profile,
      financialSnapshot,
      actions
    );
    if (priorityContradiction) {
      contradictions.push(priorityContradiction);
    }
  }
  
  // Check MBTI personality alignment with spending patterns
  const personalityContradiction = checkPersonalityAlignment(
    profile,
    financialSnapshot,
    actions
  );
  if (personalityContradiction) {
    contradictions.push(personalityContradiction);
  }

  // Check spending categories vs budget recommendations
  const categoryContradiction = checkCategorySpending(
    financialSnapshot
  );
  if (categoryContradiction) {
    contradictions.push(categoryContradiction);
  }

  // Look for positive patterns to celebrate
  const positivePattern = detectPositivePatterns(
    profile,
    financialSnapshot
  );
  if (positivePattern) {
    contradictions.push(positivePattern);
  }
  
  return contradictions;
}

/**
 * Analyze spending from real transaction data
 * Returns spending breakdown by category
 */
export function analyzeSpendingPatterns(transactions: Array<{
  amount: number;
  category: string;
  date: string;
  merchant?: string;
}>) {
  const categoryTotals: Record<string, number> = {};
  let totalSpending = 0;

  transactions.forEach(t => {
    const amount = Math.abs(t.amount);
    totalSpending += amount;
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
  });

  // Calculate percentages
  const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: (amount / totalSpending) * 100,
  }));

  // Identify discretionary vs essential spending
  const discretionaryCategories = ['Entertainment', 'Dining', 'Shopping', 'Travel', 'Recreation'];
  const essentialCategories = ['Housing', 'Utilities', 'Groceries', 'Transportation', 'Healthcare'];

  const discretionarySpending = categoryBreakdown
    .filter(c => discretionaryCategories.includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);

  const essentialSpending = categoryBreakdown
    .filter(c => essentialCategories.includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);

  return {
    totalSpending,
    categoryBreakdown,
    discretionarySpending,
    essentialSpending,
    discretionaryPercent: (discretionarySpending / totalSpending) * 100,
    essentialPercent: (essentialSpending / totalSpending) * 100,
  };
}

/**
 * Check if spending patterns align with MBTI personality type
 */
function checkPersonalityAlignment(
  profile: UserProfile,
  snapshot: FinancialSnapshot,
  _actions: BehaviorAction[]
): Contradiction | null {
  const moneyStyle = profile.moneyStyle?.type;
  
  // Judgers (J) tend to plan and structure - flag if too many small impulse purchases
  if (moneyStyle?.includes('J')) {
    const smallTransactions = snapshot.transactions.filter(
      t => Math.abs(t.amount) < 20 && 
      (t.category === 'Shopping' || t.category === 'Dining')
    );
    
    const impulseBuyPercent = (smallTransactions.length / snapshot.transactions.length) * 100;
    
    if (impulseBuyPercent > 40) {
      return {
        id: `contradiction-${Date.now()}-personality-j`,
        detectedAt: new Date().toISOString(),
        type: 'stated_vs_actual',
        severity: 'medium',
        title: 'Unplanned purchases conflicting with your planning style',
        description: `As a Judging type, you thrive on structure and planning. However, ${smallTransactions.length} small purchases suggest impulse buying.`,
        stated: {
          description: 'Your Money Style indicates you prefer structured, planned spending',
          source: 'assessment',
          value: moneyStyle,
        },
        actual: {
          description: `${impulseBuyPercent.toFixed(0)}% of transactions are small, unplanned purchases`,
          evidence: smallTransactions.map(t => t.id).slice(0, 5),
          value: impulseBuyPercent,
        },
        suggestion: 'Try a "planned impulse budget" - set aside $50/week for spontaneous buys. This satisfies immediate wants while maintaining your structure.',
        emoji: '🎯',
        resolved: false,
      };
    }
  }
  
  // Sensors (S) are concrete and present-focused - flag if too much in abstract future investments without emergency fund
  if (moneyStyle?.includes('S')) {
    // Check if there's adequate emergency fund (3+ months expenses in savings)
    const monthlySavings = snapshot.accounts
      .filter(a => a.type === 'savings')
      .reduce((sum, a) => sum + a.balance, 0);
    
    const monthlyExpenses = snapshot.monthlyExpenses; // Monthly expenses from snapshot
    const emergencyFundMonths = monthlySavings / (monthlyExpenses || 1);
    const hasEmergencyFund = emergencyFundMonths >= 3;
    
    if (!hasEmergencyFund) {
      const investmentSpending = snapshot.transactions
        .filter(t => t.category === 'Investment' || t.category === 'Retirement')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const investmentPercent = (investmentSpending / snapshot.monthlyIncome) * 100;
      
      if (investmentPercent > 15) {
        return {
          id: `contradiction-${Date.now()}-personality-s`,
          detectedAt: new Date().toISOString(),
          type: 'stated_vs_actual',
          severity: 'medium',
          title: 'Future investments before present security',
          description: 'As a Sensing type, you value concrete security. Investing heavily without an emergency fund may not align with your comfort zone.',
          stated: {
            description: 'Your Money Style suggests you prefer tangible, present security',
            source: 'assessment',
            value: moneyStyle,
          },
          actual: {
            description: `${investmentPercent.toFixed(0)}% of income goes to investments, but only ${emergencyFundMonths.toFixed(1)} months of expenses in savings`,
            evidence: ['investment_transactions'],
            value: investmentPercent,
          },
          suggestion: 'Consider building 3 months of expenses in savings first. This concrete safety net will make future investments feel more comfortable.',
          emoji: '🛡️',
          resolved: false,
        };
      }
    }
  }
  
  return null;
}

/**
 * Check if spending in categories exceeds recommended budgets
 */
function checkCategorySpending(
  snapshot: FinancialSnapshot
): Contradiction | null {
  const analysis = analyzeSpendingPatterns(snapshot.transactions);
  
  // Recommended percentages of income
  const recommendations = {
    'Food & Dining': 15,
    'Entertainment': 10,
    'Shopping': 10,
    'Transportation': 15,
    'Housing': 30,
  };
  
  // Find the most over-budget category
  let maxOverage = 0;
  let overCategory = '';
  
  analysis.categoryBreakdown.forEach(cat => {
    const recommended = recommendations[cat.category as keyof typeof recommendations];
    if (recommended && cat.percentage > recommended * 1.3) { // 30% over recommendation
      const overage = cat.percentage - recommended;
      if (overage > maxOverage) {
        maxOverage = overage;
        overCategory = cat.category;
      }
    }
  });
  
  if (overCategory) {
    const actual = analysis.categoryBreakdown.find(c => c.category === overCategory);
    const recommended = recommendations[overCategory as keyof typeof recommendations];
    
    return {
      id: `contradiction-${Date.now()}-category`,
      detectedAt: new Date().toISOString(),
      type: 'spending_pattern',
      severity: maxOverage > 15 ? 'high' : 'medium',
      title: `${overCategory} spending exceeds healthy range`,
      description: `You're spending ${actual?.percentage.toFixed(0)}% on ${overCategory}, which is ${maxOverage.toFixed(0)}% above the recommended ${recommended}%.`,
      stated: {
        description: `Recommended ${overCategory} budget`,
        source: 'financial_best_practices',
        value: recommended,
      },
      actual: {
        description: `Actual ${overCategory} spending`,
        evidence: ['category_analysis'],
        value: actual?.percentage || 0,
      },
      suggestion: `Try reducing ${overCategory} by $${((actual?.amount || 0) * 0.2).toFixed(0)} this month. Small adjustments compound over time.`,
      emoji: '💸',
      resolved: false,
    };
  }
  
  return null;
}

/**
 * Detect positive patterns worth celebrating
 */
function detectPositivePatterns(
  profile: UserProfile,
  snapshot: FinancialSnapshot
): Contradiction | null {
  const analysis = analyzeSpendingPatterns(snapshot.transactions);
  
  // Celebrate if essential spending is in healthy range (50-70%)
  if (analysis.essentialPercent >= 50 && analysis.essentialPercent <= 70) {
    return {
      id: `positive-${Date.now()}-balance`,
      detectedAt: new Date().toISOString(),
      type: 'positive_pattern',
      severity: 'low',
      title: 'Great balance between needs and wants!',
      description: `${analysis.essentialPercent.toFixed(0)}% of your spending goes to essentials. This is a healthy balance.`,
      stated: {
        description: 'Recommended essential spending: 50-70%',
        source: 'financial_best_practices',
        value: 60,
      },
      actual: {
        description: `Your essential spending: ${analysis.essentialPercent.toFixed(0)}%`,
        evidence: ['spending_analysis'],
        value: analysis.essentialPercent,
      },
      suggestion: 'Keep it up! This foundation gives you flexibility to pursue your goals while enjoying life.',
      emoji: '✨',
      resolved: false,
    };
  }
  
  return null;
}

function checkRiskToleranceContradiction(
  profile: UserProfile,
  snapshot: FinancialSnapshot,
  _actions: BehaviorAction[]
): Contradiction | null {
  // TODO: Implement risk tolerance analysis
  // Look for high-volatility investment transactions
  // Compare against stated conservative preference
  
  // Example logic:
  const investmentTransactions = snapshot.transactions.filter(
    t => t.category === 'Investment' || t.category === 'Cryptocurrency'
  );
  
  const highRiskCount = investmentTransactions.filter(
    t => t.amount > snapshot.monthlyIncome * 0.1 // More than 10% of monthly income
  ).length;
  
  if (profile.statedPreferences?.riskTolerance === 'conservative' && highRiskCount > 3) {
    return {
      id: `contradiction-${Date.now()}-risk`,
      detectedAt: new Date().toISOString(),
      type: 'stated_vs_actual',
      severity: 'medium',
      stated: {
        description: 'You indicated a conservative approach to risk',
        source: 'assessment',
        value: profile.statedPreferences.riskTolerance,
      },
      actual: {
        description: `You've made ${highRiskCount} high-risk investments recently`,
        evidence: investmentTransactions.map(t => t.id),
        value: 'aggressive',
      },
      hypothesis: 'You may be more comfortable with risk than you initially thought, or you\'re experiencing FOMO with certain investment opportunities.',
      experiment: 'Let\'s track your emotional response to market volatility over the next month. Do these investments align with your long-term goals?',
      resolved: false,
    };
  }
  
  return null;
}

function checkSavingsGoalContradiction(
  profile: UserProfile,
  snapshot: FinancialSnapshot,
  _actions: BehaviorAction[]
): Contradiction | null {
  // TODO: Implement savings goal contradiction check
  // Compare stated savings goal with actual savings rate
  
  if (!profile.statedPreferences?.savingsGoal) {
    return null;
  }
  
  const actualMonthlySavings = snapshot.monthlyIncome - snapshot.monthlyExpenses;
  const requiredMonthlySavings = profile.statedPreferences.savingsGoal / 12; // Rough calculation
  
  // If spending more than earning or saving less than 50% of required amount
  if (actualMonthlySavings < requiredMonthlySavings * 0.5) {
    return {
      id: `contradiction-${Date.now()}-savings`,
      detectedAt: new Date().toISOString(),
      type: 'goal_vs_behavior',
      severity: 'high',
      stated: {
        description: `You set a savings goal of $${profile.statedPreferences.savingsGoal.toLocaleString()}`,
        source: 'goal_setting',
        value: profile.statedPreferences.savingsGoal,
      },
      actual: {
        description: `Your current savings rate is $${actualMonthlySavings.toLocaleString()}/month, which may not reach your goal`,
        evidence: ['monthly_income_expenses'],
        value: actualMonthlySavings,
      },
      hypothesis: 'Your goal might be aspirational but not yet aligned with your current lifestyle choices.',
      experiment: 'Let\'s identify 2-3 spending categories where you could reduce by 10% without major lifestyle impact.',
      resolved: false,
    };
  }
  
  return null;
}

function checkPriorityGoalsContradiction(
  profile: UserProfile,
  snapshot: FinancialSnapshot,
  _actions: BehaviorAction[]
): Contradiction | null {
  // TODO: Implement priority goals contradiction check
  // See if spending aligns with stated priority goals
  
  // Example: User says "debt payoff" is priority but discretionary spending is high
  if (profile.statedPreferences?.priorityGoals?.includes('Pay off debt')) {
    const discretionarySpending = snapshot.transactions
      .filter(t => 
        t.category === 'Entertainment' || 
        t.category === 'Shopping' || 
        t.category === 'Dining'
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const debtPayments = snapshot.transactions
      .filter(t => t.category === 'Loan Payment' || t.category === 'Credit Card Payment')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // If discretionary spending exceeds debt payments
    if (discretionarySpending > debtPayments) {
      return {
        id: `contradiction-${Date.now()}-priority`,
        detectedAt: new Date().toISOString(),
        type: 'goal_vs_behavior',
        severity: 'medium',
        stated: {
          description: 'You prioritized paying off debt',
          source: 'goal_setting',
          value: 'debt_payoff_priority',
        },
        actual: {
          description: `Discretionary spending ($${discretionarySpending.toFixed(0)}) exceeds debt payments ($${debtPayments.toFixed(0)})`,
          evidence: snapshot.transactions.map(t => t.id),
          value: 'discretionary_focus',
        },
        hypothesis: 'You may be balancing immediate quality of life with long-term debt reduction, or debt fatigue is setting in.',
        experiment: 'What if we redirect 25% of entertainment spending to debt for one month? Let\'s see how it feels.',
        resolved: false,
      };
    }
  }
  
  return null;
}

/**
 * Generate a soft nudge message for a contradiction
 * Uses personality type to adapt tone
 */
export function generateContradictionNudge(
  contradiction: Contradiction,
  moneyStyle?: string
): string {
  const { type } = contradiction;
  
  // Adapt tone based on MBTI
  // T types: Direct, logical
  // F types: Empathetic, values-focused
  const isThinking = moneyStyle?.includes('T');
  
  if (type === 'stated_vs_actual') {
    if (isThinking) {
      return `I noticed a pattern: ${contradiction.actual.description}. This doesn't match your stated ${contradiction.stated.description}. Worth analyzing?`;
    } else {
      return `I wanted to check in: ${contradiction.actual.description}. I remember you mentioned ${contradiction.stated.description}. How are you feeling about this?`;
    }
  }
  
  if (type === 'goal_vs_behavior') {
    if (isThinking) {
      return `Data point: ${contradiction.actual.description}. This may impact your goal to ${contradiction.stated.description}. Let's strategize.`;
    } else {
      return `I see you're working toward ${contradiction.stated.description}, but ${contradiction.actual.description}. No judgment—let's talk about what's driving this.`;
    }
  }
  
  return `I noticed something worth discussing: ${contradiction.actual.description}`;
}
