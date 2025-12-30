import { NextRequest, NextResponse } from 'next/server';
import { createLinkToken } from '@/lib/plaid';

export async function POST(request: NextRequest) {
  try {
    // Debug: Log Plaid environment variables
    console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID);
    console.log('PLAID_SECRET:', process.env.PLAID_SECRET ? 'set' : 'not set');
    console.log('PLAID_ENV:', process.env.PLAID_ENV);
    const body = await request.json();
    let { userId } = body;
    // If userId is not provided, use a unique fallback for testing
    if (!userId) {
      userId = `test-user-${Date.now()}`;
      console.warn('No userId provided, using fallback:', userId);
    }
    
    // userId is now always set
    
    // Check if Plaid credentials are configured
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      // Return mock token for development
      return NextResponse.json({
        link_token: 'link-sandbox-mock-token',
        expiration: new Date(Date.now() + 3600000).toISOString(),
      });
    }
    
    const linkToken = await createLinkToken(userId);
    
    return NextResponse.json({
      link_token: linkToken,
    });
  } catch (error: any) {
    // Debug: Log Plaid API error details
    if (error?.response?.data) {
      console.error('Plaid API error:', JSON.stringify(error.response.data, null, 2));
    } else if (error?.response) {
      console.error('Plaid API error (no data):', error.response);
    } else {
      console.error('Error creating link token:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}
