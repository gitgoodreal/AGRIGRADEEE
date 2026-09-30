import React, { useState } from 'react';
import {
  VEGETABLE_STANDARDS,
  VegetableStandard,
  VegetableDefect,
} from '../data/vegetableStandards';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Thermometer,
  Droplets,
  Clock,
  CheckCircle2,
  ChevronRight,
  Info,
  BookOpen,
  Filter,
  Sparkles,
} from 'lucide-react';

export const VeggieRulesTab: React.FC = () => {
  const veggieKeys = Object.keys(VEGETABLE_STANDARDS);
  const [selectedVeggieId, setSelectedVeggieId] = useState<string>('tomato');
  const [activeDefectFilter, setActiveDefectFilter] = useState<string>('all');
  const [expandedDefectId, setExpandedDefectId] = useState<string | null>(null);

  const currentVeggie: VegetableStandard = VEGETABLE_STANDARDS[selectedVeggieId] || VEGETABLE_STANDARDS['tomato'];

  const filteredDefects = currentVeggie.defects.filter((d) => {
    if (activeDefectFilter === 'all') return true;
    return d.category === activeDefectFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xl">🥗</span>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Vegetable Defect & Grading Rules</h2>
            <p className="text-[11px] text-slate-400">
              Official USDA & Commercial Quality Standards for 6 Fresh Commodities
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Vegetable Selector Scrollbar */}
      <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {veggieKeys.map((key) => {
          const v = VEGETABLE_STANDARDS[key];
          const isSelected = selectedVeggieId === key;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedVeggieId(key);
                setExpandedDefectId(null);
                setActiveDefectFilter('all');
              }}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl shrink-0 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/60 scale-[1.02]'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span className="text-lg leading-none">{v.emoji}</span>
              <div className="text-left">
                <span className="block text-xs font-bold leading-tight">{v.name}</span>
                <span
                  className={`block text-[9px] font-mono leading-tight ${
                    isSelected ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  USDA Standard
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Commodity Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-3xl">{currentVeggie.emoji}</span>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center space-x-1.5">
                <span>{currentVeggie.name}</span>
                <span className="text-xs font-mono text-slate-400 font-normal italic">
                  ({currentVeggie.scientificName})
                </span>
              </h3>
              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                Standard: {currentVeggie.usdaStandardCode}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono shrink-0">
            {currentVeggie.family}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          {currentVeggie.overview}
        </p>

        {/* Postharvest Storage Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-2xl space-y-1">
            <div className="flex items-center justify-center space-x-1 text-slate-400 text-[10px]">
              <Thermometer className="w-3 h-3 text-cyan-400" />
              <span>Temp</span>
            </div>
            <p className="font-mono font-bold text-slate-200 text-[11px]">
              {currentVeggie.idealStorage.temperature}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-2xl space-y-1">
            <div className="flex items-center justify-center space-x-1 text-slate-400 text-[10px]">
              <Droplets className="w-3 h-3 text-blue-400" />
              <span>Humidity</span>
            </div>
            <p className="font-mono font-bold text-slate-200 text-[11px]">
              {currentVeggie.idealStorage.humidity}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-2xl space-y-1">
            <div className="flex items-center justify-center space-x-1 text-slate-400 text-[10px]">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Shelf Life</span>
            </div>
            <p className="font-mono font-bold text-slate-200 text-[11px] truncate">
              {currentVeggie.idealStorage.shelfLife}
            </p>
          </div>
        </div>
      </div>

      {/* Grade Specification Breakdown (Grade A vs B vs Reject) */}
      <div className="space-y-2.5">
        <h3 className="font-bold text-slate-200 flex items-center space-x-1.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Grading Specification Tiers</span>
        </h3>

        {/* Grade A Card */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/50 rounded-2xl p-3.5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="text-xs font-bold text-emerald-300">
                {currentVeggie.gradingSpec.gradeA.title}
              </strong>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
              {currentVeggie.gradingSpec.gradeA.marketName}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {currentVeggie.gradingSpec.gradeA.summary}
          </p>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
            <span className="font-semibold text-emerald-400 block text-[10px] uppercase tracking-wider">
              Allowances & Tolerances:
            </span>
            <ul className="space-y-0.5 text-slate-300">
              {currentVeggie.gradingSpec.gradeA.tolerances.map((tol, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-emerald-400 shrink-0 font-bold">•</span>
                  <span>{tol}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Grade B Card */}
        <div className="bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-500/40 rounded-2xl p-3.5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <strong className="text-xs font-bold text-amber-300">
                {currentVeggie.gradingSpec.gradeB.title}
              </strong>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-mono">
              {currentVeggie.gradingSpec.gradeB.marketName}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {currentVeggie.gradingSpec.gradeB.summary}
          </p>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
            <span className="font-semibold text-amber-400 block text-[10px] uppercase tracking-wider">
              Commercial Processing Tolerances:
            </span>
            <ul className="space-y-0.5 text-slate-300">
              {currentVeggie.gradingSpec.gradeB.tolerances.map((tol, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-amber-400 shrink-0 font-bold">•</span>
                  <span>{tol}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reject Card */}
        <div className="bg-gradient-to-br from-rose-950/60 to-slate-900 border border-rose-500/40 rounded-2xl p-3.5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <strong className="text-xs font-bold text-rose-300">
                {currentVeggie.gradingSpec.reject.title}
              </strong>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-mono">
              {currentVeggie.gradingSpec.reject.marketName}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {currentVeggie.gradingSpec.reject.summary}
          </p>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
            <span className="font-semibold text-rose-400 block text-[10px] uppercase tracking-wider">
              Mandatory Disqualification Conditions:
            </span>
            <ul className="space-y-0.5 text-slate-300">
              {currentVeggie.gradingSpec.reject.disqualifiers.map((disq, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{disq}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Defect Taxonomy Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 flex items-center space-x-1.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Defect Taxonomy & Symptoms ({filteredDefects.length})</span>
          </h3>

          {/* Category Filter Pills */}
          <div className="flex space-x-1">
            {['all', 'biological', 'physiological', 'environmental'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveDefectFilter(cat)}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  activeDefectFilter === cat
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Defect Cards List */}
        <div className="space-y-2.5">
          {filteredDefects.map((defect) => {
            const isExpanded = expandedDefectId === defect.id;
            return (
              <div
                key={defect.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-200"
              >
                {/* Defect Header Bar */}
                <button
                  onClick={() => setExpandedDefectId(isExpanded ? null : defect.id)}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-7 h-7 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 text-amber-400 font-bold text-xs">
                      ⚠️
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-100 truncate">
                        {defect.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {defect.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[9px] font-mono uppercase">
                      {defect.category}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-emerald-400' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3.5 bg-slate-950/80 border-t border-slate-800/80 space-y-3 text-[11px]">
                    <div>
                      <span className="font-semibold text-slate-300 block text-[10px] uppercase tracking-wider">
                        Visible Physical Symptoms:
                      </span>
                      <p className="text-slate-300 mt-0.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                        {defect.visibleSymptoms}
                      </p>
                    </div>

                    {/* Severity Grid */}
                    <div className="space-y-1.5">
                      <span className="font-semibold text-slate-300 block text-[10px] uppercase tracking-wider">
                        Standard Severity Criteria:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">
                            Minor
                          </span>
                          <p className="text-[10px] text-slate-300">
                            {defect.severityLevels.minor}
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-amber-400 block mb-0.5">
                            Moderate
                          </span>
                          <p className="text-[10px] text-slate-300">
                            {defect.severityLevels.moderate}
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-bold text-rose-400 block mb-0.5">
                            Severe
                          </span>
                          <p className="text-[10px] text-slate-300">
                            {defect.severityLevels.severe}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Inspection Method & Impact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Inspection Protocol:
                        </span>
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          {defect.inspectionMethod}
                        </p>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Commercial Market Impact:
                        </span>
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          {defect.marketImpact}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Inspection Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm">
        <h3 className="font-bold text-slate-200 flex items-center space-x-1.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{currentVeggie.name} QA Inspector Checklist</span>
        </h3>

        <div className="space-y-2">
          {currentVeggie.inspectionSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-200 leading-snug">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
