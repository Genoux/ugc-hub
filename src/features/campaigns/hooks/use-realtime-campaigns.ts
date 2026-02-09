"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRealtimeCampaigns() {
  const router = useRouter();

  useEffect(() => {
    const eventSource = new EventSource("/api/campaigns/live");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "connected" || data.type === "submission_created") {
        router.refresh();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [router]);
}
