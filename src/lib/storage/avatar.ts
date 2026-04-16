const STORAGE_ENDPOINT = (
  process.env.SUPABASE_S3_ENDPOINT ?? ""
).replace(/\/$/, "");
const STORAGE_REGION = process.env.SUPABASE_S3_REGION ?? "us-east-1";
const AVATAR_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "avatars";
const AVATAR_PUBLIC_BASE = (
  process.env.SUPABASE_STORAGE_PUBLIC_URL ?? ""
).replace(/\/$/, "");
const AVATAR_PREFIX = sanitizePrefix(
  process.env.SUPABASE_STORAGE_AVATAR_PREFIX ?? ""
);

if (!AVATAR_PUBLIC_BASE) {
  throw new Error(
    "Missing SUPABASE_STORAGE_PUBLIC_URL. Set it to your Supabase public storage base URL."
  );
}

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
