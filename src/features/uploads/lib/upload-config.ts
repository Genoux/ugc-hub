import { ALLOWED_UPLOAD_MIME_TYPES, DEFAULT_UPLOAD_MAX_FILE_SIZE } from "@/shared/lib/constant";

export const UPLOAD_CONFIG = {
  allowedMimeTypes: ALLOWED_UPLOAD_MIME_TYPES,
  maxFileSize: DEFAULT_UPLOAD_MAX_FILE_SIZE,
  maxFiles: 50,
  chunkSize: 5 * 1024 * 1024, // 5MB chunks for multipart
} as const;
