import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Lock,
  CheckCircle,
  Clock,
  ChevronRight,
  UserCheck,
  Calendar,
  BarChart,
  FileText,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { BatchRecord, InspectionRecord } from '../types';

interface Props {
  batches: BatchRecord[];
  activeBatch: BatchRecord | null;
  inspections: InspectionRecord[];
  onBatchCreated: (newBatch: BatchRecord) => void;
  onBatchActivated: (batchId: string) => void;
  onBatchClosed: (batchId: string) => void;
  onSelectInspection: (record: InspectionRecord) => void;
  onGenerateReportForBatch: (batchId: string) => void;
}

const PRODUCE_OPTIONS = [
  { id: 'tomato', name: 'Tomato', emoji: '🍅' },
  { id: 'bell_pepper', name: 'Bell Pepper', emoji: '🫑' },
  { id: 'carrot', name: 'Carrot', emoji: '🥕' },
  { id: 'onion', name: 'Onion', emoji: '🧅' },
  { id: 'cucumber', name: 'Cucumber', emoji: '🥒' },
  { id: 'potato', name: 'Potato', emoji: '🥔' },
];

export const getVeggieBadge = (product?: string) => {
  const match = PRODUCE_OPTIONS.find((p) => p.id === product);
  if (match) return match;
  return { id: 'vegetable', name: product ? product.replace('_', ' ') : 'Produce', emoji: '🥗' };
};

