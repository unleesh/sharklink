// app/api/analytics/[linkId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { redis } from '@/lib/redis';
import { authOptions } from '@/lib/auth';
import { ShareLink, ViewLog } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { linkId } = params;
    
    // 링크 정보 가져오기
    const link = await redis.get<ShareLink>(`link:${linkId}`);
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    
    // 링크 소유자 확인
    if (link.ownerId !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // 뷰 로그 가져오기
    const viewIds = await redis.lrange(`link:${linkId}:views`, 0, -1);
    
    const views: ViewLog[] = [];
    for (const viewId of viewIds) {
      const viewLog = await redis.get<ViewLog>(`view:${viewId}`);
      if (viewLog) {
        views.push(viewLog);
      }
    }
    
    // 통계 계산
    const totalViews = views.length;
    
    // 고유 방문자 (IP 기준)
    const uniqueIPs = new Set(views.map(v => v.ipAddress));
    const uniqueVisitors = uniqueIPs.size;
    
    // 평균 체류 시간
    const totalDuration = views.reduce((sum, v) => sum + v.duration, 0);
    const avgDuration = totalViews > 0 ? Math.floor(totalDuration / totalViews) : 0;
    
    // 최근 조회
    const lastViewedAt = views.length > 0 ? views[0].viewedAt : null;
    
    // 위치별 통계
    const locationMap = new Map<string, number>();
    views.forEach(v => {
      const location = `${v.location.city}, ${v.location.country}`;
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
    });
    
    const locationStats = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
    
    // 디바이스별 통계
    const deviceMap = new Map<string, number>();
    views.forEach(v => {
      deviceMap.set(v.device, (deviceMap.get(v.device) || 0) + 1);
    });
    
    const deviceStats = Array.from(deviceMap.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);
    
    // 브라우저별 통계
    const browserMap = new Map<string, number>();
    views.forEach(v => {
      browserMap.set(v.browser, (browserMap.get(v.browser) || 0) + 1);
    });
    
    const browserStats = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
    
    // 최신순 정렬 (최근 20개만)
    const recentViews = views
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
      .slice(0, 20);
    
    return NextResponse.json({
      link,
      totalViews,
      uniqueVisitors,
      avgDuration,
      lastViewedAt,
      views: recentViews,
      locationStats,
      deviceStats,
      browserStats,
    });
    
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
