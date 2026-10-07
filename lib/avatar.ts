import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const AVATAR_EXTENSIONS = ["png", "jpg", "webp", "gif", "avif"] as const;

export type AvatarExtension = (typeof AVATAR_EXTENSIONS)[number];

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export const AVATAR_BUCKET = process.env.AWS_S3_BUCKET ?? "avatars";

const AVATAR_CACHE_CONTROL = "public, max-age=31536000, immutable";

const MAGIC_BYTES: Record<AvatarExtension, number[][]> = {
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  jpg: [[0xff, 0xd8, 0xff]],
  webp: [[0x52, 0x49, 0x46, 0x46]],
  gif: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  avif: [[0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]],
};

function validateMagicBytes(body: Uint8Array, ext: AvatarExtension): boolean {
  const signatures = MAGIC_BYTES[ext];
  if (!signatures) return false;

  for (const sig of signatures) {
    if (body.length >= sig.length) {
      let match = true;
      for (let i = 0; i < sig.length; i++) {
        if (body[i] !== sig[i]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
  }
  return false;
}

let s3Client: S3Client | null = null;

function getS3Client() {
  if (s3Client) return s3Client;
  return (s3Client = new S3Client({
    region: process.env.AWS_REGION ?? "us-east-2",
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
    forcePathStyle: true,
  }));
}

export function avatarPublicUrl(key: string): string | null {
  if (!process.env.AWS_ENDPOINT_URL_S3) return null;
  return `${process.env.AWS_ENDPOINT_URL_S3}/${AVATAR_BUCKET}/${key}`;
}

export function avatarKeyForUser(userId: string, ext: AvatarExtension) {
  return `users/${userId}/${randomUUID()}.${ext}`;
}

export async function putAvatarObject(
  userId: string,
  ext: AvatarExtension,
  body: Uint8Array,
  contentType: string
): Promise<string> {
  if (!validateMagicBytes(body, ext)) {
    throw new Error("Invalid file content: magic bytes do not match declared type");
  }
  const key = avatarKeyForUser(userId, ext);
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: AVATAR_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: AVATAR_CACHE_CONTROL,
    })
  );
  return key;
}

export async function deleteAvatarObject(key: string) {
  try {
    await getS3Client().send(
      new DeleteObjectCommand({ Bucket: AVATAR_BUCKET, Key: key })
    );
  } catch (err) {
    if ((err as { name?: string })?.name === "NoSuchKey") return;
    throw err;
  }
}

export function extensionForMime(mime: string): AvatarExtension | null {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return null;
  }
}

export const MAX_POSTER_BYTES = 5 * 1024 * 1024;

/** Storage key for an uploaded event poster: `events/<uuid>.<ext>`. */
export function posterKey(ext: AvatarExtension) {
  return `events/${randomUUID()}.${ext}`;
}

export async function putPosterObject(
  ext: AvatarExtension,
  body: Uint8Array,
  contentType: string
): Promise<string> {
  if (!validateMagicBytes(body, ext)) {
    throw new Error("Invalid file content: magic bytes do not match declared type");
  }
  const key = posterKey(ext);
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: AVATAR_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: AVATAR_CACHE_CONTROL,
    })
  );
  return key;
}

export async function deletePosterObject(key: string) {
  await deleteAvatarObject(key);
}

/**
 * Turns whatever is stored in `events.poster` into a URL the browser can
 * load: bundled `/images/…` paths and full URLs pass through, storage keys
 * are resolved against the configured endpoint.
 */
export function resolvePosterUrl(poster: string | null | undefined): string {
  if (!poster) return "";
  if (
    poster.startsWith("/") ||
    poster.startsWith("http://") ||
    poster.startsWith("https://")
  ) {
    return poster;
  }
  return avatarPublicUrl(poster) ?? "";
}

/** True when the poster is an uploaded storage object rather than a bundled asset. */
export function isUploadedPoster(poster: string | null | undefined): boolean {
  return Boolean(poster) && !poster!.startsWith("/") && !poster!.startsWith("http");
}