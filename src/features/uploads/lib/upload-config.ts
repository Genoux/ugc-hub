export const UPLOAD_CONFIG = {
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ],
  maxFileSize: 500 * 1024 * 1024, // 500MB
  maxFiles: 50,
  chunkSize: 5 * 1024 * 1024, // 5MB chunks for multipart
} as const
