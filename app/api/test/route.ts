// Example: app/api/test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    plaidEnv: process.env.PLAID_ENV,
    clientId: process.env.PLAID_CLIENT_ID ? '✅ Set' : '❌ Not set',
    // Don't log the actual secret in production
    secretSet: process.env.PLAID_SECRET ? '✅ Set' : '❌ Not set'
  });
}
