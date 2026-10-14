import JSZip from 'jszip';
import { ImageFileItem, NamingPattern } from '@/types/compressor';
import { getExportFilename } from './formatters';

export function downloadSingleImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadAllAsZip(
  items: ImageFileItem[],
  namingPattern: NamingPattern = 'original',
  zipFilename = 'compressed-images.zip',
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const completed = items.filter((item) => item.status === 'completed' && item.compressedBlob);

  if (completed.length === 0) return;

  const usedNames = new Set<string>();

  completed.forEach((item, index) => {
    let filename = getExportFilename(
      item.name,
      item.compressedFormat || 'image/jpeg',
      namingPattern,
      index
    );
    if (usedNames.has(filename)) {
      const dotIndex = filename.lastIndexOf('.');
      const base = dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;
      const ext = dotIndex !== -1 ? filename.slice(dotIndex) : '';
      let counter = 1;
      while (usedNames.has(`${base}_${counter}${ext}`)) {
        counter++;
      }
      filename = `${base}_${counter}${ext}`;
    }
    usedNames.add(filename);
    zip.file(filename, item.compressedBlob!);
  });

  const content = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      onProgress?.(Math.round(metadata.percent));
    }
  );

  downloadSingleImage(content, zipFilename);
}
