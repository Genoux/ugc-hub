import { Client } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let client: Client | null = null;
      let keepAliveInterval: NodeJS.Timeout | null = null;

      try {
        client = new Client({
          connectionString: process.env.DATABASE_URL!,
        });

        await client.connect();

        await client.query("LISTEN submission_created");

        controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

        client.on("notification", (msg) => {
          if (msg.channel === "submission_created") {
            try {
              const payload = JSON.parse(msg.payload || "{}");
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "submission_created", data: payload })}\n\n`)
              );
            } catch (error) {
              console.error("Error parsing notification payload:", error);
            }
          }
        });

        keepAliveInterval = setInterval(() => {
          controller.enqueue(encoder.encode('data: {"type":"heartbeat"}\n\n'));
        }, 30000);

        client.on("error", (error) => {
          console.error("Database connection error:", error);
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          controller.close();
        });
      } catch (error) {
        console.error("SSE setup error:", error);
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        if (client) {
          client.removeAllListeners();
          await client.end().catch(console.error);
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
