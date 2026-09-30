import React, { useState } from 'react';
import {
  FileText,
  Download,
  QrCode,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  Printer,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { BatchRecord, BatchReport } from '../types';
import { getVeggieBadge } from './BatchesTab';

interface Props {
  reports: BatchReport[];
  batches: BatchRecord[];
  activeBatch: BatchRecord | null;
  onGenerateReport: (batchId: string) => void;
  onViewVerification: (reportId: string) => void;
}

export const ReportsTab: React.FC<Props> = ({
  reports,
  batches,
  activeBatch,
  onGenerateReport,
  onViewVerification,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    activeBatch?.id || batches[0]?.id || ''
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGeneratePdf = (report: BatchReport) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Background / Header Bar
      doc.setFillColor(27, 94, 32); // AgriGrade Green
      doc.rect(0, 0, 210, 28, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('AGRIGRADE QUALITY CERTIFICATE', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('AI-Powered Agricultural Assessment & Grading Specification', 14, 24);

      // Certificate Meta
      const targetBatch = batches.find((b) => b.id === report.batchId);
      const commodityBadge = getVeggieBadge(targetBatch?.product);

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.text(`Certificate ID: ${report.id}`, 14, 38);
      doc.text(`Batch Reference: ${report.batchName} (${report.batchId})`, 14, 44);
      doc.text(`Product Commodity: ${commodityBadge.name.toUpperCase()} (${commodityBadge.id})`, 14, 50);
      doc.text(`Issue Timestamp: ${new Date(report.generatedAt).toUTCString()}`, 14, 56);
      doc.text(`Certified By Operator: ${report.generatedBy}`, 14, 62);

      // Draw Separator
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 66, 196, 66);

      // Section: Quality Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(27, 94, 32);
      doc.text('1. INSPECTION & GRADING METRICS', 14, 74);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);

      const s = report.summary;
      doc.text(`• Total Units Assessed: ${s.totalInspected}`, 18, 82);
      doc.text(
        `• Grade A (Premium Market): ${s.gradeA} units (${
          s.totalInspected > 0 ? Math.round((s.gradeA / s.totalInspected) * 100) : 0
        }%)`,
        18,
        88
      );
      doc.text(
        `• Grade B (Processing / Commercial): ${s.gradeB} units (${
          s.totalInspected > 0 ? Math.round((s.gradeB / s.totalInspected) * 100) : 0
        }%)`,
        18,
        94
      );
      doc.text(
        `• Reject / Quarantined: ${s.reject} units (${
          s.totalInspected > 0 ? Math.round((s.reject / s.totalInspected) * 100) : 0
        }%)`,
        18,
        100
      );
      doc.text(
        `• Average Computer-Vision Confidence: ${(s.averageConfidence * 100).toFixed(1)}%`,
        18,
        106
      );
      doc.text(
        `• Human-Reviewed Inspections: ${s.humanReviewedCount} units (Deterministic Verification)`,
        18,
        112
      );

      // Section: Defects
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(27, 94, 32);
      doc.text('2. DEFECT EPIDEMIOLOGY SUMMARY', 14, 124);

      let curY = 132;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (report.defectsSummary.length === 0) {
        doc.text('Zero surface defects recorded across batch inspections.', 18, curY);
        curY += 8;
      } else {
        report.defectsSummary.slice(0, 6).forEach((d) => {
          doc.text(`• ${d.defectType.toUpperCase()}: ${d.count} occurrences (${d.frequencyPercent}% prevalence)`, 18, curY);
          curY += 6;
        });
      }

      // Section: Digital Verification & QR
      curY = Math.max(curY + 4, 160);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(27, 94, 32);
      doc.text('3. PUBLIC AUDIT & QR VERIFICATION', 14, curY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(
        'Scan the secure QR code to verify certificate authenticity on the AgriGrade ledger.',
        14,
        curY + 6
      );
      doc.text(
        `Digital Hash Signature: ${report.verificationRecord.digitalSignature}`,
        14,
        curY + 12
      );

      // Add QR Code image into PDF
      if (report.qrCodeUrl) {
        doc.addImage(report.qrCodeUrl, 'PNG', 14, curY + 16, 45, 45);
      }

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('Verification URL:', 65, curY + 28);
      doc.text(report.publicVerifyUrl, 65, curY + 34);
      doc.text('Status: CRYPTOGRAPHICALLY VERIFIED & SIGNED', 65, curY + 42);

      // Save PDF
      doc.save(`AgriGrade_Report_${report.id}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  const handleTriggerGenerate = async () => {
    if (!selectedBatchId) return;
    setIsGenerating(true);
    try {
      await onGenerateReport(selectedBatchId);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20 text-xs">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-slate-100">Quality Reports & QR</h2>
        <p className="text-[11px] text-slate-400">
          Official batch certificates with cryptographic verification
        </p>
      </div>

      {/* Generate Report for Batch Bar - Robust Responsive Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
        <label className="text-xs font-bold text-slate-200 block">
          Generate Batch Certificate:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full sm:flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 truncate"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.totalInspected} items)
              </option>
            ))}
          </select>
          <button
            onClick={handleTriggerGenerate}
            disabled={isGenerating || !selectedBatchId}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all shrink-0 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200">
            Generated Reports ({reports.length})
          </h3>
          <span className="text-[10px] text-slate-400">Tamper-evident audit</span>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-400">
            No batch reports generated yet. Select a batch above to create your first report.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm overflow-hidden"
              >
                {/* Header of Report Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-emerald-400 truncate">
                        {report.id}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mt-0.5 truncate">
                      {report.batchName}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      Product: {getVeggieBadge(batches.find((b) => b.id === report.batchId)?.product).emoji}{' '}
                      {getVeggieBadge(batches.find((b) => b.id === report.batchId)?.product).name} • Total Inspected: {report.summary.totalInspected} units
                    </p>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold flex items-center space-x-1 shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    <span>VERIFIED</span>
                  </span>
                </div>

                {/* Grade Distribution Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[9px] text-emerald-400 font-semibold">Grade A</span>
                    <p className="text-sm font-bold text-slate-100 font-mono">
                      {report.summary.gradeA}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[9px] text-amber-400 font-semibold">Grade B</span>
                    <p className="text-sm font-bold text-slate-100 font-mono">
                      {report.summary.gradeB}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[9px] text-rose-400 font-semibold">Reject</span>
                    <p className="text-sm font-bold text-slate-100 font-mono">
                      {report.summary.reject}
                    </p>
                  </div>
                </div>

                {/* QR Code and Verification Links - Responsive & Safe From Overflow */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <img
                      src={report.qrCodeUrl}
                      alt="Verification QR"
                      className="w-14 h-14 rounded-lg bg-white p-1 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-slate-300 block">
                        Public Verification QR
                      </span>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate font-mono">
                        Hash: {report.verificationRecord.digitalSignature}
                      </p>
                      <button
                        onClick={() => onViewVerification(report.id)}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 mt-1 cursor-pointer"
                      >
                        <span>Open Public View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGeneratePdf(report)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 shadow-sm shrink-0 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
