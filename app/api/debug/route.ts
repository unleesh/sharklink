import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  let redisStatus: string;
  try {
    await redis.set('debug:ping', 'pong');
    const value = await redis.get('debug:ping');
    redisStatus = value === 'pong' ? '✅ connected' : '❌ unexpected value';
  } catch (error: any) {
    redisStatus = `❌ error: ${error.message}`;
  }

  return NextResponse.json({
    KV_REST_API_URL: process.env.KV_REST_API_URL ? '✅ set' : '❌ missing',
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '✅ set' : '❌ missing',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? '✅ set' : '❌ missing',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ set' : '❌ missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ set' : '❌ missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ missing',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ set' : '❌ missing',
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || '❌ missing',
    redis: redisStatus,
  });
}
