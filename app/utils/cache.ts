import crypto from "crypto";

const cache = new Map<string, string>();

export function hashChunk(text: string) {
  return crypto.createHash("md5").update(text).digest("hex");
}

export function getCache(key: string) {
  return cache.get(key);
}

export function setCache(key: string, value: string) {
  cache.set(key, value);
}
