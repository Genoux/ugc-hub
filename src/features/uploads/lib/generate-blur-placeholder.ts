import { GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { R2_BUCKET_NAME, r2Client } from "./r2-client";

export async function generateBlurPlaceholder(r2Key: string): Promise<string | null> {
  const { Body } = await r2Client.send(
    new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: r2Key }),
  );
  if (!Body) return null;
  const buffer = Buffer.from(await Body.transformToByteArray());
  const tiny = await sharp(buffer)
    .resize(10, 10, { fit: "cover" })
    .jpeg({ quality: 40 })
    .toBuffer();
  return `data:image/jpeg;base64,${tiny.toString("base64")}`;
}
