import { put } from '@vercel/blob';
import { config } from './env';

export const isBlobConfigured = (): boolean => Boolean(config.blob.readWriteToken);

export interface BlobUploadResult {
  url: string;
}

export const uploadToBlob = async (buffer: Buffer, filename: string, contentType: string): Promise<BlobUploadResult> => {
  if (!isBlobConfigured()) {
    throw new Error('Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN on the server.');
  }

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
    token: config.blob.readWriteToken,
  });

  return { url: blob.url };
};