import { env } from "@/shared/lib/env";
import { buildSlackBlocks, buildSlackText, type SlackEvent } from "./slack-events";

export async function notifySlack(event: SlackEvent): Promise<void> {
  if (process.env.NODE_ENV === "development") return;
  if (!env.SLACK_WEBHOOK_URL) {
    console.warn("[slack] SLACK_WEBHOOK_URL is not set — skipping notification");
    return;
  }

  try {
    const blocks = buildSlackBlocks(event);
    const text = buildSlackText(event);
    const res = await fetch(env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, blocks }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[slack] webhook returned ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error("[slack] notification failed", err);
  }
}
