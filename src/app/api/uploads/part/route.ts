import { UploadPartCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get("uploadId");
    const key = searchParams.get("key");
    const partNumber = searchParams.get("partNumber");

    if (!uploadId || !key || !partNumber) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const body = await request.arrayBuffer();

    const command = new UploadPartCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      PartNumber: Number.parseInt(partNumber, 10),
      Body: Buffer.from(body),
    });

    const response = await r2Client.send(command);

    return new NextResponse(null, {
      status: 200,
      headers: {
        ETag: response.ETag || "",
      },
    });
  } catch (error) {
    console.error("Part upload error:", error);
    return NextResponse.json({ error: "Failed to upload part" }, { status: 500 });
  }
}
