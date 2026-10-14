'use client';

import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
      e.target.value = '';
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const imageFiles = Array.from(e.clipboardData.files).filter((file) =>
          file.type.startsWith('image/')
        );
        if (imageFiles.length > 0) {
          onFilesSelected(imageFiles);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer text-center p-8 sm:p-10 ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-500/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.2)]'
          : 'border-white/[0.08] bg-[#12141d]/60 hover:border-white/[0.18] hover:bg-[#161926]/70'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload-input"
      />

      <div className="flex flex-col items-center justify-center gap-3">
        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragOver
              ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/30'
              : 'bg-white/[0.05] text-zinc-300 group-hover:bg-white/[0.1] group-hover:text-white group-hover:scale-105'
          }`}
        >
          {isDragOver ? (
            <UploadCloud className="w-7 h-7 animate-bounce" />
          ) : (
            <ImageIcon className="w-7 h-7" />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-base sm:text-lg font-medium text-white tracking-tight">
            Drop images here or <span className="text-indigo-400 underline underline-offset-4">browse files</span>
          </p>
          <p className="text-xs text-zinc-400">
            Paste from clipboard (<kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-mono text-[10px]">Ctrl+V</kbd>) or upload multiple files
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          {['WebP', 'JPEG', 'PNG', 'AVIF'].map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-zinc-400"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
