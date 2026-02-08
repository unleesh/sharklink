// app/v/[linkId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ViewPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.linkId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function trackAndRedirect() {
      const startTime = Date.now();
      
      try {
        // 1. 뷰 추적 기록
        const trackResponse = await fetch('/api/view/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            linkId,
            userAgent: navigator.userAgent,
            referrer: document.referrer || undefined,
          }),
        });
        
        if (!trackResponse.ok) {
          throw new Error('Failed to track view');
        }
        
        const { viewId } = await trackResponse.json();
        console.log('✅ View tracked:', viewId);
        
        // 2. 파일 정보 가져오기
        const linkResponse = await fetch(`/api/view/${linkId}`);
        
        if (!linkResponse.ok) {
          if (linkResponse.status === 404) {
            setError('링크를 찾을 수 없습니다.');
          } else {
            setError('파일을 불러올 수 없습니다.');
          }
          setLoading(false);
          return;
        }
        
        const linkData = await linkResponse.json();
        
        if (!linkData.success || !linkData.fileUrl) {
          setError('유효하지 않은 링크입니다.');
          setLoading(false);
          return;
        }
        
        console.log('📄 File URL:', linkData.fileUrl);
        console.log('📝 File name:', linkData.fileName);
        
        // 3. 체류 시간 추적 (페이지 이탈 시)
        const sendDuration = () => {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          
          // Beacon API 사용 (페이지 종료 시에도 전송됨)
          const blob = new Blob([JSON.stringify({ viewId, duration })], {
            type: 'application/json',
          });
          navigator.sendBeacon('/api/view/duration', blob);
        };
        
        window.addEventListener('beforeunload', sendDuration);
        
        // 4. Google Drive로 리다이렉트 (3초 후)
        setTimeout(() => {
          window.location.href = linkData.fileUrl;
        }, 3000);
        
        setLoading(false);
        
      } catch (err: any) {
        console.error('❌ Error:', err);
        setError(err.message || '오류가 발생했습니다.');
        setLoading(false);
      }
    }
    
    trackAndRedirect();
  }, [linkId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            문서를 불러오는 중...
          </h2>
          <p className="text-gray-600">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          파일로 이동합니다...
        </h2>
        <p className="text-gray-600">
          자동으로 리다이렉트되지 않으면 뒤로가기를 눌러주세요
        </p>
      </div>
    </div>
  );
}
