import { NamingPattern } from '@/types/compressor';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(dm))} ${sizes[idx]}`;
}

export function calculateSavings(original: number, compressed: number | null): { percent: number; savedBytes: number; isReduction: boolean } {
  if (!compressed || original <= 0) {
    return { percent: 0, savedBytes: 0, isReduction: true };
  }
  const diff = original - compressed;
  const percent = Math.round((diff / original) * 100);
  return {
    percent: Math.abs(percent),
    savedBytes: diff,
    isReduction: diff >= 0
  };
}

export function getFileExtension(mimeType: string, fallbackName = ''): string {
  switch (mimeType) {
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/avif':
      return 'avif';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    default: {
      const match = fallbackName.match(/\.([a-zA-Z0-9]+)$/);
      return match ? match[1].toLowerCase() : 'jpg';
    }
  }
}

export function getFilenameWithNewExt(originalName: string, targetMime: string): string {
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const ext = getFileExtension(targetMime, originalName);
  return `${baseName}.${ext}`;
}

export function getExportFilename(
  originalName: string,
  targetMime: string,
  pattern: NamingPattern = 'original',
  index = 0
): string {
  const ext = getFileExtension(targetMime, originalName);
  if (pattern === 'sequential') {
    return `image-${index + 1}.${ext}`;
  }
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  return `${baseName}.${ext}`;
}

export function getMimeLabel(mime: string): string {
  switch (mime) {
    case 'image/webp':
      return 'WEBP';
    case 'image/jpeg':
      return 'JPEG';
    case 'image/png':
      return 'PNG';
    case 'image/avif':
      return 'AVIF';
    case 'image/gif':
      return 'GIF';
    case 'image/svg+xml':
      return 'SVG';
    default:
      return mime.replace('image/', '').toUpperCase();
  }
}
