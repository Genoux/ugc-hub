import { Client } from 'pg'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let client: Client | null = null
      let keepAliveInterval: NodeJS.Timeout | null = null

      try {
        // Create a persistent PostgreSQL connection for LISTEN/NOTIFY
        client = new Client({
          connectionString: process.env.DATABASE_URL!,
        })

        await client.connect()

        // Listen for submission_created notifications
        await client.query('LISTEN submission_created')

        // Send initial connected message
        controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))

        // Set up notification handler
        client.on('notification', (msg) => {
          if (msg.channel === 'submission_created') {
            try {
              const payload = JSON.parse(msg.payload || '{}')

              // Only send notification if it's for this campaign
              if (payload.campaign_id === campaignId) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'submission_created', data: payload })}\n\n`
                  )
                )
              }
            } catch (error) {
              console.error('Error parsing notification payload:', error)
            }
          }
        })

        // Keep connection alive with periodic heartbeat
        keepAliveInterval = setInterval(() => {
          controller.enqueue(encoder.encode('data: {"type":"heartbeat"}\n\n'))
        }, 30000) // Send heartbeat every 30 seconds

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          if (keepAliveInterval) clearInterval(keepAliveInterval)
          if (client) {
            client.removeAllListeners()
            client.end().catch(console.error)
          }
          controller.close()
        })

        // Handle database connection errors
        client.on('error', (error) => {
          console.error('Database connection error:', error)
          if (keepAliveInterval) clearInterval(keepAliveInterval)
          controller.close()
        })

      } catch (error) {
        console.error('SSE setup error:', error)
        if (keepAliveInterval) clearInterval(keepAliveInterval)
        if (client) {
          client.removeAllListeners()
          await client.end().catch(console.error)
        }
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
