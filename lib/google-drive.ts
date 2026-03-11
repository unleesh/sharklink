// lib/google-drive.ts
import { google } from 'googleapis';
import { DriveFile } from '@/types';

export async function listMyFiles(
  accessToken: string,
  options?: { search?: string; pageToken?: string; pageSize?: number }
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  const baseQuery = "mimeType != 'application/vnd.google-apps.folder' and trashed = false";
  const searchQuery = options?.search
    ? `${baseQuery} and name contains '${options.search.replace(/'/g, "\\'")}'`
    : baseQuery;

  try {
    const response = await drive.files.list({
      pageSize: options?.pageSize ?? 30,
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink, iconLink, modifiedTime, size)',
      orderBy: 'modifiedTime desc',
      q: searchQuery,
      ...(options?.pageToken ? { pageToken: options.pageToken } : {}),
    });

    return {
      files: (response.data.files || []) as DriveFile[],
      nextPageToken: response.data.nextPageToken ?? undefined,
    };
  } catch (error) {
    console.error('Drive API error:', error);
    throw new Error('Failed to fetch files from Google Drive');
  }
}

export async function getFileMetadata(fileId: string, accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  const drive = google.drive({ version: 'v3', auth });
  
  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, webViewLink, thumbnailLink, iconLink, owners',
    });
    
    return response.data;
  } catch (error) {
    console.error('Get file metadata error:', error);
    throw new Error('Failed to get file metadata');
  }
}

// Option 1: async 제거 (권장)
  export function getFileViewLink(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}