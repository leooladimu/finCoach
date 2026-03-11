import { NextRequest, NextResponse } from 'next/server';
import { exchangePublicToken, getBalances, getTransactions, getInstitution } from '@/lib/plaid';
import { saveFinancialSnapshot, updateUserProfile, savePlaidItemIndex } from '@/lib/kv';
import type { FinancialSnapshot, Account, Transaction } from '@/types';

function mapAccountType(type: string, subtype: string | null): Account['type'] {
  if (type === 'depository') {
    return subtype === 'savings' ? 'savings' : 'checking';
  }
  if (type === 'credit') return 'credit';
  if (type === 'investment') return 'investment';
  if (type === 'loan') return 'loan';
  return 'checking';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicToken, userId } = body;

    if (!publicToken || !userId) {
      return NextResponse.json(
        { error: 'Public token and user ID are required' },
        { status: 400 }
      );
    }

    // Check if Plaid credentials are configured
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      return NextResponse.json({
        success: true,
        message: 'Bank account connected successfully (demo mode)',
        accounts: [
          {
            account_id: 'demo-checking-123',
            name: 'Demo Checking',
            type: 'depository',
            subtype: 'checking',
            balances: { available: 2500.75, current: 2750.50 },
          },
          {
            account_id: 'demo-savings-456',
            name: 'Demo Savings',
            type: 'depository',
            subtype: 'savings',
            balances: { available: 15420.00, current: 15420.00 },
          },
        ],
        institution: { name: 'Demo Bank', institution_id: 'demo_bank' },
      });
    }

    // Exchange public token for access token + item ID
    const { accessToken, itemId } = await exchangePublicToken(publicToken);

    // Write the item→userId index so webhooks can resolve ownership
    await savePlaidItemIndex(itemId, userId);

    // Persist the access token on the user profile for future fetches
    await updateUserProfile(userId, {
      plaidAccessToken: accessToken,
      plaidItemId: itemId,
    } as any);

    // Fetch accounts and last 30 days of transactions in parallel
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const [plaidAccounts, plaidTransactions, institution] = await Promise.all([
      getBalances(accessToken),
      getTransactions(accessToken, startDate, endDate),
      getInstitution(accessToken),
    ]);

    // Map Plaid accounts to our Account type
    const accounts: Account[] = plaidAccounts.map((acc) => ({
      id: acc.account_id,
      name: acc.name,
      type: mapAccountType(acc.type, acc.subtype ?? null),
      balance: acc.balances.current ?? 0,
      institution: institution?.name ?? 'Unknown',
    }));

    // Map Plaid transactions to our Transaction type
    const transactions: Transaction[] = plaidTransactions.map((txn) => ({
      id: txn.transaction_id,
      date: txn.date,
      amount: -txn.amount, // Plaid uses positive = debit; we use negative = spending
      category: (txn.personal_finance_category?.primary ?? txn.category?.[0] ?? 'Other'),
      merchant: txn.merchant_name ?? txn.name,
      accountId: txn.account_id,
    }));

    // Compute summary stats
    const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const spending = transactions.filter((t) => t.amount < 0);
    const income = transactions.filter((t) => t.amount > 0);
    const monthlyExpenses = Math.abs(spending.reduce((s, t) => s + t.amount, 0));
    const monthlyIncome = income.reduce((s, t) => s + t.amount, 0);

    const snapshot: FinancialSnapshot = {
      timestamp: new Date().toISOString(),
      accounts,
      transactions,
      netWorth,
      monthlyIncome,
      monthlyExpenses,
    };

    await saveFinancialSnapshot(userId, snapshot);

    return NextResponse.json({
      success: true,
      message: 'Bank account connected successfully',
      accounts: plaidAccounts.map((acc) => ({
        account_id: acc.account_id,
        name: acc.name,
        type: acc.type,
        subtype: acc.subtype,
        balances: acc.balances,
      })),
      institution: institution
        ? { name: institution.name, institution_id: institution.institution_id }
        : null,
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.json(
      { error: 'Failed to connect bank account' },
      { status: 500 }
    );
  }
}
