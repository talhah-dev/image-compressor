'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageFileItem, NamingPattern } from '@/types/compressor';
import { formatBytes, calculateSavings, getExportFilename } from '@/utils/formatters';
import { downloadSingleImage } from '@/utils/zip';
import { X, Download, SlidersHorizontal, Columns, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface CompareModalProps {
  item: ImageFileItem;
  itemIndex?: number;
  namingPattern?: NamingPattern;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  item,
  itemIndex = 0,
  namingPattern = 'original',
  onClose,
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('split');
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const savings = calculateSavings(item.originalSize, item.compressedSize);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    updateSlider(e.clientX);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging.current) return;
      updateSlider(e.clientX);
    },
    [updateSlider]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePointerMove, handlePointerUp, onClose]);

  const handleDownload = () => {
    if (item.compressedBlob) {
      const filename = getExportFilename(
        item.name,
        item.compressedFormat || 'image/jpeg',
        namingPattern,
        itemIndex
      );
      downloadSingleImage(item.compressedBlob, filename);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col glass-panel-elevated rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#12141e]/90">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm text-white truncate max-w-[220px] sm:max-w-md">
              {item.name}
            </span>
            {item.targetMet === true && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Target Met
              </span>
            )}
            {item.targetMet === false && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium">
                <AlertTriangle className="w-3 h-3" />
                Exceeded Target
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Split slider"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'side-by-side' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Side by side"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>

            {item.compressedBlob && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col items-center justify-center min-h-[360px] bg-[#0b0c12]">
          {viewMode === 'split' ? (
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              className="relative max-w-full max-h-[64vh] select-none overflow-hidden rounded-xl border border-white/[0.12] shadow-2xl cursor-ew-resize flex items-center justify-center"
            >
              <img
                src={item.compressedUrl || item.previewUrl}
                alt="After - Compressed"
                className="max-h-[64vh] max-w-full w-auto object-contain block pointer-events-none"
              />

              <div
                className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center"
                style={{
                  clipPath: `polygon(0% 0%, ${sliderPos}% 0%, ${sliderPos}% 100%, 0% 100%)`,
                }}
              >
                <img
                  src={item.previewUrl}
                  alt="Before - Original"
                  className="max-h-[64vh] max-w-full w-auto object-contain block pointer-events-none"
                />
              </div>

              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-white text-zinc-900 shadow-2xl flex items-center justify-center pointer-events-auto cursor-ew-resize border-2 border-indigo-600 hover:scale-110 active:scale-95 transition-transform">
                  <div className="flex items-center -space-x-1 text-zinc-900">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10 pointer-events-none shadow-md">
                Before (Original)
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-semibold text-indigo-300 border border-white/10 pointer-events-none shadow-md">
                After (Compressed)
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-h-[64vh]">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/[0.08] bg-black/40">
                <span className="text-xs text-zinc-400 mb-2 font-medium">Before (Original)</span>
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.previewUrl}
                    alt="Original"
                    className="max-h-[48vh] max-w-full object-contain rounded-lg"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-500/20 bg-indigo-950/10">
                <span className="text-xs text-indigo-300 mb-2 font-medium">After (Compressed)</span>
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.compressedUrl || item.previewUrl}
                    alt="Compressed"
                    className="max-h-[48vh] max-w-full object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-white/[0.08] bg-[#12141e]/90 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-zinc-500 block text-[10px]">BEFORE (ORIGINAL)</span>
              <span className="font-mono text-zinc-200">
                {formatBytes(item.originalSize)} ({item.originalWidth}×{item.originalHeight})
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">AFTER (COMPRESSED)</span>
              <span className="font-mono text-indigo-300 font-medium">
                {item.compressedSize ? formatBytes(item.compressedSize) : '—'}
                {item.compressedWidth && item.compressedHeight && (
                  <span className="text-zinc-400 font-normal">
                    {' '}({item.compressedWidth}×{item.compressedHeight})
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold font-mono text-xs">
              {savings.isReduction ? `-${savings.percent}%` : `+${savings.percent}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
