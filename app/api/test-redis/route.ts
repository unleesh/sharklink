// app/api/test-redis/route.ts
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    await redis.set('test', 'hello');
    const value = await redis.get('test');
    
    return NextResponse.json({
      success: true,
      value,
      message: 'Redis connected!',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}