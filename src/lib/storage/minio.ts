import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
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
let bucketReady: Promise<void> | null = null;

function getS3Client() {
  if (cachedClient) return cachedClient;

  const accessKeyId = process.env.MINIO_ACCESS_KEY || "minioadmin";
  const secretAccessKey = process.env.MINIO_SECRET_KEY || "minioadmin";

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing MinIO credentials. Set MINIO_ACCESS_KEY and MINIO_SECRET_KEY."
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

async function ensureBucketExists() {
  if (bucketReady) return bucketReady;

  const client = getS3Client();
  bucketReady = (async () => {
    try {
      await client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      return;
    } catch (error: unknown) {
      const statusCode =
        (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
          ?.httpStatusCode ?? (error as { statusCode?: number })?.statusCode;

      if (statusCode && statusCode !== 404) {
        throw error;
      }

      try {
        await client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      } catch (createError: unknown) {
        const alreadyExists =
          (createError as { name?: string }).name ===
            "BucketAlreadyOwnedByYou" ||
          (createError as { name?: string }).name === "BucketAlreadyExists" ||
          (createError as { $metadata?: { httpStatusCode?: number } })
            ?.$metadata?.httpStatusCode === 409;

        if (!alreadyExists) {
          throw createError;
        }
      }
    }
  })();

  return bucketReady;
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
  const client = getS3Client();
  const { buffer, mimeType, extension } = decodeImageDataUrl(dataUrl);
  const normalizedExt = sanitizeExtension(
    extension || (originalFileName ? extname(originalFileName) : "") || "png"
  );
  const key = buildAvatarObjectKey(
    userId,
    `avatar-${Date.now()}.${normalizedExt}`
  );

  await ensureBucketExists();

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
    url: buildPublicUrl(key),
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

function buildPublicUrl(key: string) {
  return buildAvatarPublicUrl(key);
}
