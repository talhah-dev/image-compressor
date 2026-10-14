'use client';

import React from 'react';
import {
  CompressorSettings,
  CompressionMode,
  OutputFormat,
  NamingPattern
} from '@/types/compressor';
import { Play, Download, Trash2, Sliders, Target, Sparkles, Loader2, FileText } from 'lucide-react';

interface SettingsBarProps {
  settings: CompressorSettings;
  onSettingsChange: (newSettings: CompressorSettings) => void;
  onCompressAll: () => void;
  onDownloadAll: () => void;
  onClearAll: () => void;
  isProcessing: boolean;
  hasImages: boolean;
  completedCount: number;
  totalCount: number;
}

const PRESET_SIZES = [0, 50, 100, 200, 500, 1024];

export const SettingsBar: React.FC<SettingsBarProps> = ({
  settings,
  onSettingsChange,
  onCompressAll,
  onDownloadAll,
  onClearAll,
  isProcessing,
  hasImages,
  completedCount,
  totalCount,
}) => {
  const updateMode = (mode: CompressionMode) => {
    onSettingsChange({ ...settings, mode });
  };

  const updateFormat = (format: OutputFormat) => {
    onSettingsChange({ ...settings, format });
  };

  const updateTargetSize = (targetSizeKB: number) => {
    onSettingsChange({ ...settings, targetSizeKB: Math.max(0, targetSizeKB) });
  };

  const updateQuality = (quality: number) => {
    onSettingsChange({ ...settings, quality });
  };

  const updateMaxDimension = (maxDimension: number) => {
    onSettingsChange({ ...settings, maxDimension });
  };

  const updateNamingPattern = (namingPattern: NamingPattern) => {
    onSettingsChange({ ...settings, namingPattern });
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => updateMode('target-size')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              settings.mode === 'target-size'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Target Size</span>
          </button>
          <button
            type="button"
            onClick={() => updateMode('quality')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              settings.mode === 'quality'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Quality Ratio</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasImages && (
            <>
              <button
                type="button"
                onClick={onClearAll}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                title="Clear all images"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>

              <button
                type="button"
                onClick={onDownloadAll}
                disabled={completedCount === 0 || isProcessing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All ({completedCount})</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onCompressAll}
            disabled={!hasImages || isProcessing}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 shadow-md shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compressing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Compress Images</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {settings.mode === 'target-size' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                <span>Target Size</span>
                <span className="text-[10px] text-zinc-500">(max)</span>
              </label>
              <span className="text-xs font-semibold text-indigo-400 font-mono">
                {settings.targetSizeKB > 0
                  ? settings.targetSizeKB >= 1024
                    ? `${(settings.targetSizeKB / 1024).toFixed(1)} MB`
                    : `${settings.targetSizeKB} KB`
                  : 'Auto (Original)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="102400"
                  step="5"
                  value={settings.targetSizeKB > 0 ? settings.targetSizeKB : ''}
                  placeholder="Auto (No limit)"
                  onChange={(e) => updateTargetSize(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-zinc-600"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500 font-medium pointer-events-none">
                  KB
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 pt-1">
              {PRESET_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateTargetSize(size)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    settings.targetSizeKB === size
                      ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-xs'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
                  }`}
                >
                  {size === 0 ? 'Auto' : size >= 1024 ? `${size / 1024}M` : `${size}K`}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                <span>Compression Quality</span>
              </label>
              <span className="text-xs font-semibold text-indigo-400 font-mono">
                {Math.round(settings.quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.quality}
              onChange={(e) => updateQuality(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Small</span>
              <span>Balanced</span>
              <span>Max</span>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
            <span>Output Format</span>
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </label>
          <div className="grid grid-cols-3 gap-1">
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
                onClick={() => updateFormat(fmt.value)}
                className={`py-1.5 px-1.5 rounded-lg text-xs font-medium transition-all ${
                  settings.format === fmt.value
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-xs'
                    : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
            <span>Max Dimension</span>
          </label>
          <select
            value={settings.maxDimension}
            onChange={(e) => updateMaxDimension(Number(e.target.value))}
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 focus:outline-none rounded-lg px-2.5 py-2 text-xs text-white"
          >
            <option value={0} className="bg-[#12141d] text-white">Original Dimensions</option>
            <option value={2560} className="bg-[#12141d] text-white">2K (2560px)</option>
            <option value={1920} className="bg-[#12141d] text-white">FHD (1920px)</option>
            <option value={1280} className="bg-[#12141d] text-white">HD (1280px)</option>
            <option value={800} className="bg-[#12141d] text-white">Mobile (800px)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>File Naming</span>
          </label>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => updateNamingPattern('original')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all truncate ${
                settings.namingPattern === 'original'
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-xs'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
              }`}
              title="Keep original filename (default)"
            >
              Original Name
            </button>
            <button
              type="button"
              onClick={() => updateNamingPattern('sequential')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all truncate ${
                settings.namingPattern === 'sequential'
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-xs'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
              }`}
              title="Sequential: image-1, image-2..."
            >
              image-1, 2...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
