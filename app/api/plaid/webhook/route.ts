import { NextResponse } from 'next/server';
import { getBalances, getTransactions } from '@/lib/plaid';
import { saveFinancialSnapshot, getUserProfile, getUserIdByItemId } from '@/lib/kv';
import type { FinancialSnapshot, Account, Transaction } from '@/types';

// ── Type definitions ─────────────────────────────────────────────────────────

type PlaidWebhookBase = {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  error?: {
    error_type: string;
    error_code: string;
    error_message: string;
    display_message?: string;
  };
};

type TransactionsWebhook = PlaidWebhookBase & {
  webhook_type: 'TRANSACTIONS';
  webhook_code:
    | 'SYNC_UPDATES_AVAILABLE'
    | 'DEFAULT_UPDATE'
    | 'TRANSACTIONS_REMOVED'
    | 'INITIAL_UPDATE'
    | 'HISTORICAL_UPDATE';
  new_transactions?: number;
  removed_transactions?: string[];
};

type ItemWebhook = PlaidWebhookBase & {
  webhook_type: 'ITEM';
  webhook_code:
    | 'ERROR'
    | 'PENDING_EXPIRATION'
    | 'USER_PERMISSION_REVOKED'
    | 'WEBHOOK_UPDATE_ACKNOWLEDGED';
};

function isPlaidWebhook(data: unknown): data is PlaidWebhookBase {
  return (
    data !== null &&
    typeof data === 'object' &&
    'webhook_type' in data &&
    'webhook_code' in data
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Find a user by their Plaid item_id using the KV index written at token exchange. */
async function getUserIdForItem(itemId: string): Promise<string | null> {
  const userId = await getUserIdByItemId(itemId);
  if (!userId) {
    console.error(`getUserIdForItem: no user found for item_id "${itemId}". Was savePlaidItemIndex called during token exchange?`);
  }
  return userId;
}

/** Re-fetch accounts + last-30-day transactions and write a fresh snapshot. */
async function refreshSnapshot(userId: string, accessToken: string): Promise<void> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const [plaidAccounts, plaidTransactions] = await Promise.all([
    getBalances(accessToken),
    getTransactions(accessToken, startDate, endDate),
  ]);

  const accounts: Account[] = plaidAccounts.map((acc) => ({
    id: acc.account_id,
    name: acc.name,
    type: acc.type === 'depository'
      ? (acc.subtype === 'savings' ? 'savings' : 'checking')
      : (acc.type as Account['type']),
    balance: acc.balances.current ?? 0,
    institution: '',
  }));

  const transactions: Transaction[] = plaidTransactions.map((txn) => ({
    id: txn.transaction_id,
    date: txn.date,
    amount: -txn.amount,
    category: txn.personal_finance_category?.primary ?? txn.category?.[0] ?? 'Other',
    merchant: txn.merchant_name ?? txn.name,
    accountId: txn.account_id,
  }));

  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);
  const spending = transactions.filter((t) => t.amount < 0);
  const income = transactions.filter((t) => t.amount > 0);

  const snapshot: FinancialSnapshot = {
    timestamp: new Date().toISOString(),
    accounts,
    transactions,
    netWorth,
    monthlyIncome: income.reduce((s, t) => s + t.amount, 0),
    monthlyExpenses: Math.abs(spending.reduce((s, t) => s + t.amount, 0)),
  };

  await saveFinancialSnapshot(userId, snapshot);
}

// ── Webhook handlers ──────────────────────────────────────────────────────────

async function handleTransactionsWebhook(webhook: TransactionsWebhook) {
  const userId = await getUserIdForItem(webhook.item_id);
  if (!userId) return;

  const profile = await getUserProfile(userId);
  const accessToken = (profile as any)?.plaidAccessToken;
  if (!accessToken) {
    console.error('No access token found for user', userId);
    return;
  }

  // Refresh snapshot whenever new transaction data is available
  if (
    ['SYNC_UPDATES_AVAILABLE', 'DEFAULT_UPDATE', 'INITIAL_UPDATE', 'HISTORICAL_UPDATE']
      .includes(webhook.webhook_code)
  ) {
    await refreshSnapshot(userId, accessToken);
    console.log(`Refreshed snapshot for user ${userId} after ${webhook.webhook_code}`);
  }
}

async function handleItemWebhook(webhook: ItemWebhook) {
  console.log('Item webhook received:', webhook.webhook_code, 'for item', webhook.item_id);
  if (webhook.webhook_code === 'ERROR') {
    console.error('Plaid item error:', webhook.error);
  }
  if (webhook.webhook_code === 'PENDING_EXPIRATION') {
    // TODO: notify the user that their bank connection needs re-authorization
    console.warn('Item pending expiration — user should reconnect:', webhook.item_id);
  }
  if (webhook.webhook_code === 'USER_PERMISSION_REVOKED') {
    console.warn('User revoked Plaid permission for item:', webhook.item_id);
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const webhookData = await request.json();
    console.log('Received webhook:', webhookData);

    if (!isPlaidWebhook(webhookData)) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    switch (webhookData.webhook_type) {
      case 'TRANSACTIONS':
        await handleTransactionsWebhook(webhookData as TransactionsWebhook);
        break;
      case 'ITEM':
        await handleItemWebhook(webhookData as ItemWebhook);
        break;
      default:
        console.warn('Unhandled webhook type:', webhookData.webhook_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
