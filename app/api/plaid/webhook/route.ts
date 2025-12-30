// app/api/plaid/webhook/route.ts
import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  try {
    const webhookData = await request.json();
    console.log('Received webhook:', webhookData);

    switch (webhookData.webhook_type) {
      case 'TRANSACTIONS':
        await handleTransactionsWebhook(webhookData);
        break;
      case 'ITEM':
        await handleItemWebhook(webhookData);
        break;
      case 'HOLDINGS':
      case 'INVESTMENTS_TRANSACTIONS':
        // Handle other webhook types as needed
        break;
    }

    return new Response('Webhook received', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
}

async function handleTransactionsWebhook(webhookData: any) {
  const { item_id: itemId } = webhookData;
  // Store or process the webhook data
  await kv.set(`plaid:webhook:${itemId}`, JSON.stringify({
    ...webhookData,
    receivedAt: new Date().toISOString()
  }));
}

async function handleItemWebhook(webhookData: any) {
  const { item_id: itemId } = webhookData;
  // Handle item-related webhook events
  await kv.set(`plaid:item:${itemId}:status`, webhookData.webhook_code);
}