export const BatchesTab: React.FC<Props> = ({
  batches,
  activeBatch,
  inspections,
  onBatchCreated,
  onBatchActivated,
  onBatchClosed,
  onSelectInspection,
  onGenerateReportForBatch,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newBatchName, setNewBatchName] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('tomato');
  const [operatorName, setOperatorName] = useState<string>('Marcus Vance (AgriTech QA)');
  const [targetQuantity, setTargetQuantity] = useState<string>('150');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    activeBatch?.id || batches[0]?.id || ''
  );

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const batchInspections = inspections.filter((i) => i.batchId === selectedBatch?.id);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBatchName,
          product: selectedProduct,
          operatorName,
          targetQuantity: targetQuantity ? parseInt(targetQuantity, 10) : undefined,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success && data.batch) {
        onBatchCreated(data.batch);
        setSelectedBatchId(data.batch.id);
        setShowCreateModal(false);
        setNewBatchName('');
        setNotes('');
      }
    } catch (err) {
      console.error('Error creating batch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseBatch = async (id: string) => {
    try {
      const res = await fetch(`/api/batches/${id}/close`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onBatchClosed(id);
      }
    } catch (err) {
      console.error('Error closing batch:', err);
    }
  };

  const handleActivateBatch = async (id: string) => {
    try {
      const res = await fetch(`/api/batches/${id}/activate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onBatchActivated(id);
      }
    } catch (err) {
      console.error('Error activating batch:', err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 text-xs">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Harvest Lot Batches</h2>
          <p className="text-[11px] text-slate-400">
            Organize grading runs by lot, crop, and field sector
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Batch</span>
        </button>
      </div>

      {/* Batches Horizontal Selector Carousel */}
      <div className="flex space-x-2.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {batches.map((batch) => {
          const isSelected = batch.id === selectedBatch?.id;
          const isActiveLot = batch.id === activeBatch?.id;
          const badge = getVeggieBadge(batch.product);

          return (
            <button
              key={batch.id}
              onClick={() => setSelectedBatchId(batch.id)}
              className={`p-3 rounded-2xl border text-left shrink-0 w-44 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {batch.id.replace('BATCH-', '#')}
                </span>
                <span className="text-base">{badge.emoji}</span>
              </div>

              <div className="font-bold text-slate-100 truncate text-xs">{batch.name}</div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                <span className="capitalize">{badge.name}</span>
                <span className="font-mono text-slate-300 font-semibold">
                  {batch.totalInspected} scanned
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                {isActiveLot ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ACTIVE</span>
                  </span>
                ) : batch.status === 'closed' ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-500 border border-slate-800 text-[9px] font-bold">
                    FINALIZED
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-[9px]">
                    Open
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Batch Detailed Card */}
      {selectedBatch && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-emerald-400">{selectedBatch.id}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-medium">
                  {getVeggieBadge(selectedBatch.product).emoji}{' '}
                  {getVeggieBadge(selectedBatch.product).name}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">
                {selectedBatch.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Created: {new Date(selectedBatch.createdAt).toLocaleDateString()} by{' '}
                {selectedBatch.operatorName}
              </p>
            </div>

            {/* Batch Status Action */}
            <div className="flex items-center space-x-1.5">
              {activeBatch?.id !== selectedBatch.id && selectedBatch.status === 'active' && (
                <button
                  onClick={() => handleActivateBatch(selectedBatch.id)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer"
                >
                  Make Active
                </button>
              )}
              {selectedBatch.status === 'active' && (
                <button
                  onClick={() => handleCloseBatch(selectedBatch.id)}
                  className="px-2.5 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Finalize</span>
                </button>
              )}
            </div>
          </div>

          {/* Target Quantity Progress */}
          {selectedBatch.targetQuantity && (
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Lot Inspection Progress</span>
                <span className="font-mono text-slate-200">
                  {selectedBatch.totalInspected} / {selectedBatch.targetQuantity} (
                  {Math.min(
                    Math.round((selectedBatch.totalInspected / selectedBatch.targetQuantity) * 100),
                    100
                  )}
                  %)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(
                      (selectedBatch.totalInspected / selectedBatch.targetQuantity) * 100,
                      100
                    )}%`,
                  }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Batch Metrics Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400">Total</span>
              <p className="text-base font-extrabold text-slate-100 font-mono mt-0.5">
                {selectedBatch.totalInspected}
              </p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-emerald-400">Grade A</span>
              <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                {selectedBatch.gradeACount}
              </p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-amber-400">Grade B</span>
              <p className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
                {selectedBatch.gradeBCount}
              </p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-rose-400">Reject</span>
              <p className="text-base font-extrabold text-rose-400 font-mono mt-0.5">
                {selectedBatch.rejectCount}
              </p>
            </div>
          </div>

          {/* Generate Report Quick Button */}
          <button
            onClick={() => onGenerateReportForBatch(selectedBatch.id)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.99] border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm"
          >
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Generate Batch Certificate Report</span>
          </button>
        </div>
      )}

      {/* Inspections in this Batch */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-xs">
            Batch Inspections ({batchInspections.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Real-time Log</span>
        </div>

        {batchInspections.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-400 text-xs">
            No inspections recorded in this batch yet. Go to Inspect tab to scan specimens.
          </div>
        ) : (
          <div className="space-y-2">
            {batchInspections.map((insp) => (
              <div
                key={insp.id}
                onClick={() => onSelectInspection(insp)}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={insp.imageDataUrl}
                    alt="Inspect item thumbnail"
                    className="w-10 h-10 rounded-xl object-cover bg-slate-950 border border-slate-800"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-bold text-slate-300">
                        {insp.id}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                          insp.gradingResult.grade === 'GRADE_A'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : insp.gradingResult.grade === 'GRADE_B'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {insp.gradingResult.grade.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {insp.aiAnalysis.defects.length} defect(s) •{' '}
                      {(insp.aiAnalysis.overallConfidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {insp.gradingResult.needsHumanReview && !insp.humanReview?.reviewed && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateBatch}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Create New Produce Batch</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Product Commodity Picker */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Vegetable Commodity:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRODUCE_OPTIONS.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setSelectedProduct(prod.id)}
                      className={`p-2 rounded-xl border text-left flex items-center space-x-1.5 transition-all cursor-pointer ${
                        selectedProduct === prod.id
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">{prod.emoji}</span>
                      <span className="text-xs truncate">{prod.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Batch Name / Lot Identifier:
                </label>
                <input
                  type="text"
                  required
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder={`e.g. Lot #901 - ${getVeggieBadge(selectedProduct).name} Field Run`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  QA Inspector Name:
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Target Inspection Quantity:
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Harvest Lot Notes (Optional):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Field sector, grower code, weather conditions during harvest..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Creating...' : 'Initialize Batch'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
