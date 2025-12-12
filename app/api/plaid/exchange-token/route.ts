import { NextRequest, NextResponse } from 'next/server';
import { exchangePublicToken, getBalances, getInstitution } from '@/lib/plaid';
// import { saveFinancialSnapshot } from '@/lib/kv';

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
      // Return mock data for development
      return NextResponse.json({
        success: true,
        message: 'Bank account connected successfully (demo mode)',
        accounts: [
          {
            account_id: 'demo-checking-123',
            name: 'Demo Checking',
            type: 'depository',
            subtype: 'checking',
            balances: {
              available: 2500.75,
              current: 2750.50,
            },
          },
          {
            account_id: 'demo-savings-456',
            name: 'Demo Savings',
            type: 'depository',
            subtype: 'savings',
            balances: {
              available: 15420.00,
              current: 15420.00,
            },
          },
        ],
        institution: {
          name: 'Demo Bank',
          institution_id: 'demo_bank',
        },
      });
    }
    
    // Exchange public token for access token
    const { accessToken } = await exchangePublicToken(publicToken);
    
    // Get account balances
    const accounts = await getBalances(accessToken);
    
    // Get institution info
    const institution = await getInstitution(accessToken);
    
    // TODO: Save to Vercel KV
    // await saveFinancialSnapshot(userId, {
    //   timestamp: new Date().toISOString(),
    //   accounts: accounts.map(acc => ({
    //     id: acc.account_id,
    //     name: acc.name,
    //     type: acc.type,
    //     subtype: acc.subtype || '',
    //     balance: acc.balances.current || 0,
    //   })),
    //   plaidAccessToken: accessToken,
    //   plaidItemId: itemId,
    // });
    
    return NextResponse.json({
      success: true,
      message: 'Bank account connected successfully',
      accounts: accounts.map(acc => ({
        account_id: acc.account_id,
        name: acc.name,
        type: acc.type,
        subtype: acc.subtype,
        balances: acc.balances,
      })),
      institution: institution ? {
        name: institution.name,
        institution_id: institution.institution_id,
      } : null,
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.json(
      { error: 'Failed to connect bank account' },
      { status: 500 }
    );
  }
}
