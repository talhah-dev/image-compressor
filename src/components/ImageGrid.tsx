'use client';

import React, { useState } from 'react';
import { ImageFileItem, NamingPattern } from '@/types/compressor';
import { ImageCard } from './ImageCard';
import { LayoutGrid, List } from 'lucide-react';
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
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface ImageGridProps {
  items: ImageFileItem[];
  namingPattern?: NamingPattern;
  onRemove: (id: string) => void;
  onCompare: (item: ImageFileItem) => void;
  onOpenSettings: (item: ImageFileItem) => void;
  onRecompress: (item: ImageFileItem) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  items,
  namingPattern = 'original',
  onRemove,
  onCompare,
  onOpenSettings,
  onRecompress,
}) => {
  const [viewType, setViewType] = useState<'grid' | 'table'>('grid');

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-zinc-400">
          Queue ({items.length})
        </span>

        <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setViewType('grid')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewType === 'grid'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewType('table')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewType === 'table'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <ImageCard
              key={item.id}
              item={item}
              itemIndex={index}
              namingPattern={namingPattern}
              onRemove={onRemove}
              onCompare={onCompare}
              onOpenSettings={onOpenSettings}
              onRecompress={onRecompress}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-xl overflow-hidden border border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-zinc-400 text-[11px]">
                  <th className="py-2.5 px-4 font-medium">Image</th>
                  <th className="py-2.5 px-4 font-medium">Format</th>
                  <th className="py-2.5 px-4 font-medium">Original</th>
                  <th className="py-2.5 px-4 font-medium">Compressed</th>
                  <th className="py-2.5 px-4 font-medium">Savings</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {items.map((item, index) => {
                  const savings = calculateSavings(item.originalSize, item.compressedSize);
                  const displayName = namingPattern === 'sequential'
                    ? getExportFilename(item.name, item.compressedFormat || item.file.type, 'sequential', index)
                    : item.name;

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={item.compressedUrl || item.previewUrl}
                          alt={item.name}
                          onClick={() => onCompare(item)}
                          className="w-9 h-9 rounded-lg object-cover border border-white/10 cursor-pointer hover:border-indigo-500 transition-colors"
                          title="Click to compare"
                        />
                        <span
                          onClick={() => onCompare(item)}
                          className="font-medium text-white max-w-[180px] sm:max-w-xs truncate cursor-pointer hover:text-indigo-300 transition-colors"
                          title={`${displayName} (Click to compare)`}
                        >
                          {displayName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                        {getMimeLabel(item.compressedFormat || item.file.type)}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-300">
                        {formatBytes(item.originalSize)}
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-300 font-medium">
                        {item.status === 'processing' ? (
                          <span className="flex items-center gap-1.5 text-indigo-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            {item.progress}%
                          </span>
                        ) : item.compressedSize ? (
                          formatBytes(item.compressedSize)
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {item.status === 'completed' && (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] ${
                                savings.isReduction
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {savings.isReduction ? `-${savings.percent}%` : `+${savings.percent}%`}
                            </span>
                            {item.targetMet === true && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            {item.targetMet === false && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === 'completed' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onCompare(item)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                                title="Compare"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.compressedBlob) {
                                    const exportName = getExportFilename(
                                      item.name,
                                      item.compressedFormat || 'image/jpeg',
                                      namingPattern,
                                      index
                                    );
                                    downloadSingleImage(item.compressedBlob, exportName);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenSettings(item)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
                            title="Settings"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
