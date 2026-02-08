// lib/google-drive.ts
import { google } from 'googleapis';
import { DriveFile } from '@/types';

export async function listMyFiles(accessToken: string): Promise<DriveFile[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  const drive = google.drive({ version: 'v3', auth });
  
  try {
    const response = await drive.files.list({
      pageSize: 50,
      fields: 'files(id, name, mimeType, webViewLink, thumbnailLink, iconLink, modifiedTime, size)',
      orderBy: 'modifiedTime desc',
      q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
    });
    
    return (response.data.files || []) as DriveFile[];
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

export async function getFileViewLink(fileId: string): string {
  // Google Drive 뷰어 링크 생성
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
