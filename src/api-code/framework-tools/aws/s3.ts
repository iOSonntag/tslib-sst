import { S3Client, PutObjectCommand, ObjectCannedACL, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

export * as S3Service from './s3';


export type GenerateUploadUrlParams = {
  region: string;
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
};

export const generateUploadUrl = async (params: GenerateUploadUrlParams) =>
{
  const client = new S3Client({
    region: params.region,
  });

  try
  {
    const command = new PutObjectCommand({
      Bucket: params.bucketName,
      Key: params.key,
      ContentType: params.contentType,
      ACL: params.access ?? 'private',
    });

    const uploadUrl = await getSignedUrl(client, command, {
      signingRegion: params.region,
      expiresIn: params.expiresIn ?? 3600, 
    });

    return uploadUrl;
  }
  finally
  {
    client.destroy();
  }
};

export type GenerateDownloadUrlParams = {
  region: string;
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
  const client = new S3Client({
    region: params.region,
  });

  try
  {
    const command = new GetObjectCommand({
      Bucket: params.bucketName,
      Key: params.key,
    });

    const downloadUrl = await getSignedUrl(client, command, {
      expiresIn: params.expiresIn ?? 3600, 
    });

    return downloadUrl;
  }
  finally
  {
    client.destroy();
  }
};

export type UploadFileParams = {
  region: string;
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
  const client = new S3Client({
    region: params.region,
  });

  try
  {
    const command = new PutObjectCommand({
      Bucket: params.bucketName,
      Key: params.key,
      Body: params.file,
      ContentType: params.contentType,
      ACL: params.access ?? 'private',
    });

    await client.send(command);
  }
  finally
  {
    client.destroy();
  }
}

export type DownloadFileParams = {
  region: string;
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


export type DeleteFileParams = {
  region: string;
  bucketName: string;
  key: string;
};

export const deleteFile = async (params: DeleteFileParams) =>
{
  const client = new S3Client({
    region: params.region,
  });
  
  const command = new DeleteObjectCommand({
    Bucket: params.bucketName,
    Key: params.key,
  });

  try
  {
    await client.send(command);
  }
  catch (e)
  {
    console.error(e);

    client.destroy();

    throw e;
  }

  client.destroy();
}