import { Client } from "pg";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let client: Client | null = null;
      let keepAliveInterval: NodeJS.Timeout | null = null;
      let isClosed = false;

      const cleanup = async () => {
        if (isClosed) return;
        isClosed = true;
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
        if (client) {
          client.removeAllListeners();
          await client.end().catch(console.error);
          client = null;
        }
        try {
          controller.close();
        } catch {
          // Already closed
        }
      };

      try {
        // LISTEN/NOTIFY requires a direct (unpooled) connection.
        // Pooled connections (PgBouncer) do not support it.
        const connectionString =
          process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL?.replace("-pooler.", ".");
        if (!connectionString) throw new Error("DATABASE_URL is not set");

        client = new Client({ connectionString });
        await client.connect();
        await client.query("LISTEN app_events");

        controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

        client.on("notification", (msg) => {
          if (isClosed) return;
          try {
            const event = JSON.parse(msg.payload || "{}");
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          } catch (error) {
            console.error("Error parsing notification payload:", error);
          }
        });

        keepAliveInterval = setInterval(() => {
          if (!isClosed) {
            try {
              controller.enqueue(encoder.encode('data: {"type":"heartbeat"}\n\n'));
            } catch {
              cleanup();
            }
          }
        }, 30000);

        request.signal.addEventListener("abort", cleanup);

        client.on("error", (error) => {
          console.error("Database connection error:", error);
          cleanup();
        });
      } catch (error) {
        console.error("SSE setup error:", error);
        await cleanup();
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
