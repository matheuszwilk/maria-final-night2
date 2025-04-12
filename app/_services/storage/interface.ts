export interface StorageProvider {
  upload(file: File): Promise<string>;
}
