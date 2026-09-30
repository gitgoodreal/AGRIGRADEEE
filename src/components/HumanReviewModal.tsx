import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  Award,
  ShieldCheck,
  UserCheck,
  FileEdit,
  Clock,
} from 'lucide-react';
import { InspectionRecord, QualityGrade } from '../types';

interface Props {
  inspection: InspectionRecord;
  onClose: () => void;
  onReviewSubmitted: (updated: InspectionRecord) => void;
}

export const HumanReviewModal: React.FC<Props> = ({
  inspection,
  onClose,
  onReviewSubmitted,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<QualityGrade>(
    inspection.humanReview?.finalGrade || inspection.gradingResult.grade
  );
  const [reviewerName, setReviewerName] = useState<string>(
    inspection.humanReview?.reviewerName || 'QA Lead Inspector'
  );
  const [reviewNotes, setReviewNotes] = useState<string>(
    inspection.humanReview?.reviewNotes || ''
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/reviews/${inspection.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalGrade: selectedGrade,
          reviewerName,
          notes: reviewNotes || 'Human inspection confirmed and finalized.',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit human review.');
      }

      onReviewSubmitted(data.inspection);
      onClose();
    } catch (err: any) {
      console.error('Human review submission error:', err);
      setErrorMsg(err.message || 'Error finalizing human review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Human Review Console</h2>
              <p className="text-[11px] text-slate-400 font-mono">{inspection.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Reason for Review Alert */}
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Trigger for Human Review:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-200/90">
              {inspection.gradingResult.reviewReasons.length > 0 ? (
                inspection.gradingResult.reviewReasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))
              ) : (
                <li>Borderline confidence score or defect limit check.</li>
              )}
            </ul>
          </div>

          {/* Photo & Side-by-side AI Observations */}
          <div className="grid grid-cols-2 gap-3 items-start">
            <div className="aspect-square bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative">
              <img
                src={inspection.imageDataUrl}
                alt="Produce inspect review"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[9px] font-mono text-slate-300">
                Original Capture
              </span>
            </div>

            <div className="space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  AI Proposed Grade
                </span>
                <p className="text-base font-black font-mono text-slate-200">
                  {inspection.gradingResult.grade.replace('_', ' ')}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  AI Confidence
                </span>
                <p className="text-sm font-mono font-bold text-emerald-400">
                  {(inspection.aiAnalysis.overallConfidence * 100).toFixed(1)}%
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Shape & Size
                </span>
                <p className="text-xs text-slate-300 capitalize">
                  {inspection.aiAnalysis.shape.category} • {inspection.aiAnalysis.size.category}
                </p>
              </div>
            </div>
          </div>

          {/* Detected Defects List */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1.5">
            <h4 className="font-bold text-slate-300">
              AI Visible Defect Findings ({inspection.aiAnalysis.defects.length})
            </h4>
            {inspection.aiAnalysis.defects.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No defects recorded by vision model.</p>
            ) : (
              inspection.aiAnalysis.defects.map((d, idx) => (
                <div key={idx} className="text-[11px] text-slate-300 flex justify-between py-1 border-b border-slate-800/60 last:border-0">
                  <span>
                    • <strong className="text-slate-200">{d.label}</strong> ({d.severity}): {d.visibleEvidence}
                  </span>
                  <span className="font-mono text-slate-400 ml-2">{(d.confidence * 100).toFixed(0)}%</span>
                </div>
              ))
            )}
          </div>

          {/* Human Decision Section */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inspector Final Verdict</span>
            </h4>

            {/* Grade Selection */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Assign Final Verified Quality Grade:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['GRADE_A', 'GRADE_B', 'REJECT'] as QualityGrade[]).map((g) => {
                  const isSelected = selectedGrade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGrade(g)}
                      className={`py-2 px-2 rounded-xl font-bold font-mono text-xs border transition-all ${
                        isSelected
                          ? g === 'GRADE_A'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                            : g === 'GRADE_B'
                            ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                            : 'bg-rose-600 text-white border-rose-500 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {g.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inspector Name */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Inspector Name / ID:
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                placeholder="e.g. John Doe (Quality Inspector)"
              />
            </div>

            {/* Review Justification Notes */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Inspector Verification Justification & Notes:
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="e.g. Surface discoloration is superficial soil stain, tissue is firm and undamaged. Approved Grade A."
              />
            </div>

            {errorMsg && (
              <p className="text-rose-400 text-xs font-semibold">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center space-x-1.5"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Finalize Human Decision</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
