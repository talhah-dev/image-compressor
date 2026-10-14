import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-white/[0.06] bg-[#090a0f]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-semibold text-lg tracking-tight">
            Q
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-lg tracking-tight text-white">Quzex</span>
            <span className="text-xs text-zinc-500 font-mono">v1.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side Private</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-400 font-medium px-2 py-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Smart Solver</span>
          </div>
        </div>
      </div>
    </header>
  );
};
