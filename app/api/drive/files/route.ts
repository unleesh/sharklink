// app/api/drive/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // ← 변경
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
      return NextResponse.json({
        error: 'No access token',
        hint: '로그아웃 후 다시 로그인하세요. OAuth 권한을 다시 승인해야 합니다.',
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const pageToken = searchParams.get('pageToken') || undefined;

    try {
      const result = await listMyFiles(accessToken, { search, pageToken });

      return NextResponse.json({
        success: true,
        files: result.files,
        nextPageToken: result.nextPageToken ?? null,
        debug: {
          fileCount: result.files.length,
          hasToken: !!accessToken,
        },
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
      files: [],
    }, { status: 500 });
  }
}
