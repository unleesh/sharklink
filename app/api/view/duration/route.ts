// app/api/view/duration/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { ViewLog } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const { viewId, duration } = JSON.parse(body);
    
    if (!viewId || duration === undefined) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    // 뷰 로그 가져오기
    const viewLog = await redis.get<ViewLog>(`view:${viewId}`);
    
    if (!viewLog) {
      return NextResponse.json({ error: 'View not found' }, { status: 404 });
    }
    
    // 체류 시간 업데이트
    viewLog.duration = duration;
    await redis.set(`view:${viewId}`, viewLog);
    
    console.log('✅ Duration updated:', { viewId, duration: `${duration}s` });
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Update duration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
