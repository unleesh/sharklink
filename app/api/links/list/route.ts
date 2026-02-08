// app/api/links/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { redis } from '@/lib/redis';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ShareLink } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 사용자의 링크 ID 목록 가져오기
    const linkIds = await redis.lrange(`user:${session.user.email}:links`, 0, -1);
    
    if (!linkIds || linkIds.length === 0) {
      return NextResponse.json({ links: [] });
    }
    
    // 각 링크 정보 가져오기
    const links: ShareLink[] = [];
    
    for (const linkId of linkIds) {
      const link = await redis.get<ShareLink>(`link:${linkId}`);
      if (link) {
        // 뷰 카운트 업데이트
        const viewCount = await redis.llen(`link:${linkId}:views`) || 0;
        link.viewCount = viewCount as number;
        links.push(link);
      }
    }
    
    // 최신순 정렬
    links.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ links });
    
  } catch (error: any) {
    console.error('List links error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
