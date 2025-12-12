// Vercel KV - use environment-aware setup
import type {
  UserProfile,
  FinancialSnapshot,
  BehaviorAction,
  Contradiction,
} from '@/types';

// Import Vercel KV - will use their mock internally if env vars missing
import { kv } from '@vercel/kv';

// Log which mode we're in
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  console.log('✅ Vercel KV configured (production mode)');
} else {
  console.log('⚠️  Vercel KV not configured - using Vercel\'s built-in mock (data may not persist)');
}

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

/**
 * Initialize mock financial snapshot for development
 * Call this to populate KV with realistic demo data
 */
export async function initializeMockData(userId: string): Promise<void> {
  const mockSnapshot: FinancialSnapshot = {
    timestamp: new Date().toISOString(),
    accounts: [
      {
        id: 'checking-1',
        name: 'Chase Checking',
        type: 'checking',
        balance: 3500,
        institution: 'Chase',
      },
      {
        id: 'savings-1',
        name: 'Ally Savings',
        type: 'savings',
        balance: 8200,
        institution: 'Ally',
      },
      {
        id: 'credit-1',
        name: 'Chase Sapphire',
        type: 'credit',
        balance: -2100,
        institution: 'Chase',
      },
      {
        id: 'investment-1',
        name: 'Vanguard 401k',
        type: 'investment',
        balance: 45000,
        institution: 'Vanguard',
      },
    ],
    transactions: [
      // Housing
      { id: 't1', date: '2025-12-01', amount: -2100, category: 'Housing', merchant: 'Property Management Co', accountId: 'checking-1' },
      
      // Food & Dining (over budget to trigger contradiction)
      { id: 't2', date: '2025-12-03', amount: -45, category: 'Dining', merchant: 'Italian Restaurant', accountId: 'credit-1' },
      { id: 't3', date: '2025-12-05', amount: -12, category: 'Dining', merchant: 'Starbucks', accountId: 'credit-1' },
      { id: 't4', date: '2025-12-07', amount: -15, category: 'Dining', merchant: 'Chipotle', accountId: 'credit-1' },
      { id: 't5', date: '2025-12-09', amount: -67, category: 'Dining', merchant: 'Steakhouse', accountId: 'credit-1' },
      { id: 't6', date: '2025-12-10', amount: -120, category: 'Food & Dining', merchant: 'Whole Foods', accountId: 'checking-1' },
      { id: 't7', date: '2025-12-12', amount: -18, category: 'Dining', merchant: 'Local Cafe', accountId: 'credit-1' },
      { id: 't8', date: '2025-12-14', amount: -95, category: 'Food & Dining', merchant: 'Trader Joes', accountId: 'checking-1' },
      { id: 't9', date: '2025-12-16', amount: -32, category: 'Dining', merchant: 'Thai Place', accountId: 'credit-1' },
      { id: 't10', date: '2025-12-18', amount: -14, category: 'Dining', merchant: 'Starbucks', accountId: 'credit-1' },
      { id: 't11', date: '2025-12-20', amount: -89, category: 'Dining', merchant: 'Sushi Bar', accountId: 'credit-1' },
      { id: 't12', date: '2025-12-22', amount: -110, category: 'Food & Dining', merchant: 'Whole Foods', accountId: 'checking-1' },
      { id: 't13', date: '2025-12-24', amount: -55, category: 'Dining', merchant: 'Brunch Spot', accountId: 'credit-1' },
      { id: 't14', date: '2025-12-26', amount: -78, category: 'Dining', merchant: 'Mexican Restaurant', accountId: 'credit-1' },
      
      // Transportation (under budget)
      { id: 't15', date: '2025-12-02', amount: -50, category: 'Transportation', merchant: 'Shell', accountId: 'checking-1' },
      { id: 't16', date: '2025-12-15', amount: -45, category: 'Transportation', merchant: 'Chevron', accountId: 'checking-1' },
      { id: 't17', date: '2025-12-20', amount: -25, category: 'Transportation', merchant: 'Uber', accountId: 'credit-1' },
      
      // Entertainment (over budget)
      { id: 't18', date: '2025-12-04', amount: -120, category: 'Entertainment', merchant: 'Ticketmaster', accountId: 'credit-1' },
      { id: 't19', date: '2025-12-11', amount: -65, category: 'Entertainment', merchant: 'Streaming Services', accountId: 'checking-1' },
      { id: 't20', date: '2025-12-19', amount: -45, category: 'Entertainment', merchant: 'AMC Theaters', accountId: 'credit-1' },
      { id: 't21', date: '2025-12-25', amount: -85, category: 'Entertainment', merchant: 'Steam', accountId: 'credit-1' },
      
      // Shopping (many small impulse buys - potential J type contradiction)
      { id: 't22', date: '2025-12-06', amount: -15, category: 'Shopping', merchant: 'Target', accountId: 'checking-1' },
      { id: 't23', date: '2025-12-08', amount: -12, category: 'Shopping', merchant: 'Amazon', accountId: 'credit-1' },
      { id: 't24', date: '2025-12-10', amount: -18, category: 'Shopping', merchant: 'CVS', accountId: 'checking-1' },
      { id: 't25', date: '2025-12-13', amount: -250, category: 'Shopping', merchant: 'Nike Store', accountId: 'credit-1' },
      { id: 't26', date: '2025-12-17', amount: -16, category: 'Shopping', merchant: 'Target', accountId: 'checking-1' },
      { id: 't27', date: '2025-12-21', amount: -14, category: 'Shopping', merchant: 'Amazon', accountId: 'credit-1' },
      { id: 't28', date: '2025-12-23', amount: -95, category: 'Shopping', merchant: 'H&M', accountId: 'credit-1' },
      { id: 't29', date: '2025-12-27', amount: -19, category: 'Shopping', merchant: 'Walmart', accountId: 'checking-1' },
      
      // Utilities
      { id: 't30', date: '2025-12-05', amount: -120, category: 'Utilities', merchant: 'PG&E', accountId: 'checking-1' },
      { id: 't31', date: '2025-12-15', amount: -80, category: 'Utilities', merchant: 'Comcast', accountId: 'checking-1' },
      { id: 't32', date: '2025-12-20', amount: -60, category: 'Utilities', merchant: 'T-Mobile', accountId: 'checking-1' },
      
      // Healthcare
      { id: 't33', date: '2025-12-08', amount: -25, category: 'Healthcare', merchant: 'CVS Pharmacy', accountId: 'checking-1' },
      { id: 't34', date: '2025-12-22', amount: -150, category: 'Healthcare', merchant: 'Medical Center', accountId: 'checking-1' },
      
      // Investments
      { id: 't35', date: '2025-12-01', amount: -500, category: 'Investment', merchant: 'Vanguard', accountId: 'checking-1' },
      { id: 't36', date: '2025-12-15', amount: -500, category: 'Investment', merchant: 'Vanguard', accountId: 'checking-1' },
    ],
    netWorth: 54600,
    monthlyIncome: 6000,
    monthlyExpenses: 4500,
  };
  
  await kv.set(keys.userFinances(userId), mockSnapshot);
}
