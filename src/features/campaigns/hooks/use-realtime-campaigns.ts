"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useRealtimeCampaigns() {
  const router = useRouter();
  const reconnectAttempts = useRef(0);
  const mounted = useRef(true);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mounted.current = true;
    reconnectAttempts.current = 0;

    function connect() {
      eventSourceRef.current?.close();
      const eventSource = new EventSource("/api/live");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "submission_created" || data.type === "submission_updated") {
            router.refresh();
          }
        } catch {
          // ignore parse errors
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        if (!mounted.current) return;
        reconnectAttempts.current += 1;
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    }

    connect();

    return () => {
      mounted.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [router]);
}
