import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";

const MAX_DIMENSION = 1080;
const WEBP_QUALITY = 85;

export async function resizeProfilePhoto(r2Key: string): Promise<void> {
  const { Body } = await r2Client.send(
    new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: r2Key }),
  );
  if (!Body) return;

  const original = Buffer.from(await Body.transformToByteArray());

  const resized = await sharp(original)
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
      Body: resized,
      ContentType: "image/webp",
    }),
  );
}
