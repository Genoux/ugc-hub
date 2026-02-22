export const UPLOAD_CONFIG = {
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
  ],
  maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
  maxFiles: 50,
  chunkSize: 5 * 1024 * 1024, // 5MB chunks for multipart
} as const;
