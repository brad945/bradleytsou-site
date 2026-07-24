"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AutoRefreshProps {
  /** Seconds between refreshes. Should match the fetch revalidate window. */
  intervalSeconds: number;
}

/**
 * Re-fetches the server-rendered page on an interval so the killfeed actually
 * ticks over for someone leaving the tab open. ISR alone only revalidates on a
 * new request — this supplies the request.
 *
 * Pauses while the tab is hidden so a background tab isn't burning GitHub's
 * unauthenticated rate limit.
 */
export default function AutoRefresh({ intervalSeconds }: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, intervalSeconds * 1000);

    return () => window.clearInterval(id);
  }, [router, intervalSeconds]);

  return null;
}
