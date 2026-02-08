// app/analytics/[linkId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShareLink, ViewLog } from '@/types';

interface AnalyticsData {
  link: ShareLink;
  totalViews: number;
  uniqueVisitors: number;
  avgDuration: number;
  lastViewedAt: string | null;
  views: ViewLog[];
  locationStats: { location: string; count: number }[];
  deviceStats: { device: string; count: number }[];
  browserStats: { browser: string; count: number }[];
}

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.linkId as string;
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [linkId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/${linkId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Analytics error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error || '데이터를 불러올 수 없습니다'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/v/${linkId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← 대시보드
            </button>
            <h1 className="text-xl font-bold text-gray-900">📊 Analytics</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {analytics.link.fileName}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span>🔗 {linkId}</span>
            <span>📅 생성: {new Date(analytics.link.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert('링크가 복사되었습니다!');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              복사
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="총 조회수"
            value={analytics.totalViews}
            icon="👀"
            color="blue"
          />
          <StatCard
            title="고유 방문자"
            value={analytics.uniqueVisitors}
            icon="👥"
            color="green"
          />
          <StatCard
            title="평균 체류 시간"
            value={formatDuration(analytics.avgDuration)}
            icon="⏱️"
            color="purple"
          />
          <StatCard
            title="최근 조회"
            value={analytics.lastViewedAt ? getTimeAgo(analytics.lastViewedAt) : '-'}
            icon="📅"
            color="orange"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Location Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🌍 위치별 조회</h3>
            {analytics.locationStats.length > 0 ? (
              <div className="space-y-3">
                {analytics.locationStats.slice(0, 5).map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700">{stat.location}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(stat.count / analytics.totalViews) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                        {stat.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">데이터 없음</p>
            )}
          </div>

          {/* Device Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📱 디바이스별 조회</h3>
            {analytics.deviceStats.length > 0 ? (
              <div className="space-y-3">
                {analytics.deviceStats.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{stat.device}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(stat.count / analytics.totalViews) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                        {stat.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">데이터 없음</p>
            )}
          </div>
        </div>

        {/* Recent Views */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 최근 조회 기록</h3>
          
          {analytics.views.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="pb-3 font-semibold">시간</th>
                    <th className="pb-3 font-semibold">위치</th>
                    <th className="pb-3 font-semibold">디바이스</th>
                    <th className="pb-3 font-semibold">브라우저</th>
                    <th className="pb-3 font-semibold">체류 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.views.map((view) => (
                    <tr key={view.viewId} className="border-b hover:bg-gray-50">
                      <td className="py-3 text-sm">
                        {new Date(view.viewedAt).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 text-sm">
                        {view.location.city}, {view.location.country}
                      </td>
                      <td className="py-3 text-sm capitalize">
                        {view.device}
                      </td>
                      <td className="py-3 text-sm">
                        {view.browser}
                      </td>
                      <td className="py-3 text-sm">
                        {formatDuration(view.duration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-600">아직 조회 기록이 없습니다</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        <span className={`text-2xl p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}초`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}분 ${remainingSeconds}초` : `${minutes}분`;
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}
