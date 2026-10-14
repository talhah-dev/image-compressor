export type OutputFormat = 'original' | 'image/webp' | 'image/jpeg' | 'image/png' | 'image/avif';

export type CompressionMode = 'target-size' | 'quality';

export type NamingPattern = 'original' | 'sequential';

export type ProcessStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalFormat: string;
  previewUrl: string;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedSize: number | null;
  compressedWidth: number | null;
  compressedHeight: number | null;
  compressedFormat: string | null;
  status: ProcessStatus;
  progress: number;
  errorMessage: string | null;
  targetMet: boolean | null;
  customSettings?: {
    mode?: CompressionMode;
    targetSizeKB?: number;
    quality?: number;
    format?: OutputFormat;
    maxDimension?: number;
  };
}

export interface CompressorSettings {
  mode: CompressionMode;
  targetSizeKB: number;
  quality: number;
  format: OutputFormat;
  maxDimension: number;
  namingPattern?: NamingPattern;
}

export interface CompressionResult {
  blob: Blob;
  width: number;
  height: number;
  format: string;
  targetMet: boolean | null;
  actualQuality?: number;
}
