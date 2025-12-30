// app/components/PlaidScript.tsx
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Plaid: any;
  }
}

export default function PlaidScript() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      console.log('Plaid Link script loaded successfully');
      window.Plaid = window.Plaid || {};
      setReady(true);
    };

    const handleError = (e: Event | string) => {
      if (e instanceof ErrorEvent) {
        console.error('Plaid Link script failed to load', e.message, e.filename, e.lineno, e.colno);
      } else if (typeof e === 'string') {
        console.error('Plaid Link script failed to load with message:', e);
      } else {
        console.error('Plaid Link script failed to load', e);
      }
    };

    // Check if already loaded
    if (window.Plaid) {
      console.log('Plaid already loaded');
      handleLoad();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = handleLoad;
    script.onerror = handleError;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
