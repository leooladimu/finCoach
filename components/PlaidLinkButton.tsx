"use client";

import { usePlaidLink } from "react-plaid-link";
import { useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function PlaidLinkButton({ userId }: { userId: string }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const createLinkToken = useCallback(async () => {
    if (loading || hasAttempted) return;

    console.log("Creating link token for userId:", userId);
    setLoading(true);
    setHasAttempted(true);
    try {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to create link token");
      }

      const data = await response.json();
      console.log("Link token received:", data.link_token ? "Yes" : "No");
      setLinkToken(data.link_token);
    } catch (error) {
      console.error("Error creating link token:", error);
      alert(
        "Failed to initialize Plaid: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
      setLinkToken(null);
    } finally {
      setLoading(false);
      setTimeout(() => setHasAttempted(false), 3000);
    }
  }, [userId, loading, hasAttempted]);

  const onSuccess = async (publicToken: string) => {
    try {
      await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicToken, userId }),
      });
      // Refresh or redirect after successful connection
      window.location.reload();
    } catch (error) {
      console.error("Error exchanging public token:", error);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: (err, metadata) => {
      setLinkToken(null);
      setHasAttempted(false);
      console.log("Plaid Link exit:", { err, metadata });
      if (err) {
        console.error("Plaid error:", err);
      }
    },
    onEvent: (eventName, metadata) => {
      console.log("Plaid Link event:", { eventName, metadata });
    },
  });

  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

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
