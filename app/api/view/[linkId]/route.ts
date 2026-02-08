// app/api/view/[linkId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { ShareLink } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;
    
    // 링크 정보 가져오기
    const link = await redis.get<ShareLink>(`link:${linkId}`);
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    
    // Google Drive 뷰어 링크 생성
    const fileUrl = `https://drive.google.com/file/d/${link.fileId}/preview`;
    
    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: link.fileName,
      requireAuth: link.requireAuth,
    });
    
  } catch (error: any) {
    console.error('Get view info error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
