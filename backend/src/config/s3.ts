import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from './env';

let cachedClient: S3Client | null = null;

export const isS3Configured = (): boolean => Boolean(config.s3.bucket && config.s3.accessKeyId && config.s3.secretAccessKey);

const s3Client = (): S3Client => {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });
  }
  return cachedClient;
};

export interface S3UploadResult {
  url: string;
}

export const uploadToS3 = async (buffer: Buffer, filename: string, contentType: string): Promise<S3UploadResult> => {
  if (!isS3Configured()) {
    throw new Error('AWS S3 is not configured. Set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY on the server.');
  }

  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await s3Client().send(command);
  return { url: `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${filename}` };
};