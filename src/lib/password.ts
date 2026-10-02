import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const HASH_BYTES = 64;
const SALT_BYTES = 16;

function derive(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, HASH_BYTES, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES);
  const hash = await derive(password, salt);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, saltString, hashString, ...extra] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltString || !hashString || extra.length) {
    return false;
  }
  try {
    const salt = Buffer.from(saltString, "base64url");
    const expected = Buffer.from(hashString, "base64url");
    if (salt.length !== SALT_BYTES || expected.length !== HASH_BYTES) return false;
    const actual = await derive(password, salt);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
