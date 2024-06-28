import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export * as S3Service from './s3';

const s3Client = new S3Client();

export type GenerateUploadUrlParams = {
  bucketName: string;
  key: string;
  contentType: string;
  expiresIn?: number;
  /**
   * Defaults to private.
   */
  access?: ObjectCannedACL;
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
    expiresIn: params.expiresIn ?? 3600, // Default to 1 hour if not specified
  });

  return uploadUrl;
};