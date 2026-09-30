import React from 'react';
import {
  Home,
  Camera,
  Layers,
  BarChart2,
  FileText,
  Settings,
  X,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BatchRecord } from '../types';

export type NavTab =
  | 'dashboard'
  | 'inspect'
  | 'batches'
  | 'veggies'
  | 'analytics'
  | 'reports'
  | 'settings';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingReviewCount?: number;
  activeBatch: BatchRecord | null;
  isOpen: boolean;
  onClose: () => void;
  isDocked?: boolean;
}

export const AndroidSidebar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  pendingReviewCount = 0,
  activeBatch,
  isOpen,
  onClose,
  isDocked = false,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: Home },
    { id: 'inspect' as NavTab, label: 'Inspect Quality', icon: Camera, highlight: true },
    { id: 'batches' as NavTab, label: 'Harvest Batches', icon: Layers },
    { id: 'veggies' as NavTab, label: 'Veggies & Defect Rules', icon: BookOpen, badge: '6 Crops' },
    { id: 'analytics' as NavTab, label: 'Defect Analytics', icon: BarChart2 },
    { id: 'reports' as NavTab, label: 'Certificates & QR', icon: FileText },
    { id: 'settings' as NavTab, label: 'Grading Parameters', icon: Settings },
  ];

  const content = (
    <div className="h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none w-72 max-w-[85vw] shadow-2xl">
      {/* Top Header */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 text-xl shrink-0">
              🌱
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm text-slate-100 tracking-tight">
                  AgriGrade
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold border border-emerald-800">
                  Mobile
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Agricultural QA Vision
              </p>
            </div>
          </div>

          {!isDocked && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Veggie Commodity Quick Pills */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 px-1">
            <span>Commodity Standards</span>
            <span className="text-emerald-400 font-mono">USDA / Global</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'potato', name: 'Potato', emoji: '🥔' },
              { id: 'tomato', name: 'Tomato', emoji: '🍅' },
              { id: 'onion', name: 'Onion', emoji: '🧅' },
              { id: 'carrot', name: 'Carrot', emoji: '🥕' },
              { id: 'bell_pepper', name: 'Pepper', emoji: '🫑' },
              { id: 'cucumber', name: 'Cucumber', emoji: '🥒' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  onTabChange('veggies');
                  if (!isDocked) onClose();
                }}
                className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 flex items-center space-x-1 transition-colors cursor-pointer justify-center"
              >
                <span>{v.emoji}</span>
                <span className="truncate">{v.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 py-1">
            Navigation Menu
          </div>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  if (!isDocked) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <IconComponent
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : tab.highlight ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs truncate">{tab.label}</span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {tab.id === 'dashboard' && pendingReviewCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 shadow-sm animate-pulse">
                      {pendingReviewCount}
                    </span>
                  )}
                  {tab.badge && !isActive && (
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[9px] font-mono text-emerald-400 border border-slate-700">
                      {tab.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-emerald-200" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 space-y-2.5 bg-slate-950/70">
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Active Batch</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="font-bold text-slate-200 truncate">
            {activeBatch ? activeBatch.name : 'No Active Batch'}
          </p>
          {activeBatch && (
            <p className="text-[10px] text-slate-400 font-mono">
              {activeBatch.totalInspected} items scanned
            </p>
          )}
        </div>

        <div className="px-1 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>AgriGrade Mobile QA</span>
          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Ready</span>
          </span>
        </div>
      </div>
    </div>
  );

  // If docked on tablet/desktop:
  if (isDocked) {
    return <aside className="h-full z-30 shrink-0">{content}</aside>;
  }

  // Mobile Slide-over Drawer with Backdrop:
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Sliding Drawer */}
      <div className="relative z-10 h-full animate-in slide-in-from-left duration-250 ease-out">
        {content}
      </div>
    </div>
  );
};
