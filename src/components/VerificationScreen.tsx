import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Award,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Layers,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { VerificationRecord } from '../types';

interface Props {
  reportId: string;
  onBack: () => void;
}

export const VerificationScreen: React.FC<Props> = ({ reportId, onBack }) => {
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/verify/${reportId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Certificate record not found.');
        return res.json();
      })
      .then((data) => {
        setRecord(data.verification);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Verification failed');
        setLoading(false);
      });
  }, [reportId]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 text-xs">
      {/* Top return nav */}
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to AgriGrade App</span>
      </button>

      {/* Main Public Certificate Card */}
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Verification Status Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold inline-block">
              CRYPTOGRAPHICALLY VERIFIED
            </span>
            <h2 className="text-base font-bold text-slate-100 mt-1">
              AgriGrade Quality Certificate
            </h2>
            <p className="text-[11px] font-mono text-slate-400">ID: {reportId}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Verifying digital signature...</div>
        ) : error || !record ? (
          <div className="py-8 text-center text-rose-400 space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto" />
            <p className="font-bold">Invalid or Expired Certificate</p>
            <p className="text-slate-400 text-xs">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Batch Reference</span>
                <p className="font-bold text-slate-200 mt-0.5 truncate">{record.batchName}</p>
                <span className="text-[10px] font-mono text-slate-500">{record.batchId}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Commodity</span>
                <p className="font-bold text-slate-200 mt-0.5">🥗 Fresh Produce</p>
                <span className="text-[10px] text-slate-400">USDA Certified Standard</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Units Inspected</span>
                <p className="font-bold text-slate-200 font-mono text-base mt-0.5">
                  {record.inspectionCount}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Cert Timestamp</span>
                <p className="font-bold text-slate-200 mt-0.5 text-[11px]">
                  {new Date(record.reportCreationDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Verified Grade Distribution */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Verified Quality Grade Breakdown</span>
              </h4>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-semibold block">Grade A</span>
                  <span className="text-sm font-bold font-mono text-slate-100">
                    {record.gradeDistribution.gradeA}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-semibold block">Grade B</span>
                  <span className="text-sm font-bold font-mono text-slate-100">
                    {record.gradeDistribution.gradeB}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-rose-400 font-semibold block">Reject</span>
                  <span className="text-sm font-bold font-mono text-slate-100">
                    {record.gradeDistribution.reject}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Ledger Signature */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[10px] space-y-1">
              <div className="flex items-center space-x-1 text-slate-400 font-bold">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Digital Tamper-Proof Hash:</span>
              </div>
              <p className="text-emerald-400 break-all select-all font-mono">
                {record.digitalSignature}
              </p>
            </div>

            {/* Privacy notice */}
            <p className="text-[10px] text-slate-500 text-center italic">
              Public Ledger View: Contains non-confidential grading statistics only. Inspector personal information and raw video buffers are protected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
