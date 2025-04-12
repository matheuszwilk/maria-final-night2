import { Client } from "minio";
import { StorageProvider } from "@/app/_services/storage/interface";

interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export class MinioStorageService implements StorageProvider {
  private client: Client;
  private bucket: string;
  private endPoint: string;
  private port: number;
  private useSSL: boolean;

  constructor(config: MinioConfig) {
    this.client = new Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
    this.bucket = config.bucket;
    this.endPoint = config.endPoint;
    this.port = config.port;
    this.useSSL = config.useSSL;
  }

  async upload(file: File): Promise<string> {
    // Implementação do método upload
    const buffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;

    await this.client.putObject(this.bucket, fileName, Buffer.from(buffer));

    const protocol = this.useSSL ? "https" : "http";
    return `${protocol}://${this.endPoint}:${this.port}/${this.bucket}/${fileName}`;
  }
}
