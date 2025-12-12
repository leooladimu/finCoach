import { NextRequest, NextResponse } from 'next/server';
import { createLinkToken } from '@/lib/plaid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
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
  } catch (error) {
    console.error('Error creating link token:', error);
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}
