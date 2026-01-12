const STORAGE_ENDPOINT = (
  process.env.MINIO_ENDPOINT ?? "http://127.0.0.1:9000"
).replace(/\/$/, "");
const STORAGE_REGION = process.env.MINIO_REGION ?? "us-east-1";
const AVATAR_BUCKET =
  process.env.MINIO_BUCKET ?? process.env.MINIO_BUCKET_NAME ?? "senkou";
const AVATAR_PUBLIC_BASE = (
  process.env.MINIO_PUBLIC_URL ?? STORAGE_ENDPOINT
).replace(/\/$/, "");
const AVATAR_PREFIX = sanitizePrefix(
  process.env.MINIO_AVATAR_PREFIX ?? process.env.MINIO_AVATAR_PATH ?? "public"
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

  const sanitizedKey = trimmed.replace(/^\/+/, "");
  const keyWithoutBucket = sanitizedKey.startsWith(`${AVATAR_BUCKET}/`)
    ? sanitizedKey.slice(AVATAR_BUCKET.length + 1)
    : sanitizedKey;

  return buildAvatarPublicUrl(keyWithoutBucket);
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
