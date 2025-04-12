import { StorageProvider } from "@/app/_services/storage/interface";
import { MinioStorageService } from "@/app/_services/storage/implementations/minio";

export const storageProvider: StorageProvider = new MinioStorageService({
  endPoint: process.env.MINIO_SERVER_URL || "localhost",
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "",
  secretKey: process.env.MINIO_SECRET_KEY || "",
  bucket: process.env.MINIO_BUCKET || "aws-f6",
});
