function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  DATABASE_URL: requiredEnv("DATABASE_URL"),
  NEON_AUTH_BASE_URL: requiredEnv("NEON_AUTH_BASE_URL"),
  NEON_AUTH_COOKIE_SECRET: requiredEnv("NEON_AUTH_COOKIE_SECRET"),
  AWS_ACCESS_KEY_ID: requiredEnv("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: requiredEnv("AWS_SECRET_ACCESS_KEY"),
  AWS_REGION: optionalEnv("AWS_REGION", "us-east-2"),
  AWS_ENDPOINT_URL_S3: requiredEnv("AWS_ENDPOINT_URL_S3"),
  AWS_S3_BUCKET: optionalEnv("AWS_S3_BUCKET", "avatars"),
  NODE_ENV: optionalEnv("NODE_ENV", "development"),
} as const;

export function validateEnv(): void {
  if (env.NODE_ENV === "production") {
    if (env.NEON_AUTH_COOKIE_SECRET.length < 32) {
      throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters in production");
    }
    if (env.AWS_ACCESS_KEY_ID === "" || env.AWS_SECRET_ACCESS_KEY === "") {
      throw new Error("AWS credentials must be set in production");
    }
  }
}

export function getEnv() {
  return env;
}