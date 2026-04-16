import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { extname } from "node:path";

import {
  AVATAR_BUCKET,
  STORAGE_ENDPOINT,
  STORAGE_REGION,
  buildAvatarObjectKey,
  buildAvatarPublicUrl,
} from "./avatar";

const DEFAULT_ENDPOINT = STORAGE_ENDPOINT;
const DEFAULT_REGION = STORAGE_REGION;
const BUCKET_NAME = AVATAR_BUCKET;
const MAX_PROFILE_IMAGE_BYTES = 256 * 1024; // Keep avatars lightweight for quicker loads

let cachedClient: S3Client | null = null;

function getStorageClient() {
  if (cachedClient) return cachedClient;

  const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Supabase S3 credentials. Set SUPABASE_S3_ACCESS_KEY_ID and SUPABASE_S3_SECRET_ACCESS_KEY."
    );
  }

  cachedClient = new S3Client({
    endpoint: DEFAULT_ENDPOINT,
    region: DEFAULT_REGION,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  return cachedClient;
}

type UploadProfileImageArgs = {
  dataUrl: string;
  userId: number;
  originalFileName?: string;
};

export async function uploadProfileImageFromDataUrl({
  dataUrl,
  userId,
  originalFileName,
}: UploadProfileImageArgs) {
  const client = getStorageClient();
  const { buffer, mimeType, extension } = decodeImageDataUrl(dataUrl);
  const normalizedExt = sanitizeExtension(
    extension || (originalFileName ? extname(originalFileName) : "") || "png"
  );
  const key = buildAvatarObjectKey(
    userId,
    `avatar-${Date.now()}.${normalizedExt}`
  );

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    key,
    url: buildAvatarPublicUrl(key),
    contentType: mimeType,
    size: buffer.byteLength,
  };
}

function decodeImageDataUrl(dataUrl: string) {
  const [metadata, base64Payload] = dataUrl.split(",", 2);
  if (!metadata || !metadata.startsWith("data:") || !base64Payload) {
    throw new Error("Invalid image payload. Please choose a valid image file.");
  }

  if (!metadata.includes(";base64")) {
    throw new Error("Profile image must be base64 encoded.");
  }

  const mimeType = metadata.slice(5, metadata.indexOf(";"));
  if (!mimeType.startsWith("image/")) {
    throw new Error("Only image uploads are allowed for profile pictures.");
  }

  const buffer = Buffer.from(base64Payload, "base64");
  if (!buffer.byteLength) {
    throw new Error("Profile image is empty. Please select a different file.");
  }

  if (buffer.byteLength > MAX_PROFILE_IMAGE_BYTES) {
    const limitKb = Math.floor(MAX_PROFILE_IMAGE_BYTES / 1024);
    throw new Error(`Profile image is too large. Max size: ${limitKb}KB.`);
  }

  const extension = mimeType.split("/")[1]?.split("+")[0] ?? "png";

  return {
    buffer,
    mimeType,
    extension,
  };
}

function sanitizeExtension(ext: string) {
  const cleaned = ext.replace(/^\./, "").toLowerCase();
  return cleaned && /^[a-z0-9]+$/.test(cleaned) ? cleaned : "png";
}
