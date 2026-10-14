'use client';

import React, { useState } from 'react';
import { ImageFileItem, OutputFormat, CompressionMode } from '@/types/compressor';
import { X, Target, Sliders, Check } from 'lucide-react';

interface ImageSettingsModalProps {
  item: ImageFileItem;
  defaultMode: CompressionMode;
  defaultTargetKB: number;
  defaultQuality: number;
  defaultFormat: OutputFormat;
  onSave: (itemId: string, customSettings: NonNullable<ImageFileItem['customSettings']>) => void;
  onClose: () => void;
}

export const ImageSettingsModal: React.FC<ImageSettingsModalProps> = ({
  item,
  defaultMode,
  defaultTargetKB,
  defaultQuality,
  defaultFormat,
  onSave,
  onClose,
}) => {
  const [mode, setMode] = useState<CompressionMode>(
    item.customSettings?.mode ?? defaultMode
  );
  const [targetSizeKB, setTargetSizeKB] = useState<number>(
    item.customSettings?.targetSizeKB ?? defaultTargetKB
  );
  const [quality, setQuality] = useState<number>(
    item.customSettings?.quality ?? defaultQuality
  );
  const [format, setFormat] = useState<OutputFormat>(
    item.customSettings?.format ?? defaultFormat
  );

  const handleSave = () => {
    onSave(item.id, {
      mode,
      targetSizeKB,
      quality,
      format,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md glass-panel-elevated rounded-2xl border border-white/[0.12] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Custom Settings</h3>
            <p className="text-xs text-zinc-400 truncate max-w-[260px]">{item.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setMode('target-size')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'target-size'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Target Size</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('quality')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'quality'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Quality</span>
            </button>
          </div>

          {mode === 'target-size' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Max Size Limit (KB)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50000"
                  step="5"
                  value={targetSizeKB > 0 ? targetSizeKB : ''}
                  placeholder="Auto (No limit)"
                  onChange={(e) => setTargetSizeKB(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-zinc-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium pointer-events-none">
                  KB
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Quality Ratio</span>
                <span className="text-indigo-400 font-mono font-semibold">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Target Format</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { label: 'Original', value: 'original' },
                  { label: 'WebP', value: 'image/webp' },
                  { label: 'JPEG', value: 'image/jpeg' },
                  { label: 'PNG', value: 'image/png' },
                  { label: 'AVIF', value: 'image/avif' }
                ] as const
              ).map((fmt) => (
                <button
                  key={fmt.value}
                  type="button"
                  onClick={() => setFormat(fmt.value)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    format === fmt.value
                      ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply & Recompress</span>
          </button>
        </div>
      </div>
    </div>
  );
};
