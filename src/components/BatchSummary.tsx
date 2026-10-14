import React from 'react';
import { ImageFileItem } from '@/types/compressor';
import { formatBytes } from '@/utils/formatters';
import { ArrowDownRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface BatchSummaryProps {
  items: ImageFileItem[];
}

export const BatchSummary: React.FC<BatchSummaryProps> = ({ items }) => {
  if (items.length === 0) return null;

  const totalOriginal = items.reduce((sum, item) => sum + item.originalSize, 0);
  const completedItems = items.filter((item) => item.status === 'completed' && item.compressedSize !== null);
  const totalCompressed = completedItems.reduce((sum, item) => sum + (item.compressedSize || 0), 0);
  
  const savedBytes = totalOriginal - totalCompressed;
  const savingsPercent = totalOriginal > 0 && completedItems.length === items.length
    ? Math.max(0, Math.round((savedBytes / totalOriginal) * 100))
    : 0;

  const failedItems = items.filter((item) => item.status === 'error' || (item.status === 'completed' && item.targetMet === false));

  return (
    <div className="w-full glass-panel rounded-xl p-3 sm:p-4 border border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-2 text-zinc-400">
        <Layers className="w-4 h-4 text-indigo-400" />
        <span>
          <strong className="text-white font-medium">{items.length}</strong> {items.length === 1 ? 'image' : 'images'}
        </span>
        <span className="text-zinc-600">•</span>
        <span>Original: <strong className="text-zinc-300 font-mono">{formatBytes(totalOriginal)}</strong></span>
      </div>

      {completedItems.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Compressed:</span>
            <span className="text-zinc-200 font-mono font-medium">{formatBytes(totalCompressed)}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Saved {savingsPercent}% ({formatBytes(Math.max(0, savedBytes))})</span>
          </div>

          {failedItems.length > 0 && (
            <div className="flex items-center gap-1 text-amber-400" title={`${failedItems.length} images could not reach strict target size`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{failedItems.length} exceeded target</span>
            </div>
          )}

          {failedItems.length === 0 && completedItems.length === items.length && (
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All optimized</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
