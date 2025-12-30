// app/api/plaid/webhook/route.ts
import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { kv } from '@vercel/kv';

// Type definitions for Plaid webhooks
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
  webhook_code: 'SYNC_UPDATES_AVAILABLE' | 'DEFAULT_UPDATE' | 'TRANSACTIONS_REMOVED' | 'INITIAL_UPDATE' | 'HISTORICAL_UPDATE';
  new_transactions?: number;
  removed_transactions?: string[];
};

type ItemWebhook = PlaidWebhookBase & {
  webhook_type: 'ITEM';
  webhook_code: 'ERROR' | 'PENDING_EXPIRATION' | 'USER_PERMISSION_REVOKED' | 'WEBHOOK_UPDATE_ACKNOWLEDGED';
};

type HoldingsWebhook = PlaidWebhookBase & {
  webhook_type: 'HOLDINGS';
  webhook_code: 'DEFAULT_UPDATE' | 'NEW_AVAILABLE' | string; // Add more specific codes as needed
};

type InvestmentsTransactionsWebhook = PlaidWebhookBase & {
  webhook_type: 'INVESTMENTS_TRANSACTIONS';
  webhook_code: 'SYNC_UPDATES_AVAILABLE' | 'DEFAULT_UPDATE' | string;
  new_investment_transactions?: number;
  cancelled_investment_transactions?: string[];
};

type IdentityWebhook = PlaidWebhookBase & {
  webhook_type: 'IDENTITY';
  webhook_code: 'VERIFICATION_PENDING_REVIEW' | 'VERIFICATION_REVIEWABLE' | 'VERIFICATION_EXPIRED' | 'VERIFICATION_FAILED' | 'AUTOMATICALLY_VERIFIED' | 'VERIFICATION_PENDING_MATCH' | 'VERIFICATION_PENDING' | 'VERIFICATION_REVIEW' | string;
  account_id?: string;
  verification_status?: string;
};

type InvestmentsWebhook = PlaidWebhookBase & {
  webhook_type: 'INVESTMENTS';
  webhook_code: 'DEFAULT_UPDATE' | 'NEW_AVAILABLE' | string;
};

type LiabilitiesWebhook = PlaidWebhookBase & {
  webhook_type: 'LIABILITIES';
  webhook_code: 'DEFAULT_UPDATE' | 'NEW_AVAILABLE' | string;
};

type PlaidWebhook = 
  | TransactionsWebhook 
  | ItemWebhook 
  | HoldingsWebhook 
  | InvestmentsTransactionsWebhook
  | IdentityWebhook
  | InvestmentsWebhook
  | LiabilitiesWebhook;

function isPlaidWebhook(data: unknown): data is PlaidWebhook {
  return (
    data !== null &&
    typeof data === 'object' &&
    'webhook_type' in data &&
    'webhook_code' in data
  );
}

export async function POST(request: Request) {
  try {
    const webhookData = await request.json();
    console.log('Received webhook:', webhookData);

    if (!isPlaidWebhook(webhookData)) {
      console.error('Invalid webhook data:', webhookData);
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    switch (webhookData.webhook_type) {
      case 'TRANSACTIONS':
        await handleTransactionsWebhook(webhookData as TransactionsWebhook);
        break;
      case 'ITEM':
        await handleItemWebhook(webhookData as ItemWebhook);
        break;
      case 'HOLDINGS':
        await handleHoldingsWebhook(webhookData as HoldingsWebhook);
        break;
      case 'INVESTMENTS_TRANSACTIONS':
        await handleInvestmentsTransactionsWebhook(webhookData as InvestmentsTransactionsWebhook);
        break;
      default:
        console.warn('Unhandled webhook type:', webhookData.webhook_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

async function handleTransactionsWebhook(webhookData: TransactionsWebhook) {
  console.log('Handling transactions webhook:', webhookData);
  // Implement your transactions webhook handling logic here
}

async function handleItemWebhook(webhookData: ItemWebhook) {
  console.log('Handling item webhook:', webhookData);
  // Implement your item webhook handling logic here
}

async function handleHoldingsWebhook(webhookData: HoldingsWebhook) {
  console.log('Handling holdings webhook:', webhookData);
  // Implement your holdings webhook handling logic here
}

async function handleInvestmentsTransactionsWebhook(webhookData: InvestmentsTransactionsWebhook) {
  console.log('Handling investments transactions webhook:', webhookData);
  // Implement your investments transactions webhook handling logic here
}

async function handleIdentityWebhook(webhookData: IdentityWebhook) {
  console.log('Handling identity webhook:', webhookData);
  // Implement your identity webhook handling logic here
}

async function handleInvestmentsWebhook(webhookData: InvestmentsWebhook) {
  console.log('Handling investments webhook:', webhookData);
  // Implement your investments webhook handling logic here
}

async function handleLiabilitiesWebhook(webhookData: LiabilitiesWebhook) {
  console.log('Handling liabilities webhook:', webhookData);
  // Implement your liabilities webhook handling logic here
}
