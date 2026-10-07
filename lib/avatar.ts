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