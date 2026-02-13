"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useRealtimeSubmissions(campaignId: string) {
  const queryClient = useQueryClient();
  const campaignIdRef = useRef(campaignId);
  const reconnectAttempts = useRef(0);
  const mounted = useRef(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  campaignIdRef.current = campaignId;

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
          const isRelevantType =
            data.type === "submission_created" || data.type === "submission_updated";
          const isRelevantCampaign = data.payload?.campaign_id === campaignIdRef.current;

          if (isRelevantType && isRelevantCampaign) {
            // Invalidate queries to refetch in background
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            queryClient.invalidateQueries({
              queryKey: ["campaign", campaignIdRef.current],
            });
            // Data updates automatically - no jarring reload!
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
        if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          toast.error("Real-time updates disconnected. Refresh the page to reconnect.");
          return;
        }
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
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
