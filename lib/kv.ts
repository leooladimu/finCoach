// Vercel KV will be initialized when environment variables are set
// import { kv } from '@vercel/kv';
import type {
  UserProfile,
  FinancialSnapshot,
  BehaviorAction,
  Contradiction,
} from '@/types';

// Mock KV for development without credentials
const kv = {
  get: async <T>(_key: string): Promise<T | null> => null,
  set: async (_key: string, _value: unknown): Promise<void> => undefined,
  lpush: async (_key: string, ..._values: unknown[]): Promise<number> => 0,
  ltrim: async (_key: string, _start: number, _stop: number): Promise<void> => undefined,
  lrange: async <T>(_key: string, _start: number, _stop: number): Promise<T[]> => [],
  hset: async (_key: string, _data: Record<string, unknown>): Promise<number> => 0,
  hgetall: async <T>(_key: string): Promise<T | null> => null,
};

// Key patterns for Redis storage
const keys = {
  userProfile: (userId: string) => `user:${userId}:profile`,
  userFinances: (userId: string) => `user:${userId}:finances`,
  userActions: (userId: string) => `user:${userId}:actions`,
  userContradictions: (userId: string) => `user:${userId}:contradictions`,
};

// User Profile operations
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const profile = await kv.get<UserProfile>(keys.userProfile(userId));
  return profile;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await kv.set(keys.userProfile(profile.userId), profile);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const current = await getUserProfile(userId);
  const updated = { ...current, ...updates } as UserProfile;
  await saveUserProfile(updated);
  return updated;
}

// Financial data operations
export async function saveFinancialSnapshot(
  userId: string,
  snapshot: FinancialSnapshot
): Promise<void> {
  // Store latest snapshot
  await kv.set(keys.userFinances(userId), snapshot);
  
  // Also append to time-series list (optional: keep last 90 days)
  const timeSeriesKey = `${keys.userFinances(userId)}:history`;
  await kv.lpush(timeSeriesKey, snapshot);
  
  // Trim to last 90 entries (approximately 90 days if daily sync)
  await kv.ltrim(timeSeriesKey, 0, 89);
}

export async function getLatestFinancialSnapshot(
  userId: string
): Promise<FinancialSnapshot | null> {
  return await kv.get<FinancialSnapshot>(keys.userFinances(userId));
}

export async function getFinancialHistory(
  userId: string,
  limit: number = 30
): Promise<FinancialSnapshot[]> {
  const timeSeriesKey = `${keys.userFinances(userId)}:history`;
  const snapshots = await kv.lrange<FinancialSnapshot>(timeSeriesKey, 0, limit - 1);
  return snapshots || [];
}

// Behavioral tracking operations
export async function trackBehavior(
  userId: string,
  action: BehaviorAction
): Promise<void> {
  const actionsKey = keys.userActions(userId);
  
  // Prepend to list (newest first)
  await kv.lpush(actionsKey, action);
  
  // Keep last 1000 actions
  await kv.ltrim(actionsKey, 0, 999);
}

export async function getBehaviorHistory(
  userId: string,
  limit: number = 100
): Promise<BehaviorAction[]> {
  const actionsKey = keys.userActions(userId);
  const actions = await kv.lrange<BehaviorAction>(actionsKey, 0, limit - 1);
  return actions || [];
}

export async function queryBehaviorByType(
  userId: string,
  type: string,
  limit: number = 50
): Promise<BehaviorAction[]> {
  const allActions = await getBehaviorHistory(userId, 500);
  return allActions.filter(action => action.type === type).slice(0, limit);
}

// Contradiction tracking operations
export async function saveContradiction(
  userId: string,
  contradiction: Contradiction
): Promise<void> {
  const contradictionsKey = keys.userContradictions(userId);
  
  // Store by contradiction ID
  await kv.hset(contradictionsKey, {
    [contradiction.id]: contradiction,
  });
}

export async function getContradictions(
  userId: string,
  onlyUnresolved: boolean = false
): Promise<Contradiction[]> {
  const contradictionsKey = keys.userContradictions(userId);
  const contradictionsMap = await kv.hgetall<Record<string, Contradiction>>(
    contradictionsKey
  );
  
  if (!contradictionsMap) return [];
  
  const contradictions = Object.values(contradictionsMap) as Contradiction[];
  
  if (onlyUnresolved) {
    return contradictions.filter((c: Contradiction) => !c.resolved);
  }
  
  return contradictions;
}

export async function updateContradiction(
  userId: string,
  contradictionId: string,
  updates: Partial<Contradiction>
): Promise<void> {
  const contradictionsKey = keys.userContradictions(userId);
  const contradictions = await kv.hgetall<Record<string, Contradiction>>(
    contradictionsKey
  );
  
  if (!contradictions || !contradictions[contradictionId]) {
    throw new Error(`Contradiction ${contradictionId} not found`);
  }
  
  const updated = { ...contradictions[contradictionId], ...updates };
  
  await kv.hset(contradictionsKey, {
    [contradictionId]: updated,
  });
}

// Analytics helpers
export async function getSpendingByCategory(
  userId: string,
  days: number = 30
): Promise<Record<string, number>> {
  const history = await getFinancialHistory(userId, days);
  const categoryTotals: Record<string, number> = {};
  
  history.forEach(snapshot => {
    snapshot.transactions.forEach(transaction => {
      if (transaction.amount < 0) { // Spending (negative amounts)
        const category = transaction.category;
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
      }
    });
  });
  
  return categoryTotals;
}

export async function calculateSavingsRate(userId: string): Promise<number> {
  const snapshot = await getLatestFinancialSnapshot(userId);
  
  if (!snapshot || snapshot.monthlyIncome === 0) {
    return 0;
  }
  
  const monthlyNet = snapshot.monthlyIncome - snapshot.monthlyExpenses;
  return (monthlyNet / snapshot.monthlyIncome) * 100;
}
