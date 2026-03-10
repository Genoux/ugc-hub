import { env } from "@/shared/lib/env";
import { buildSlackBlocks, buildSlackText, type SlackEvent } from "./slack-events";

export async function notifySlack(event: SlackEvent): Promise<void> {
  if (!env.SLACK_WEBHOOK_URL) return;

  try {
    const blocks = buildSlackBlocks(event);
    const text = buildSlackText(event);
    await fetch(env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, blocks }),
    });
  } catch (err) {
    console.error("[slack] notification failed", err);
  }
}
