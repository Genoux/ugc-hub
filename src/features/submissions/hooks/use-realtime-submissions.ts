//TODO: Update this to use update neon DB shema

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useRealtimeSubmissions() {
  const queryClient = useQueryClient();
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
            // Invalidate queries to refetch in background
            queryClient.invalidateQueries({ queryKey: ["submissions"] });
            if (data.payload?.submission_id) {
              queryClient.invalidateQueries({
                queryKey: ["submission", data.payload.submission_id],
              });
            }
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
  }, [queryClient]);
}
