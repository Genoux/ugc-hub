"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRealtimeSubmissions(campaignId: string) {
  const router = useRouter();

  useEffect(() => {
    const eventSource = new EventSource(`/api/campaigns/${campaignId}/live`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "connected" || data.type === "ping") {
        router.refresh();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [campaignId, router]);
}
