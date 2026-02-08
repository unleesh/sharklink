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

export const redis = new Redis({
  url: getRedisUrl(),
  token: getRedisToken(),
});
