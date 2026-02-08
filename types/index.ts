// types/index.ts

export interface ShareLink {
  linkId: string;
  fileId: string;
  fileName: string;
  fileMimeType: string;
  ownerId: string;
  ownerEmail: string;
  createdAt: string;
  expiresAt?: string;
  requireAuth: boolean;
  password?: string;
  viewCount: number;
}

export interface ViewLog {
  linkId: string;
  viewId: string;
  viewedAt: string;
  ipAddress: string;
  location: {
    country: string;
    city: string;
    region: string;
    latitude?: number;
    longitude?: number;
  };
  userAgent: string;
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  duration: number;
  referrer?: string;
  email?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  size?: string;
}

export interface AnalyticsData {
  link: ShareLink;
  totalViews: number;
  uniqueVisitors: number;
  avgDuration: number;
  lastViewedAt: string;
  views: ViewLog[];
  locationStats: {
    country: string;
    count: number;
  }[];
  deviceStats: {
    device: string;
    count: number;
  }[];
}
