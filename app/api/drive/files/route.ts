// app/api/drive/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { listMyFiles } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // @ts-ignore
    const accessToken = session.accessToken;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }
    
    // Google Drive 파일 목록 가져오기
    const files = await listMyFiles(accessToken);
    
    return NextResponse.json({ 
      success: true,
      files 
    });
    
  } catch (error: any) {
    console.error('Drive files error:', error);
    return NextResponse.json({ 
      error: error.message,
      files: [] 
    }, { status: 500 });
  }
}
