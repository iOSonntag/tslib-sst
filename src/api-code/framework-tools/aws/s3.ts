import { S3Client, PutObjectCommand, ObjectCannedACL, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

// TODO: check all region usages, if realms support different regions

export * as S3Service from './s3';

const s3Client = new S3Client();

export type GenerateUploadUrlParams = {
  bucketName: string;
  key: string;
  contentType: string;
  /**
   * Defaults to 1 hour.
   * 
   * @default 3600
   */
  expiresIn?: number;
  /**
   * Defaults to private.
   */
  access?: ObjectCannedACL;
  region?: string;
};

export const generateUploadUrl = async (params: GenerateUploadUrlParams) =>
{
  const command = new PutObjectCommand({
    Bucket: params.bucketName,
    Key: params.key,
    ContentType: params.contentType,
    ACL: params.access ?? 'private',
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    signingRegion: params.region,
    expiresIn: params.expiresIn ?? 3600, 
  });

  return uploadUrl;
};

export type GenerateDownloadUrlParams = {
  bucketName: string;
  key: string;
  /**
   * Defaults to 1 hour.
   * 
   * @default 3600
   */
  expiresIn?: number;
};

export const generateDownloadUrl = async (params: GenerateDownloadUrlParams) =>
{
  const command = new GetObjectCommand({
    Bucket: params.bucketName,
    Key: params.key,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: params.expiresIn ?? 3600, 
  });

  return downloadUrl;
};

export type UploadFileParams = {
  bucketName: string;
  key: string;
  file: Buffer;
  contentType: string;
  /**
   * Defaults to private.
   */
  access?: ObjectCannedACL;
};


export const uploadFile = async (params: UploadFileParams) =>
{
  const command = new PutObjectCommand({
    Bucket: params.bucketName,
    Key: params.key,
    Body: params.file,
    ContentType: params.contentType,
    ACL: params.access ?? 'private',
  });

  await s3Client.send(command);
}

export type DownloadFileParams = {
  bucketName: string;
  key: string;
};

export const downloadFile = async (params: DownloadFileParams) =>
{
  const command = new GetObjectCommand({
    Bucket: params.bucketName,
    Key: params.key,
  });

  const response = await s3Client.send(command);

  if (!response.Body)
  {
    throw new Error('No body in response');
  }

  const buffer = await streamToBuffer(response.Body as Readable);
  
  return buffer;
}

const streamToBuffer = async (stream: Readable): Promise<Buffer> =>
{
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}