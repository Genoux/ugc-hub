import { waitUntil } from "@vercel/functions";
import { env } from "@/shared/lib/env";
import { buildSlackBlocks, buildSlackText, type SlackEvent } from "./slack-events";

async function sendToSlack(webhookUrl: string, event: SlackEvent): Promise<void> {
  const blocks = buildSlackBlocks(event);
  const text = buildSlackText(event);
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, blocks }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[slack] webhook returned ${res.status}: ${body}`);
  }
}

const logSlackError = (err: unknown) => console.error("[slack] notification failed", err);

/**
 * Schedules a Slack notification to run after the response is sent (Vercel waitUntil).
 * Fire-and-forget with void gets killed on serverless; after() can be unreliable in Server Actions.
 * Accepts a Promise<SlackEvent> when the payload depends on async work (e.g. profile-complete with signed URL).
 */
export function notifySlack(event: SlackEvent | Promise<SlackEvent>): void {
  if (process.env.NODE_ENV === "development") return;
  if (!env.SLACK_WEBHOOK_URL) {
    console.warn("[slack] SLACK_WEBHOOK_URL is not set — skipping notification");
    return;
  }
  const url = env.SLACK_WEBHOOK_URL;
  const promise =
    event instanceof Promise
      ? event.then((e) => sendToSlack(url, e)).catch(logSlackError)
      : sendToSlack(url, event).catch(logSlackError);
  waitUntil(promise);
}
