import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params
  
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sql = neon(process.env.DATABASE_URL!)
      
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))

      const intervalId = setInterval(async () => {
        try {
          const result = await sql`
            SELECT 1 FROM submissions 
            WHERE campaign_id = ${campaignId} 
            LIMIT 1
          `
          
          if (result) {
            controller.enqueue(encoder.encode('data: {"type":"ping"}\n\n'))
          }
        } catch (error) {
          console.error('SSE ping error:', error)
        }
      }, 15000)

      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId)
        controller.close()
      })
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
