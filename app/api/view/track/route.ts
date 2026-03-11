// app/api/view/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import UAParser from 'ua-parser-js';

function generateId(length = 16): string {
  return randomBytes(Math.ceil(length * 3 / 4))
    .toString('base64url')
    .slice(0, length);
}
import { redis } from '@/lib/redis';
import { getLocationFromIP } from '@/lib/geolocation';
import { ViewLog } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { linkId, userAgent, referrer } = await request.json();
    
    if (!linkId) {
      return NextResponse.json({ error: 'Missing linkId' }, { status: 400 });
    }
    
    // IP 주소 가져오기
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    console.log('📍 IP Address:', ip);
    
    // IP → 위치 변환
    const location = await getLocationFromIP(ip);
    
    // User Agent 파싱
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    const device = result.device.type === 'mobile' ? 'mobile' :
                   result.device.type === 'tablet' ? 'tablet' : 'desktop';
    const browser = result.browser.name || 'Unknown';
    
    // 고유 뷰 ID 생성
    const viewId = generateId(16);
    
    const viewLog: ViewLog = {
      linkId,
      viewId,
      viewedAt: new Date().toISOString(),
      ipAddress: ip,
      location,
      userAgent,
      device,
      browser,
      duration: 0,
      referrer: referrer || undefined,
    };
    
    // Redis에 저장 (명시적 JSON 직렬화)
    await redis.set(`view:${viewId}`, JSON.stringify(viewLog));
    
    // 링크별 뷰 목록에 추가
    await redis.lpush(`link:${linkId}:views`, viewId);
    
    console.log('✅ View tracked:', {
      viewId,
      linkId,
      location: `${location.city}, ${location.country}`,
      device,
    });
    
    return NextResponse.json({ success: true, viewId });
    
  } catch (error: any) {
    console.error('❌ Track view error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
