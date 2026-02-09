import { NextRequest, NextResponse } from 'next/server'
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3'
import { r2Client, R2_BUCKET_NAME } from '@/features/uploads/lib/r2-client'
import { db } from '@/shared/lib/db'
import { assets } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { uploadId, key, parts, submissionId, filename, mimeType, sizeBytes } =
      await request.json()

    if (uploadId && parts) {
      const command = new CompleteMultipartUploadCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      })

      await r2Client.send(command)
    }

    const [asset] = await db.insert(assets).values({
      submissionId,
      r2Key: key,
      filename,
      mimeType,
      sizeBytes,
      uploadStatus: 'completed',
    }).returning()

    return NextResponse.json({ asset })
  } catch (error) {
    console.error('Complete upload error:', error)
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    )
  }
}
