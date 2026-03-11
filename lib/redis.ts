// lib/redis.ts
import { Redis } from '@upstash/redis';

const getRedisUrl = () => {
  return process.env.KV_REST_API_URL ||
         process.env.UPSTASH_REDIS_REST_URL ||
         '';
};

const getRedisToken = () => {
  return process.env.KV_REST_API_TOKEN ||
         process.env.UPSTASH_REDIS_REST_TOKEN ||
         '';
};

let _redis: Redis | null = null;

export const getRedis = (): Redis => {
  if (_redis) return _redis;

  const url = getRedisUrl();
  const token = getRedisToken();

  if (!url || !token) {
    throw new Error(
      'Redis environment variables are not set. ' +
      'Please configure KV_REST_API_URL and KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* equivalents).'
    );
  }

  _redis = new Redis({ url, token });
  return _redis;
};

// Backward-compatible proxy so existing imports still work
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    return (getRedis() as any)[prop];
  },
});
