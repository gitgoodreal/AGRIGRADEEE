import React, { useState, useEffect } from 'react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidTopBar } from './components/AndroidTopBar';
import { AndroidSidebar, NavTab } from './components/AndroidSidebar';
import { AndroidNavBar } from './components/AndroidNavBar';
import { DashboardTab } from './components/DashboardTab';
import { InspectTab } from './components/InspectTab';
import { BatchesTab } from './components/BatchesTab';
import { VeggieRulesTab } from './components/VeggieRulesTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { ReportsTab } from './components/ReportsTab';
import { SettingsTab } from './components/SettingsTab';
import { HumanReviewModal } from './components/HumanReviewModal';
import { InspectionDetailModal } from './components/InspectionDetailModal';
import { VerificationScreen } from './components/VerificationScreen';
import { BatchRecord, BatchReport, InspectionRecord } from './types';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [activeBatch, setActiveBatch] = useState<BatchRecord | null>(null);
  const [reports, setReports] = useState<BatchReport[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Modals
  const [inspectDetailModal, setInspectDetailModal] = useState<InspectionRecord | null>(null);
  const [humanReviewModal, setHumanReviewModal] = useState<InspectionRecord | null>(null);

  // Verification Screen
  const [verificationReportId, setVerificationReportId] = useState<string | null>(null);

  // Device Frame View Toggle (Smartphone Frame vs Full Screen)
  const [useDeviceFrame, setUseDeviceFrame] = useState<boolean>(true);

  // Initial Data Fetch
  const loadData = async () => {
    try {
      // 1. Batches
      const batchesRes = await fetch('/api/batches');
      const batchesData = await batchesRes.json();
      if (batchesData.batches) {
        setBatches(batchesData.batches);
        setActiveBatch(batchesData.activeBatch || batchesData.batches[0] || null);
      }

      // 2. Inspections
      const inspRes = await fetch('/api/inspections');
      const inspData = await inspRes.json();
      if (inspData.inspections) {
        setInspections(inspData.inspections);
      }

      // 3. Reports
      const repRes = await fetch('/api/reports');
      const repData = await repRes.json();
      if (repData.reports) {
        setReports(repData.reports);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Check URL hash for direct QR code verification
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#verify/')) {
        const id = hash.replace('#verify/', '');
        setVerificationReportId(id);
      } else {
        setVerificationReportId(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Compute pending reviews count
  const pendingReviewsCount = inspections.filter(
    (i) => i.gradingResult.needsHumanReview && !i.humanReview?.reviewed
  ).length;

  const handleInspectionCompleted = (newRecord: InspectionRecord) => {
    setInspections((prev) => [newRecord, ...prev]);
    // Refresh batches to sync counters
    fetch('/api/batches')
      .then((res) => res.json())
      .then((data) => {
        if (data.batches) setBatches(data.batches);
        if (data.activeBatch) setActiveBatch(data.activeBatch);
      });
  };

  const handleReviewSubmitted = (updatedRecord: InspectionRecord) => {
    setInspections((prev) =>
      prev.map((i) => (i.id === updatedRecord.id ? updatedRecord : i))
    );
    // Refresh batches
    fetch('/api/batches')
      .then((res) => res.json())
      .then((data) => {
        if (data.batches) setBatches(data.batches);
        if (data.activeBatch) setActiveBatch(data.activeBatch);
      });
  };

  const handleGenerateReport = async (batchId: string) => {
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReports((prev) => [data.report, ...prev]);
        setActiveTab('reports');
      }
    } catch (err) {
      console.error('Report generation error:', err);
    }
  };

  const handleBatchActivated = (batchId: string) => {
    const found = batches.find((b) => b.id === batchId) || null;
    setActiveBatch(found);
  };

  const handleBatchClosed = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: 'closed' } : b))
    );
    if (activeBatch?.id === batchId) {
      setActiveBatch(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Device Switcher for Desktop Preview */}
      <div className="hidden sm:flex items-center space-x-3 mb-2.5 text-xs text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-sm">
        <span className="font-semibold text-slate-300">Android Preview:</span>
        <button
          onClick={() => setUseDeviceFrame(true)}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-colors cursor-pointer ${
            useDeviceFrame
              ? 'bg-emerald-600 text-white font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Phone Frame (Pixel 8)</span>
        </button>
        <button
          onClick={() => setUseDeviceFrame(false)}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-colors cursor-pointer ${
            !useDeviceFrame
              ? 'bg-emerald-600 text-white font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Screen</span>
        </button>
      </div>

      {/* Main Container: Authentic Android Smartphone Form Factor */}
      <div
        className={`w-full bg-slate-950 flex flex-col relative transition-all duration-300 overflow-hidden ${
          useDeviceFrame
            ? 'sm:max-w-[420px] sm:h-[860px] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:shadow-2xl sm:shadow-emerald-950/40'
            : 'max-w-xl h-screen sm:rounded-2xl border-x border-slate-800'
        }`}
      >
        {/* Verification View Route Check */}
        {verificationReportId ? (
          <div className="flex-1 flex flex-col h-full bg-slate-950">
            <AndroidStatusBar />
            <VerificationScreen
              reportId={verificationReportId}
              onBack={() => {
                window.location.hash = '';
                setVerificationReportId(null);
              }}
            />
          </div>
        ) : (
          /* Normal Android Mobile App View */
          <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
            {/* Slide-over Android Navigation Drawer (Sidebar) */}
            <AndroidSidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setIsDrawerOpen(false);
              }}
              pendingReviewCount={pendingReviewsCount}
              activeBatch={activeBatch}
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
            />

            {/* Android Status Bar (Time, Wifi, Battery, 5G) */}
            <AndroidStatusBar />

            {/* Android Top App Bar with Menu Button */}
            <AndroidTopBar
              title="AgriGrade"
              subtitle="Fresh Produce QA & Grading"
              activeBatch={activeBatch}
              pendingReviewsCount={pendingReviewsCount}
              onToggleSidebar={() => setIsDrawerOpen(true)}
              onOpenBatch={() => setActiveTab('batches')}
              onOpenReviews={() => {
                const pending = inspections.find(
                  (i) => i.gradingResult.needsHumanReview && !i.humanReview?.reviewed
                );
                if (pending) setHumanReviewModal(pending);
              }}
            />

            {/* Main Mobile Screen Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
              {activeTab === 'dashboard' && (
                <DashboardTab
                  inspections={inspections}
                  activeBatch={activeBatch}
                  pendingReviewsCount={pendingReviewsCount}
                  onNavigateToInspect={() => setActiveTab('inspect')}
                  onNavigateToBatches={() => setActiveTab('batches')}
                  onNavigateToReviews={() => {
                    const pending = inspections.find(
                      (i) => i.gradingResult.needsHumanReview && !i.humanReview?.reviewed
                    );
                    if (pending) setHumanReviewModal(pending);
                  }}
                  onSelectInspection={(insp) => setInspectDetailModal(insp)}
                />
              )}

              {activeTab === 'inspect' && (
                <InspectTab
                  activeBatch={activeBatch}
                  onInspectionCompleted={handleInspectionCompleted}
                  onRequestHumanReview={(record) => setHumanReviewModal(record)}
                />
              )}

              {activeTab === 'batches' && (
                <BatchesTab
                  batches={batches}
                  activeBatch={activeBatch}
                  inspections={inspections}
                  onBatchCreated={(newBatch) => {
                    setBatches((prev) => [newBatch, ...prev]);
                    setActiveBatch(newBatch);
                  }}
                  onBatchActivated={handleBatchActivated}
                  onBatchClosed={handleBatchClosed}
                  onSelectInspection={(insp) => setInspectDetailModal(insp)}
                  onGenerateReportForBatch={handleGenerateReport}
                />
              )}

              {/* 5+ Veggie Defect Rules Tab */}
              {activeTab === 'veggies' && <VeggieRulesTab />}

              {activeTab === 'analytics' && (
                <AnalyticsTab inspections={inspections} batches={batches} />
              )}

              {activeTab === 'reports' && (
                <ReportsTab
                  reports={reports}
                  batches={batches}
                  activeBatch={activeBatch}
                  onGenerateReport={handleGenerateReport}
                  onViewVerification={(reportId) => {
                    window.location.hash = `verify/${reportId}`;
                  }}
                />
              )}

              {activeTab === 'settings' && <SettingsTab />}
            </main>

            {/* Ergonomic Mobile Bottom Navigation Bar */}
            <AndroidNavBar
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              pendingReviewCount={pendingReviewsCount}
            />

            {/* Android Navigation Gesture Pill */}
            <div className="w-full bg-slate-900/90 py-1 flex justify-center items-center select-none border-t border-slate-800/40">
              <div className="w-24 h-1 bg-slate-700/60 rounded-full" />
            </div>
          </div>
        )}

        {/* Human Review Modal */}
        {humanReviewModal && (
          <HumanReviewModal
            inspection={humanReviewModal}
            onClose={() => setHumanReviewModal(null)}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}

        {/* Inspection Detail Modal */}
        {inspectDetailModal && (
          <InspectionDetailModal
            inspection={inspectDetailModal}
            onClose={() => setInspectDetailModal(null)}
            onRequestReview={(record) => setHumanReviewModal(record)}
          />
        )}
      </div>
    </div>
  );
}
