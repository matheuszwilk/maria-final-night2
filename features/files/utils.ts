import {
  APP_URL,
  MINIO_ACCESS_KEY,
  MINIO_BUCKET,
  MINIO_SECRET_KEY,
  MINIO_PORT,
  MINIO_SERVER_URL,
} from "@/config";
import * as Minio from "minio";
import { Readable } from "stream";

const minioClient = new Minio.Client({
  endPoint: MINIO_SERVER_URL,
  port: Number(MINIO_PORT),
  useSSL: false,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

interface UploadFileProps {
  file: string | File | undefined;
}

export const uploadFile = async (
  file: UploadFileProps["file"]
): Promise<string | File | undefined> => {
  let fileUrl = file;
  if (file instanceof File) {
    // Check if file is too large (50MB = 52428800 bytes)
    if (file.size > 52428800) {
      throw new Error("File size exceeds 50MB limit");
    }

    const fileName = `${+new Date()}_${file.name}`;

    await minioClient.putObject(
      MINIO_BUCKET,
      fileName,
      Buffer.from(await file.arrayBuffer())
    );

    fileUrl = `${APP_URL}/api/jira/files/${fileName}`;
  }

  return fileUrl;
};

export const getFile = async (fileId: string): Promise<Readable> => {
  return minioClient.getObject(MINIO_BUCKET, fileId);
};
