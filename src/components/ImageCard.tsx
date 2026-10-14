'use client';

import React from 'react';
import { ImageFileItem, NamingPattern } from '@/types/compressor';
import {
  formatBytes,
  calculateSavings,
  getExportFilename,
  getMimeLabel
} from '@/utils/formatters';
import { downloadSingleImage } from '@/utils/zip';
import {
  Download,
  Trash2,
  Sliders,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Columns
} from 'lucide-react';

interface ImageCardProps {
  item: ImageFileItem;
  itemIndex?: number;
  namingPattern?: NamingPattern;
  onRemove: (id: string) => void;
  onCompare: (item: ImageFileItem) => void;
  onOpenSettings: (item: ImageFileItem) => void;
  onRecompress: (item: ImageFileItem) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  item,
  itemIndex = 0,
  namingPattern = 'original',
  onRemove,
  onCompare,
  onOpenSettings,
  onRecompress,
}) => {
  const savings = calculateSavings(item.originalSize, item.compressedSize);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="group relative glass-panel rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#151824]/90 transition-all duration-200 flex flex-col">
      <div
        onClick={() => onCompare(item)}
        className="relative aspect-[16/10] bg-black/40 overflow-hidden flex items-center justify-center cursor-pointer"
        title="Click to compare before and after quality"
      >
        <img
          src={item.compressedUrl || item.previewUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono font-medium text-zinc-300">
            {getMimeLabel(item.file.type)}
          </span>
          {item.compressedFormat && item.compressedFormat !== item.file.type && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/80 backdrop-blur-md text-[10px] font-mono font-medium text-white shadow-sm">
              → {getMimeLabel(item.compressedFormat)}
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="p-1 rounded-md bg-black/60 hover:bg-rose-500/80 text-zinc-400 hover:text-white backdrop-blur-md transition-colors"
            title="Remove image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {item.status === 'processing' && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-4">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
            <div className="w-full max-w-[120px] bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-200"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-300 font-mono mt-1.5">
              {item.progress}%
            </span>
          </div>
        )}

        {item.status === 'completed' && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/90 text-white text-xs font-medium shadow-lg backdrop-blur-md border border-indigo-400/30">
              <Columns className="w-3.5 h-3.5" />
              <span>Compare Quality</span>
            </div>
            <span className="text-[10px] text-zinc-300">Click to slide before & after</span>
          </div>
        )}
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4
              onClick={() => onCompare(item)}
              className="text-xs font-medium text-white truncate flex-1 cursor-pointer hover:text-indigo-300 transition-colors"
              title={`${item.name} (Click to compare)`}
            >
              {namingPattern === 'sequential'
                ? getExportFilename(item.name, item.compressedFormat || item.file.type, 'sequential', itemIndex)
                : item.name}
            </h4>
            {item.customSettings && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono">
                Custom
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-white/[0.04] text-[11px]">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500">Original</span>
              <span className="font-mono text-zinc-300">
                {formatBytes(item.originalSize)}
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[10px] text-zinc-500">Compressed</span>
              {item.compressedSize ? (
                <span className="font-mono font-medium text-indigo-300">
                  {formatBytes(item.compressedSize)}
                </span>
              ) : (
                <span className="font-mono text-zinc-500">—</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            {item.status === 'completed' && (
              <>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                    savings.isReduction
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {savings.isReduction ? `-${savings.percent}%` : `+${savings.percent}%`}
                </span>

                {item.targetMet === true && (
                  <span
                    className="text-emerald-400 text-[11px] flex items-center"
                    title="Target size satisfied"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}

                {item.targetMet === false && (
                  <span
                    className="text-amber-400 text-[11px] flex items-center gap-0.5"
                    title="Exceeded target size limit"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                )}
              </>
            )}

            {item.status === 'error' && (
              <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/25 text-rose-400 text-[10px] font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Failed
              </span>
            )}

            {item.status === 'idle' && (
              <span className="text-[10px] text-zinc-500">Ready</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onCompare(item)}
              className="p-1 rounded-md text-zinc-400 hover:text-indigo-400 hover:bg-white/[0.06] transition-colors"
              title="Compare Quality (Before/After)"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onOpenSettings(item)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
              title="Image settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {item.status === 'completed' && (
              <>
                <button
                  type="button"
                  onClick={() => onRecompress(item)}
                  className="p-1 rounded-md text-zinc-400 hover:text-indigo-400 hover:bg-white/[0.06] transition-colors"
                  title="Re-compress"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                  title="Download image"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
