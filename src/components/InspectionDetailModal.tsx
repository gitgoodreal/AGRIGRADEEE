import React from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  User,
  ShieldCheck,
} from 'lucide-react';
import { InspectionRecord } from '../types';

interface Props {
  inspection: InspectionRecord;
  onClose: () => void;
  onRequestReview: (inspection: InspectionRecord) => void;
}

export const InspectionDetailModal: React.FC<Props> = ({
  inspection,
  onClose,
  onRequestReview,
}) => {
  const effectiveGrade =
    inspection.humanReview?.reviewed && inspection.humanReview.finalGrade
      ? inspection.humanReview.finalGrade
      : inspection.gradingResult.grade;

  const isGradeA = effectiveGrade === 'GRADE_A';
  const isGradeB = effectiveGrade === 'GRADE_B';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-slate-100">{inspection.id}</span>
              {inspection.isDemo && (
                <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {new Date(inspection.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* Main Image */}
          <div className="aspect-[4/3] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative">
            <img
              src={inspection.imageDataUrl}
              alt="Produce inspection capture"
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-2 left-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono shadow-md ${
                  isGradeA
                    ? 'bg-emerald-600 text-white'
                    : isGradeB
                    ? 'bg-amber-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {effectiveGrade.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Human Review Status Banner if applicable */}
          {inspection.humanReview?.reviewed ? (
            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-blue-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Verified by Inspector: {inspection.humanReview.reviewerName}</span>
              </div>
              <p className="text-[11px] text-blue-200">
                Notes: "{inspection.humanReview.reviewNotes}"
              </p>
            </div>
          ) : inspection.gradingResult.needsHumanReview ? (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-amber-300">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Requires Human Review</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onRequestReview(inspection);
                }}
                className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Review
              </button>
            </div>
          ) : null}

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400">Confidence</span>
              <p className="font-bold font-mono text-emerald-400 text-sm mt-0.5">
                {(inspection.aiAnalysis.overallConfidence * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400">Shape</span>
              <p className="font-bold text-slate-200 capitalize text-xs mt-0.5">
                {inspection.aiAnalysis.shape.category}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400">Size (Visual)</span>
              <p className="font-bold text-slate-200 capitalize text-xs mt-0.5">
                {inspection.aiAnalysis.size.category}
              </p>
            </div>
          </div>

          {/* Defects list */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
            <h4 className="font-bold text-slate-200">
              Defects Identified ({inspection.aiAnalysis.defects.length})
            </h4>
            {inspection.aiAnalysis.defects.length === 0 ? (
              <p className="text-slate-400 italic">No defects observed.</p>
            ) : (
              inspection.aiAnalysis.defects.map((d, i) => (
                <div
                  key={i}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-0.5"
                >
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{d.label}</span>
                    <span className="uppercase text-[9px] text-amber-400">{d.severity}</span>
                  </div>
                  <p className="text-slate-400 italic">"{d.visibleEvidence}"</p>
                </div>
              ))
            )}
          </div>

          {/* Rule criteria */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-1.5">
            <h4 className="font-bold text-slate-200">Grading Rule Criteria</h4>
            {inspection.gradingResult.criteriaBreakdown.map((c, i) => (
              <div key={i} className="flex items-start space-x-1.5 text-[11px] text-slate-300">
                {c.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>
                  <strong>{c.criterion}:</strong> {c.details}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
