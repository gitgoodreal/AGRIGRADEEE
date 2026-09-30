import React from 'react';
import {
  CheckCircle,
  AlertOctagon,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Camera,
  AlertTriangle,
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { BatchRecord, InspectionRecord } from '../types';

interface Props {
  inspections: InspectionRecord[];
  activeBatch: BatchRecord | null;
  pendingReviewsCount: number;
  onNavigateToInspect: () => void;
  onNavigateToBatches: () => void;
  onNavigateToReviews: () => void;
  onSelectInspection: (inspection: InspectionRecord) => void;
}

export const DashboardTab: React.FC<Props> = ({
  inspections,
  activeBatch,
  pendingReviewsCount,
  onNavigateToInspect,
  onNavigateToBatches,
  onNavigateToReviews,
  onSelectInspection,
}) => {
  const totalInspected = inspections.length;

  let gradeACount = 0;
  let gradeBCount = 0;
  let rejectCount = 0;
  let totalConfidence = 0;

  inspections.forEach((insp) => {
    const effectiveGrade = insp.humanReview?.reviewed && insp.humanReview.finalGrade
      ? insp.humanReview.finalGrade
      : insp.gradingResult.grade;

    if (effectiveGrade === 'GRADE_A') gradeACount++;
    else if (effectiveGrade === 'GRADE_B') gradeBCount++;
    else rejectCount++;

    totalConfidence += insp.aiAnalysis.overallConfidence;
  });

  const avgConfidence = totalInspected > 0 ? (totalConfidence / totalInspected) * 100 : 0;
  const recentInspections = inspections.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20">
      {/* Active Batch Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-800/40 p-4 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Current Active Batch
              </p>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-1">
              {activeBatch ? activeBatch.name : 'No Active Batch Selected'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeBatch
                ? `Operator: ${activeBatch.operatorName} • Target: ${activeBatch.targetQuantity || 'Open'} units`
                : 'Create or select a batch to organize inspections'}
            </p>
          </div>

          <button
            onClick={onNavigateToBatches}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 border border-slate-700 transition-colors"
          >
            <span>{activeBatch ? 'Change' : 'Create'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeBatch && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Inspected in this batch:{' '}
              <strong className="text-slate-200">{activeBatch.totalInspected}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-medium">A: {activeBatch.gradeACount}</span>
              <span className="text-amber-400 font-medium">B: {activeBatch.gradeBCount}</span>
              <span className="text-rose-400 font-medium">R: {activeBatch.rejectCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Inspected */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Inspected</span>
            <div className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-100 font-mono">
              {totalInspected}
            </span>
            <span className="text-[11px] text-slate-400 ml-1.5">units</span>
          </div>
        </div>

        {/* Average AI Confidence */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Avg AI Confidence</span>
            <div className="p-1.5 rounded-lg bg-blue-950/60 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-100 font-mono">
              {totalInspected > 0 ? `${avgConfidence.toFixed(1)}%` : '--'}
            </span>
            <span className="text-[11px] text-slate-400 ml-1.5">vision score</span>
          </div>
        </div>
      </div>

      {/* Grade Distribution Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">Quality Breakdown</h3>
          </div>
          <span className="text-[11px] text-slate-400">Deterministic Engine</span>
        </div>

        {/* Distribution Progress Bar */}
        {totalInspected > 0 ? (
          <div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              {gradeACount > 0 && (
                <div
                  style={{ width: `${(gradeACount / totalInspected) * 100}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Grade A: ${gradeACount}`}
                />
              )}
              {gradeBCount > 0 && (
                <div
                  style={{ width: `${(gradeBCount / totalInspected) * 100}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Grade B: ${gradeBCount}`}
                />
              )}
              {rejectCount > 0 && (
                <div
                  style={{ width: `${(rejectCount / totalInspected) * 100}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Reject: ${rejectCount}`}
                />
              )}
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <div>
                  <p className="text-[10px] text-slate-400 leading-none">Grade A</p>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">
                    {gradeACount}{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({Math.round((gradeACount / totalInspected) * 100)}%)
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <div>
                  <p className="text-[10px] text-slate-400 leading-none">Grade B</p>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">
                    {gradeBCount}{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({Math.round((gradeBCount / totalInspected) * 100)}%)
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <div>
                  <p className="text-[10px] text-slate-400 leading-none">Reject</p>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">
                    {rejectCount}{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({Math.round((rejectCount / totalInspected) * 100)}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-xs text-slate-400">
            No grading records logged yet.
          </div>
        )}
      </div>

      {/* Pending Human Reviews Card */}
      {pendingReviewsCount > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                {pendingReviewsCount} Inspection(s) Need Review
              </h4>
              <p className="text-xs text-amber-400/80">
                Low AI confidence or borderline defect limits
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToReviews}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-sm"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Primary Action Button */}
      <button
        onClick={onNavigateToInspect}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer capitalize"
      >
        <Camera className="w-4 h-4" />
        <span>
          {activeBatch?.product
            ? `Inspect New ${activeBatch.product.replace('_', ' ')}`
            : 'Inspect New Vegetable'}
        </span>
      </button>

      {/* Recent Inspections List */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">Recent Inspections</h3>
          <span className="text-xs text-slate-400">
            {totalInspected > 0 ? `Showing ${recentInspections.length} of ${totalInspected}` : ''}
          </span>
        </div>

        {totalInspected === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-2xl">
              🥗
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">No inspections yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Capture a specimen using the Camera or choose from Gallery to assess quality.
              </p>
            </div>
            <button
              onClick={onNavigateToInspect}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/40 text-xs font-semibold transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Start First Inspection</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentInspections.map((insp) => {
              const effectiveGrade = insp.humanReview?.reviewed && insp.humanReview.finalGrade
                ? insp.humanReview.finalGrade
                : insp.gradingResult.grade;

              const isGradeA = effectiveGrade === 'GRADE_A';
              const isGradeB = effectiveGrade === 'GRADE_B';

              return (
                <div
                  key={insp.id}
                  onClick={() => onSelectInspection(insp)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={insp.imageDataUrl}
                      alt="Produce thumb"
                      className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {insp.id}
                        </span>
                        {insp.isDemo && (
                          <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            DEMO
                          </span>
                        )}
                        {insp.humanReview?.reviewed && (
                          <span className="text-[9px] px-1 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            HUMAN VERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {insp.aiAnalysis.defects.length === 0
                          ? 'Zero visible defects'
                          : `${insp.aiAnalysis.defects.length} defect(s) detected`}
                        {' • '}
                        {new Date(insp.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        isGradeA
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : isGradeB
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {effectiveGrade.replace('_', ' ')}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {(insp.aiAnalysis.overallConfidence * 100).toFixed(0)}% conf
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
