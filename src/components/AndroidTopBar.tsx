import React from 'react';
import { Layers, AlertTriangle, Menu, ShieldCheck } from 'lucide-react';
import { BatchRecord } from '../types';

interface Props {
  title: string;
  subtitle?: string;
  activeBatch: BatchRecord | null;
  pendingReviewsCount: number;
  onOpenBatch: () => void;
  onOpenReviews: () => void;
  onToggleSidebar?: () => void;
  onOpenHelp?: () => void;
  isOnline?: boolean;
}

export const AndroidTopBar: React.FC<Props> = ({
  title,
  subtitle,
  activeBatch,
  pendingReviewsCount,
  onOpenBatch,
  onOpenReviews,
  onToggleSidebar,
  isOnline = true,
}) => {
  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between z-20">
      <div className="flex items-center space-x-2.5">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title="Open Navigation Menu"
            aria-label="Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-md shadow-emerald-950/40 text-base shrink-0">
          🌱
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none">
              {title}
            </h1>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-mono font-semibold">
              QA
            </span>
          </div>
          {subtitle && (
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1.5">
        {/* Pending Reviews Quick Action */}
        {pendingReviewsCount > 0 && (
          <button
            onClick={onOpenReviews}
            className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold hover:bg-amber-500/30 transition-colors animate-pulse cursor-pointer"
            title={`${pendingReviewsCount} inspection(s) require human review`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{pendingReviewsCount} Review</span>
          </button>
        )}

        {/* Active Batch Chip */}
        <button
          onClick={onOpenBatch}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 font-medium transition-colors cursor-pointer max-w-[130px] truncate"
          title={activeBatch ? `Active Batch: ${activeBatch.name}` : 'No active batch'}
        >
          <Layers className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">
            {activeBatch ? activeBatch.name.split('-')[0] : 'Batches'}
          </span>
        </button>
      </div>
    </header>
  );
};
