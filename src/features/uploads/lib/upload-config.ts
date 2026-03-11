import { ALLOWED_UPLOAD_MIME_TYPES, UPLOAD_SIZE_LIMITS } from "@/shared/lib/constants";

export const UPLOAD_CONFIG = {
  allowedMimeTypes: ALLOWED_UPLOAD_MIME_TYPES,
  maxFileSize: UPLOAD_SIZE_LIMITS.video,
  maxFiles: 50,
  chunkSize: 5 * 1024 * 1024, // 5MB chunks for multipart
} as const;
