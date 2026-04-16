// Supabase S3-compatible API endpoint: https://<project-ref>.supabase.co/storage/v1/s3
const STORAGE_ENDPOINT = (
  process.env.SUPABASE_S3_ENDPOINT ?? "https://your-project-ref.supabase.co/storage/v1/s3"
).replace(/\/$/, "");
const STORAGE_REGION = process.env.SUPABASE_S3_REGION ?? "us-east-1";
const AVATAR_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "avatars";
// Public base: https://<project-ref>.supabase.co/storage/v1/object/public
const AVATAR_PUBLIC_BASE = (
  process.env.SUPABASE_STORAGE_PUBLIC_URL ?? ""
).replace(/\/$/, "");
const AVATAR_PREFIX = sanitizePrefix(
  process.env.SUPABASE_STORAGE_AVATAR_PREFIX ?? ""
);

export {
  AVATAR_BUCKET,
  AVATAR_PREFIX,
  AVATAR_PUBLIC_BASE,
  STORAGE_ENDPOINT,
  STORAGE_REGION,
};

export function buildAvatarObjectKey(userId: number, fileName: string) {
  return buildObjectKey(AVATAR_PREFIX, `${userId}`, fileName);
}

export function buildAvatarPublicUrl(key: string) {
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  // Supabase public URL format: <public-base>/<bucket>/<key>
  // e.g. https://<ref>.supabase.co/storage/v1/object/public/avatars/public/1/avatar.png
  return `${AVATAR_PUBLIC_BASE}/${AVATAR_BUCKET}/${encodedKey}`;
}

export function resolveProfileImageUrl(raw?: string | null) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  return buildAvatarPublicUrl(trimmed.replace(/^\/+/, ""));
}

function sanitizePrefix(prefix: string) {
  return prefix.replace(/^\/+|\/+$/g, "");
}

function buildObjectKey(...segments: string[]) {
  return segments
    .filter(Boolean)
    .map((segment) => segment.replace(/^\/+|\/+$/g, ""))
    .join("/");
}
