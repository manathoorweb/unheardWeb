"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export function PhonePeProvider() {
  const [scriptUrl, setScriptUrl] = useState("https://mercury-stg.phonepe.com/web/bundle/checkout.js");

  useEffect(() => {
    // Check if we are in production based on the current hostname or env
    const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('sandbox');
    if (isProduction) {
      setScriptUrl("https://mercury.phonepe.com/web/bundle/checkout.js");
    }
  }, []);

  return (
    <Script 
      src={scriptUrl}
      strategy="lazyOnload"
      onLoad={() => {
        console.log("✅ PhonePe Checkout SDK loaded successfully.");
      }}
    />
  );
}

// Helper to use PhonePe transact
export const initiatePhonePeTransaction = (tokenUrl: string, callback: (response: string) => void) => {
  if (typeof window !== "undefined" && (window as any).PhonePeCheckout) {
    (window as any).PhonePeCheckout.transact({
      tokenUrl,
      callback,
      type: "IFRAME"
    });
  } else {
    // Fallback to redirect if script failed to load
    window.location.href = tokenUrl;
  }
};
