// app/api/links/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nanoid } from 'nanoid';
import { redis } from '@/lib/redis';
import { authOptions } from '@/lib/auth'; // ← 변경
import { ShareLink } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { fileId, fileName, fileMimeType, requireAuth } = await request.json();
    
    if (!fileId || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // 고유 링크 ID 생성 (10자)
    const linkId = nanoid(10);
    
    const shareLink: ShareLink = {
      linkId,
      fileId,
      fileName,
      fileMimeType: fileMimeType || 'application/octet-stream',
      ownerId: session.user.email,
      ownerEmail: session.user.email,
      createdAt: new Date().toISOString(),
      requireAuth: requireAuth || false,
      viewCount: 0,
    };
    
    // Redis에 저장
    await redis.set(`link:${linkId}`, shareLink);
    
    // 사용자별 링크 목록에 추가
    await redis.lpush(`user:${session.user.email}:links`, linkId);
    
    console.log('✅ Link created:', linkId);
    
    return NextResponse.json({
      success: true,
      linkId,
      url: `${process.env.NEXT_PUBLIC_URL}/v/${linkId}`,
      shareLink,
    });
    
  } catch (error: any) {
    console.error('Create link error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
