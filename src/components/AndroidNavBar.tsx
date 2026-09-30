import React from 'react';
import { Home, Camera, Layers, BookOpen, FileText } from 'lucide-react';
import { NavTab } from './AndroidSidebar';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingReviewCount?: number;
}

export const AndroidNavBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  pendingReviewCount = 0,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Home', icon: Home },
    { id: 'batches' as NavTab, label: 'Batches', icon: Layers },
    { id: 'inspect' as NavTab, label: 'Inspect', icon: Camera, primary: true },
    { id: 'veggies' as NavTab, label: 'Veggies', icon: BookOpen },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
  ];

  return (
    <nav className="w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1 flex items-center justify-around z-30 select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;

        if (tab.primary) {
          // Prominent center primary action for Inspect/Camera
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative -top-3 group flex flex-col items-center justify-center focus:outline-none cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-tr from-emerald-500 to-green-600 text-white shadow-emerald-950/80 scale-105 ring-2 ring-emerald-400/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
                }`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <span
                className={`text-[10px] mt-0.5 font-bold tracking-tight ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="group relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 focus:outline-none cursor-pointer"
          >
            {/* Material 3 active pill background */}
            <div
              className={`relative px-3.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                isActive
                  ? 'bg-emerald-600/30 text-emerald-400 font-semibold'
                  : 'text-slate-400 group-hover:text-slate-200'
              }`}
            >
              <IconComponent
                className={`w-4 h-4 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-emerald-400' : 'group-hover:scale-105'
                }`}
              />

              {/* Pending reviews indicator badge on Home */}
              {tab.id === 'dashboard' && pendingReviewCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 shadow-sm animate-pulse">
                  {pendingReviewCount}
                </span>
              )}
            </div>

            <span
              className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors duration-200 ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
