// app/api/drive/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // ← 변경
import { listMyFiles } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('=== Drive API Debug ===');
    console.log('Session:', session ? '✅ Exists' : '❌ Missing');
    console.log('User:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // @ts-ignore
    const accessToken = session.accessToken;
    
    console.log('Access Token:', accessToken ? '✅ Exists' : '❌ Missing');
    console.log('Token preview:', accessToken ? accessToken.substring(0, 20) + '...' : 'N/A');
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'No access token',
        hint: '로그아웃 후 다시 로그인하세요. OAuth 권한을 다시 승인해야 합니다.',
      }, { status: 401 });
    }
    
    // Google Drive 파일 목록 가져오기
    try {
      const files = await listMyFiles(accessToken);
      
      console.log('✅ Files fetched:', files.length);
      
      return NextResponse.json({ 
        success: true,
        files,
        debug: {
          fileCount: files.length,
          hasToken: !!accessToken,
        }
      });
    } catch (driveError: any) {
      console.error('❌ Drive API Error:', driveError.message);
      
      return NextResponse.json({ 
        error: 'Drive API error',
        message: driveError.message,
        hint: 'Google Cloud Console에서 Drive API가 활성화되어 있는지 확인하세요.',
        files: [],
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('❌ General error:', error);
    return NextResponse.json({ 
      error: error.message,
      files: [] 
    }, { status: 500 });
  }
}
