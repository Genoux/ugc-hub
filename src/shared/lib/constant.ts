export const EASING_FUNCTION = {
  exponential: [0.16, 1, 0.3, 1],
  quartic: [0.78, 0, 0.22, 1],
} as const;

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
] as const;

export const DEFAULT_UPLOAD_MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
