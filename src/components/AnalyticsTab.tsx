import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  PieChart,
  TrendingUp,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { BatchRecord, InspectionRecord } from '../types';

interface Props {
  inspections: InspectionRecord[];
  batches: BatchRecord[];
}

export const AnalyticsTab: React.FC<Props> = ({ inspections, batches }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [inspections.length, batches.length]);

  if (isLoading && !analyticsData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  const total = analyticsData?.totalInspections || inspections.length;
  const gradeDist = analyticsData?.gradeDistribution || { gradeA: 0, gradeB: 0, reject: 0 };
  const defectDist: Record<string, number> = analyticsData?.defectDistribution || {};
  const defectEntries = Object.entries(defectDist).sort((a, b) => b[1] - a[1]);

  if (total === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl">
          📊
        </div>
        <h3 className="text-sm font-bold text-slate-200">No Analytics Available</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Perform produce inspections to generate quality distributions, defect prevalence, and batch performance metrics.
        </p>
      </div>
    );
  }

  const gradeAPct = total > 0 ? Math.round((gradeDist.gradeA / total) * 100) : 0;
  const gradeBPct = total > 0 ? Math.round((gradeDist.gradeB / total) * 100) : 0;
  const rejectPct = total > 0 ? Math.round((gradeDist.reject / total) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Quality Intelligence</h2>
          <p className="text-[11px] text-slate-400">
            Real-time quality metrics across {total} inspected specimens
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top 3 KPI Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 font-medium">Avg Confidence</span>
          <p className="text-base font-extrabold text-blue-400 font-mono mt-0.5">
            {(analyticsData?.averageConfidence * 100 || 0).toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 font-medium">Review Rate</span>
          <p className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
            {analyticsData?.humanReviewStats?.reviewRatePercent || 0}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-[10px] text-slate-400 font-medium">Total Batches</span>
          <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
            {batches.length}
          </p>
        </div>
      </div>

      {/* Quality Grade Distribution Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Grade Distribution</span>
          </h3>
          <span className="text-[10px] text-slate-400">Total: {total}</span>
        </div>

        {/* Horizontal Stacked Bar */}
        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex">
          {gradeDist.gradeA > 0 && (
            <div
              style={{ width: `${(gradeDist.gradeA / total) * 100}%` }}
              className="bg-emerald-500 h-full transition-all duration-300"
              title={`Grade A: ${gradeDist.gradeA}`}
            />
          )}
          {gradeDist.gradeB > 0 && (
            <div
              style={{ width: `${(gradeDist.gradeB / total) * 100}%` }}
              className="bg-amber-500 h-full transition-all duration-300"
              title={`Grade B: ${gradeDist.gradeB}`}
            />
          )}
          {gradeDist.reject > 0 && (
            <div
              style={{ width: `${(gradeDist.reject / total) * 100}%` }}
              className="bg-rose-500 h-full transition-all duration-300"
              title={`Reject: ${gradeDist.reject}`}
            />
          )}
        </div>

        {/* Legend / Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-emerald-400 font-semibold block">Grade A</span>
            <span className="font-bold font-mono text-sm text-slate-100">{gradeDist.gradeA}</span>
            <span className="text-[10px] text-slate-400 block">({gradeAPct}%)</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-amber-400 font-semibold block">Grade B</span>
            <span className="font-bold font-mono text-sm text-slate-100">{gradeDist.gradeB}</span>
            <span className="text-[10px] text-slate-400 block">({gradeBPct}%)</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-rose-400 font-semibold block">Reject</span>
            <span className="font-bold font-mono text-sm text-slate-100">{gradeDist.reject}</span>
            <span className="text-[10px] text-slate-400 block">({rejectPct}%)</span>
          </div>
        </div>
      </div>

      {/* Defect Breakdown List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h3 className="font-bold text-slate-200 flex items-center space-x-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Defect Frequency Analysis</span>
        </h3>

        {defectEntries.length === 0 ? (
          <p className="text-slate-400 italic text-center py-2">
            No defect anomalies identified in inspected produce.
          </p>
        ) : (
          <div className="space-y-2">
            {defectEntries.map(([type, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="capitalize text-slate-300 font-medium">
                      {type.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-slate-400">
                      {count} occurrences ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(pct * 2, 100)}%` }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Batch Performance Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h3 className="font-bold text-slate-200 flex items-center space-x-1.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Batch Comparison</span>
        </h3>

        <div className="space-y-2">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-200">{batch.name}</span>
                <p className="text-[10px] text-slate-400">
                  {batch.totalInspected} units • {batch.product}
                </p>
              </div>

              <div className="flex items-center space-x-2 font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  A: {batch.gradeACount}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  B: {batch.gradeBCount}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                  R: {batch.rejectCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
