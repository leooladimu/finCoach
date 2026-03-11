'use server';

import {
  getUserProfile,
  saveUserProfile,
  updateUserProfile,
  getGoals,
  saveGoal,
  updateGoal,
  getTasks,
  saveTask,
  updateTask,
  getLatestFinancialSnapshot,
  initializeMockData,
} from '@/lib/kv';
import { detectContradictions } from '@/lib/contradictions';
import type { UserProfile, FinancialGoal, Task, Contradiction, SpendingCategory } from '@/types';

// ── User Profile actions ─────────────────────────────────────────────────────

/**
 * Save a new user profile server-side (called from onboarding welcome step).
 */
export async function saveUserProfileAction(profile: UserProfile): Promise<void> {
  await saveUserProfile(profile);
}

/**
 * Update an existing user profile server-side (called from assessment completion).
 */
export async function updateUserProfileAction(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  return updateUserProfile(userId, updates);
}

/**
 * Read a user profile server-side (called from onboarding guard).
 */
export async function getUserProfileAction(
  userId: string
): Promise<UserProfile | null> {
  return getUserProfile(userId);
}

// ── Goals actions ────────────────────────────────────────────────────────────

export async function getGoalsAction(userId: string): Promise<FinancialGoal[]> {
  return getGoals(userId);
}

export async function saveGoalAction(goal: FinancialGoal): Promise<void> {
  await saveGoal(goal);
}

export async function updateGoalAction(
  userId: string,
  goalId: string,
  updates: Partial<FinancialGoal>
): Promise<void> {
  await updateGoal(userId, goalId, updates);
}

// ── Tasks actions ────────────────────────────────────────────────────────────

export async function getTasksAction(userId: string): Promise<Task[]> {
  return getTasks(userId);
}

export async function saveTaskAction(task: Task): Promise<void> {
  await saveTask(task);
}

export async function updateTaskAction(
  userId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<void> {
  await updateTask(userId, taskId, updates);
}

// ── Contradiction detection actions ──────────────────────────────────────────

export async function detectContradictionsAction(
  userId: string
): Promise<Contradiction[]> {
  const profile = await getUserProfile(userId);
  if (!profile) return [];

  // Ensure stated preferences exist for detection
  if (!profile.statedPreferences) {
    profile.statedPreferences = {
      riskTolerance: 'moderate',
      savingsGoal: 1000,
      investmentStyle: 'passive',
      priorityGoals: [],
    };
  }

  // Only seed mock data if user has no real financial snapshot yet
  const existingSnapshot = await getLatestFinancialSnapshot(userId);
  if (!existingSnapshot) {
    await initializeMockData(userId);
  }

  return detectContradictions(userId, profile);
}

// ── Spending data actions ────────────────────────────────────────────────────

/** Category metadata: colors and emojis for known transaction categories */
const CATEGORY_META: Record<string, { color: string; emoji: string; budget: number }> = {
  Housing:        { color: 'from-amber-700 to-amber-800',  emoji: '🏠', budget: 2000 },
  'Food & Dining': { color: 'from-red-700 to-red-800',    emoji: '🍽️', budget: 800  },
  Dining:         { color: 'from-red-700 to-red-800',      emoji: '🍽️', budget: 800  },
  Transportation: { color: 'from-orange-700 to-orange-800', emoji: '🚗', budget: 500  },
  Entertainment:  { color: 'from-pink-700 to-pink-800',    emoji: '🎭', budget: 300  },
  Shopping:       { color: 'from-purple-700 to-purple-800', emoji: '🛍️', budget: 500  },
  Utilities:      { color: 'from-blue-700 to-blue-800',    emoji: '💡', budget: 300  },
  Healthcare:     { color: 'from-green-700 to-green-800',  emoji: '⚕️', budget: 200  },
  Investment:     { color: 'from-teal-700 to-teal-800',    emoji: '📈', budget: 1000 },
};

const DEFAULT_META = { color: 'from-stone-700 to-stone-800', emoji: '📦', budget: 250 };

/** Merge "Dining" into "Food & Dining" for display purposes */
function normalizeCategoryName(raw: string): string {
  if (raw === 'Dining') return 'Food & Dining';
  return raw;
}

/**
 * Build spending categories from a FinancialSnapshot's transactions.
 * Filters to the requested time window (week / month / year) based on
 * transaction dates, then aggregates by category.
 */
export async function getSpendingDataAction(
  userId: string,
  timeRange: 'week' | 'month' | 'year',
): Promise<SpendingCategory[]> {
  // Try to load real snapshot; seed mock data for dev if none exists
  let snapshot = await getLatestFinancialSnapshot(userId);
  if (!snapshot) {
    await initializeMockData(userId);
    snapshot = await getLatestFinancialSnapshot(userId);
  }
  if (!snapshot) return [];

  // Determine the date cutoff
  const now = new Date();
  const cutoff = new Date(now);
  if (timeRange === 'week') cutoff.setDate(now.getDate() - 7);
  else if (timeRange === 'month') cutoff.setMonth(now.getMonth() - 1);
  else cutoff.setFullYear(now.getFullYear() - 1);

  // Filter to spending transactions (negative amounts) within the window
  const relevantTxns = snapshot.transactions.filter((t) => {
    const txnDate = new Date(t.date);
    return t.amount < 0 && txnDate >= cutoff;
  });

  // Aggregate by normalised category
  const totals: Record<string, number> = {};
  for (const txn of relevantTxns) {
    const cat = normalizeCategoryName(txn.category);
    totals[cat] = (totals[cat] || 0) + Math.abs(txn.amount);
  }

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0) || 1;

  // Scale budgets to match the time range
  const budgetScale = timeRange === 'week' ? 7 / 30 : timeRange === 'year' ? 12 : 1;

  // Build the category array, sorted by amount descending
  const categories: SpendingCategory[] = Object.entries(totals)
    .map(([name, amount]) => {
      const meta = CATEGORY_META[name] || DEFAULT_META;
      return {
        name,
        amount: Math.round(amount),
        budget: Math.round(meta.budget * budgetScale),
        percent: Math.round((amount / grandTotal) * 100),
        color: meta.color,
        emoji: meta.emoji,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return categories;
}
