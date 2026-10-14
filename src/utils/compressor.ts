import { CompressionResult, CompressorSettings, OutputFormat } from '@/types/compressor';

const supportedMimeCache = new Map<string, boolean>();

export async function checkMimeSupport(mime: string): Promise<boolean> {
  if (supportedMimeCache.has(mime)) {
    return supportedMimeCache.get(mime)!;
  }
  if (typeof document === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;

  const isSupported = await new Promise<boolean>((resolve) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        resolve(blob.type === mime);
      }, mime, 0.8);
    } catch {
      resolve(false);
    }
  });

  supportedMimeCache.set(mime, isSupported);
  return isSupported;
}

export function determineTargetMime(format: OutputFormat, originalFormat: string): string {
  if (format === 'original') {
    if (['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(originalFormat)) {
      return originalFormat;
    }
    return 'image/jpeg';
  }
  return format;
}

function calculateDimensions(
  origWidth: number,
  origHeight: number,
  maxDimension: number,
  scale = 1
): { width: number; height: number } {
  let w = origWidth * scale;
  let h = origHeight * scale;

  if (maxDimension > 0 && (w > maxDimension || h > maxDimension)) {
    if (w > h) {
      h = Math.round((h * maxDimension) / w);
      w = maxDimension;
    } else {
      w = Math.round((w * maxDimension) / h);
      h = maxDimension;
    }
  }

  return {
    width: Math.max(1, Math.round(w)),
    height: Math.max(1, Math.round(h))
  };
}

async function renderToBlob(
  source: CanvasImageSource,
  width: number,
  height: number,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(source, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function compressImage(
  file: File,
  settings: CompressorSettings,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  const targetMimeCandidate = determineTargetMime(settings.format, file.type);
  const isSupported = await checkMimeSupport(targetMimeCandidate);
  const targetMime = isSupported ? targetMimeCandidate : 'image/jpeg';

  let source: CanvasImageSource;
  let origWidth: number;
  let origHeight: number;
  let bitmapToClose: ImageBitmap | null = null;

  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(file);
      source = bitmap;
      bitmapToClose = bitmap;
      origWidth = bitmap.width;
      origHeight = bitmap.height;
    } catch {
      const img = await loadImageElement(file);
      source = img;
      origWidth = img.naturalWidth;
      origHeight = img.naturalHeight;
    }
  } else {
    const img = await loadImageElement(file);
    source = img;
    origWidth = img.naturalWidth;
    origHeight = img.naturalHeight;
  }

  try {
    if (settings.mode === 'quality' || !settings.targetSizeKB || settings.targetSizeKB <= 0) {
      onProgress?.(30);
      const dims = calculateDimensions(origWidth, origHeight, settings.maxDimension, 1);
      onProgress?.(60);
      const blob = await renderToBlob(source, dims.width, dims.height, targetMime, settings.quality);
      onProgress?.(100);

      if (!blob) {
        throw new Error('Image compression failed');
      }

      return {
        blob,
        width: dims.width,
        height: dims.height,
        format: targetMime,
        targetMet: null,
        actualQuality: settings.quality
      };
    }

    const targetBytes = settings.targetSizeKB * 1024;
    const isLossless = targetMime === 'image/png';
    let currentScale = 1;
    let bestBlob: Blob | null = null;
    let bestDims = calculateDimensions(origWidth, origHeight, settings.maxDimension, 1);
    let bestQuality = 0.8;
    let targetMet = false;

    if (isLossless) {
      const scaleSteps = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
      for (let i = 0; i < scaleSteps.length; i++) {
        const stepProgress = Math.round(((i + 1) / scaleSteps.length) * 90);
        onProgress?.(stepProgress);
        const dims = calculateDimensions(origWidth, origHeight, settings.maxDimension, scaleSteps[i]);
        const blob = await renderToBlob(source, dims.width, dims.height, targetMime, 1);
        if (blob) {
          bestBlob = blob;
          bestDims = dims;
          if (blob.size <= targetBytes) {
            targetMet = true;
            break;
          }
        }
      }
    } else {
      const scaleFactors = [1, 0.88, 0.76, 0.64, 0.52, 0.40, 0.30, 0.20];

      for (let sIdx = 0; sIdx < scaleFactors.length; sIdx++) {
        currentScale = scaleFactors[sIdx];
        const dims = calculateDimensions(origWidth, origHeight, settings.maxDimension, currentScale);

        const highTestBlob = await renderToBlob(source, dims.width, dims.height, targetMime, 0.95);
        if (highTestBlob && highTestBlob.size <= targetBytes) {
          bestBlob = highTestBlob;
          bestDims = dims;
          bestQuality = 0.95;
          targetMet = true;
          break;
        }

        const lowTestBlob = await renderToBlob(source, dims.width, dims.height, targetMime, 0.08);
        if (!lowTestBlob) continue;

        if (lowTestBlob.size > targetBytes && sIdx < scaleFactors.length - 1) {
          bestBlob = lowTestBlob;
          bestDims = dims;
          continue;
        }

        let lowQ = 0.08;
        let highQ = 0.95;
        let localBestBlob: Blob | null = lowTestBlob.size <= targetBytes ? lowTestBlob : null;
        let localBestQ = lowQ;

        for (let iter = 0; iter < 7; iter++) {
          const midQ = (lowQ + highQ) / 2;
          const currentProgress = Math.min(95, Math.round((sIdx * 12) + (iter * 10)));
          onProgress?.(currentProgress);

          const midBlob = await renderToBlob(source, dims.width, dims.height, targetMime, midQ);
          if (!midBlob) break;

          if (midBlob.size <= targetBytes) {
            localBestBlob = midBlob;
            localBestQ = midQ;
            lowQ = midQ;
          } else {
            highQ = midQ;
          }
        }

        if (localBestBlob) {
          bestBlob = localBestBlob;
          bestDims = dims;
          bestQuality = localBestQ;
          targetMet = true;
          break;
        } else {
          bestBlob = lowTestBlob;
          bestDims = dims;
          bestQuality = 0.08;
        }
      }
    }

    onProgress?.(100);

    if (!bestBlob) {
      throw new Error('Compression failed to produce an image');
    }

    targetMet = bestBlob.size <= targetBytes;

    return {
      blob: bestBlob,
      width: bestDims.width,
      height: bestDims.height,
      format: targetMime,
      targetMet,
      actualQuality: bestQuality
    };
  } finally {
    if (bitmapToClose) {
      bitmapToClose.close();
    }
  }
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read image file'));
    };
    img.src = url;
  });
}
