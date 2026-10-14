'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ImageFileItem,
  CompressorSettings,
  OutputFormat
} from '@/types/compressor';
import { compressImage } from '@/utils/compressor';
import { downloadAllAsZip } from '@/utils/zip';
import { Dropzone } from '@/components/Dropzone';
import { SettingsBar } from '@/components/SettingsBar';
import { BatchSummary } from '@/components/BatchSummary';
import { ImageGrid } from '@/components/ImageGrid';
import { CompareModal } from '@/components/CompareModal';
import { ImageSettingsModal } from '@/components/ImageSettingsModal';

export default function Home() {
  const [items, setItems] = useState<ImageFileItem[]>([]);
  const [settings, setSettings] = useState<CompressorSettings>({
    mode: 'target-size',
    targetSizeKB: 0,
    quality: 0.8,
    format: 'original',
    maxDimension: 0,
    namingPattern: 'original',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCompareItem, setActiveCompareItem] = useState<ImageFileItem | null>(null);
  const [activeSettingsItem, setActiveSettingsItem] = useState<ImageFileItem | null>(null);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const newItems: ImageFileItem[] = [];

      for (const file of files) {
        const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const previewUrl = URL.createObjectURL(file);

        let width = 0;
        let height = 0;

        try {
          if (typeof createImageBitmap !== 'undefined') {
            const bmp = await createImageBitmap(file);
            width = bmp.width;
            height = bmp.height;
            bmp.close();
          } else {
            const dims = await new Promise<{ w: number; h: number }>((resolve) => {
              const img = new Image();
              img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
              img.onerror = () => resolve({ w: 0, h: 0 });
              img.src = previewUrl;
            });
            width = dims.w;
            height = dims.h;
          }
        } catch {
          width = 0;
          height = 0;
        }

        newItems.push({
          id,
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: width,
          originalHeight: height,
          originalFormat: file.type || 'image/jpeg',
          previewUrl,
          compressedBlob: null,
          compressedUrl: null,
          compressedSize: null,
          compressedWidth: null,
          compressedHeight: null,
          compressedFormat: null,
          status: 'idle',
          progress: 0,
          errorMessage: null,
          targetMet: null,
        });
      }

      setItems((prev) => [...prev, ...newItems]);
    },
    []
  );

  const runCompressionForItem = useCallback(
    async (
      item: ImageFileItem,
      effectiveSettings: CompressorSettings
    ): Promise<{
      blob: Blob;
      url: string;
      size: number;
      width: number;
      height: number;
      format: string;
      targetMet: boolean | null;
    } | null> => {
      try {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'processing', progress: 10, errorMessage: null }
              : i
          )
        );

        const result = await compressImage(item.file, effectiveSettings, (progress) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, progress } : i
            )
          );
        });

        const url = URL.createObjectURL(result.blob);

        setItems((prev) =>
          prev.map((i) => {
            if (i.id !== item.id) return i;
            if (i.compressedUrl) {
              URL.revokeObjectURL(i.compressedUrl);
            }
            return {
              ...i,
              status: 'completed',
              progress: 100,
              compressedBlob: result.blob,
              compressedUrl: url,
              compressedSize: result.blob.size,
              compressedWidth: result.width,
              compressedHeight: result.height,
              compressedFormat: result.format,
              targetMet: result.targetMet,
            };
          })
        );

        return {
          blob: result.blob,
          url,
          size: result.blob.size,
          width: result.width,
          height: result.height,
          format: result.format,
          targetMet: result.targetMet,
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Compression failed';
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error', progress: 0, errorMessage: errorMsg }
              : i
          )
        );
        return null;
      }
    },
    []
  );

  const handleCompressAll = useCallback(async () => {
    if (isProcessing || itemsRef.current.length === 0) return;
    setIsProcessing(true);

    const queue = [...itemsRef.current];

    for (const item of queue) {
      const effectiveSettings: CompressorSettings = {
        mode: item.customSettings?.mode ?? settings.mode,
        targetSizeKB: item.customSettings?.targetSizeKB ?? settings.targetSizeKB,
        quality: item.customSettings?.quality ?? settings.quality,
        format: item.customSettings?.format ?? settings.format,
        maxDimension: item.customSettings?.maxDimension ?? settings.maxDimension,
        namingPattern: settings.namingPattern,
      };

      await runCompressionForItem(item, effectiveSettings);
    }

    setIsProcessing(false);
  }, [isProcessing, settings, runCompressionForItem]);

  const handleRecompressItem = useCallback(
    async (item: ImageFileItem) => {
      const effectiveSettings: CompressorSettings = {
        mode: item.customSettings?.mode ?? settings.mode,
        targetSizeKB: item.customSettings?.targetSizeKB ?? settings.targetSizeKB,
        quality: item.customSettings?.quality ?? settings.quality,
        format: item.customSettings?.format ?? settings.format,
        maxDimension: item.customSettings?.maxDimension ?? settings.maxDimension,
        namingPattern: settings.namingPattern,
      };
      await runCompressionForItem(item, effectiveSettings);
    },
    [settings, runCompressionForItem]
  );

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    itemsRef.current.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
    setItems([]);
  }, []);

  const handleDownloadAll = useCallback(async () => {
    await downloadAllAsZip(itemsRef.current, settings.namingPattern);
  }, [settings.namingPattern]);

  const handleSaveCustomSettings = useCallback(
    async (itemId: string, customSettings: NonNullable<ImageFileItem['customSettings']>) => {
      let updatedItem: ImageFileItem | undefined;

      setItems((prev) =>
        prev.map((i) => {
          if (i.id === itemId) {
            updatedItem = { ...i, customSettings };
            return updatedItem;
          }
          return i;
        })
      );

      if (updatedItem) {
        const effectiveSettings: CompressorSettings = {
          mode: customSettings.mode ?? settings.mode,
          targetSizeKB: customSettings.targetSizeKB ?? settings.targetSizeKB,
          quality: customSettings.quality ?? settings.quality,
          format: customSettings.format ?? settings.format,
          maxDimension: customSettings.maxDimension ?? settings.maxDimension,
          namingPattern: settings.namingPattern,
        };
        await runCompressionForItem(updatedItem, effectiveSettings);
      }
    },
    [settings, runCompressionForItem]
  );

  const completedCount = items.filter(
    (item) => item.status === 'completed' && item.compressedBlob !== null
  ).length;


  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100">
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Quzex
          </h1>
          <p className="text-sm text-zinc-400">
            Target exact file sizes with intelligent multi-pass optimization. Zero server uploads.
          </p>
        </div>

        <Dropzone onFilesSelected={handleFilesSelected} disabled={isProcessing} />

        {items.length > 0 && (
          <>
            <SettingsBar
              settings={settings}
              onSettingsChange={setSettings}
              onCompressAll={handleCompressAll}
              onDownloadAll={handleDownloadAll}
              onClearAll={handleClearAll}
              isProcessing={isProcessing}
              hasImages={items.length > 0}
              completedCount={completedCount}
              totalCount={items.length}
            />

            <BatchSummary items={items} />

            <ImageGrid
              items={items}
              namingPattern={settings.namingPattern}
              onRemove={handleRemoveItem}
              onCompare={setActiveCompareItem}
              onOpenSettings={setActiveSettingsItem}
              onRecompress={handleRecompressItem}
            />
          </>
        )}
      </main>


      {activeCompareItem && (
        <CompareModal
          item={activeCompareItem}
          itemIndex={items.findIndex((i) => i.id === activeCompareItem.id)}
          namingPattern={settings.namingPattern}
          onClose={() => setActiveCompareItem(null)}
        />
      )}

      {activeSettingsItem && (
        <ImageSettingsModal
          item={activeSettingsItem}
          defaultMode={settings.mode}
          defaultTargetKB={settings.targetSizeKB}
          defaultQuality={settings.quality}
          defaultFormat={settings.format}
          onSave={handleSaveCustomSettings}
          onClose={() => setActiveSettingsItem(null)}
        />
      )}
    </div>
  );
}
