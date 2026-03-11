// app/api/debug/route.ts
import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function GET() {
  const checks: Record<string, string> = {};

  // 1. 환경변수 체크
  checks.KV_REST_API_URL = process.env.KV_REST_API_URL ? '✅ set' : '❌ missing';
  checks.KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN ? '✅ set' : '❌ missing';
  checks.UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL ? '✅ set' : '❌ missing';
  checks.UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ set' : '❌ missing';
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? '✅ set' : '❌ missing';
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL || '❌ missing';
  checks.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? '✅ set' : '❌ missing';
  checks.NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || '❌ missing';

  // 2. Redis 연결 테스트
  let redisStatus = '';
  try {
    const redis = getRedis();
    await redis.set('debug:ping', 'pong');
    const val = await redis.get('debug:ping');
    redisStatus = val === 'pong' ? '✅ connected (ping=pong)' : `⚠️ unexpected value: ${val}`;
  } catch (e: any) {
    redisStatus = `❌ error: ${e.message}`;
  }
  checks.redis = redisStatus;

  return NextResponse.json(checks);
}
