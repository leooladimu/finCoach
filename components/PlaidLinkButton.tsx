'use client';

'use client';

import { usePlaidLink } from 'react-plaid-link';
import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

export function PlaidLinkButton({ userId }: { userId: string }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkFlowStarted, setLinkFlowStarted] = useState(false);


  const createLinkToken = useCallback(async () => {
    setLoading(true);
    setLinkToken(null);
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      setLinkToken(data.link_token);
      setLinkFlowStarted(true);
    } catch (error) {
      console.error('Error creating link token:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const onSuccess = async (publicToken: string) => {
    try {
      await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicToken,
        userId }),
      });
      // Refresh or redirect after successful connection
      window.location.reload();
    } catch (error) {
      console.error('Error exchanging public token:', error);
    }
  };


  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: (err, metadata) => {
      setLinkFlowStarted(false);
      setLinkToken(null);
      console.log('Plaid Link exit:', { err, metadata });
    },
    onEvent: (eventName, metadata) => {
      console.log('Plaid Link event:', { eventName, metadata });
    },
    // Only initialize Plaid Link when linkToken is set
    enabled: !!linkToken,
  });

  if (loading) {
    return (
      <button
        disabled
        className="w-full bg-amber-200 text-amber-800 font-medium py-3 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </button>
    );
  }

  // If linkToken is set, show the Plaid Link button
  if (linkToken && linkFlowStarted) {
    return (
      <button
        onClick={() => open()}
        disabled={!ready}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
      >
        Connect Bank Account
      </button>
    );
  }

  // Default: show the "Sync Bank Accounts" button
  return (
    <button
      onClick={createLinkToken}
      disabled={loading}
      className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
    >
      Sync Bank Accounts
    </button>
  );
}
