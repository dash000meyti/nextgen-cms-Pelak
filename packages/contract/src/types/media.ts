export type MediaMetadata = {
  width?: number;
  height?: number;
  variants?: Record<string, string>;
};

export type MediaAsset = {
  id: number;
  uuid: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  folderPath: string;
  publicUrl: string;
  uploadedByMemberId: number;
  contentId: number | null;
  createdAt: string;
  metadata: MediaMetadata;
  deletedAt: string | null;
};

export type MediaUploadContext = {
  contentId?: number;
  memberId?: number;
  folder?: string;
};

export interface MediaProcessor {
  process(
    buffer: Buffer,
    mimeType: string,
    metadata: MediaMetadata,
  ): Promise<{ buffer: Buffer; mimeType: string; metadata: MediaMetadata }>;
}
