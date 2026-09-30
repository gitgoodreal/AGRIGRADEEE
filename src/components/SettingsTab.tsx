import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RotateCcw,
  CheckCircle,
  Shield,
  Layers,
  Award,
  BookOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { GradingRuleConfig } from '../types';

export const SettingsTab: React.FC = () => {
  const [rules, setRules] = useState<GradingRuleConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/grading-rules')
      .then((res) => res.json())
      .then((data) => {
        if (data.rules) setRules(data.rules);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load rules:', err);
        setLoading(false);
      });
  }, []);

  const handleSaveRules = async () => {
    if (!rules) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/grading-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save rules:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetRules = async () => {
    try {
      const res = await fetch('/api/grading-rules/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('Failed to reset rules:', err);
    }
  };

  const allCommodities = [
    { id: 'tomato', name: 'Tomato', scientific: 'Solanum lycopersicum', emoji: '🍅', status: 'Active' },
    { id: 'bell_pepper', name: 'Bell Pepper', scientific: 'Capsicum annuum', emoji: '🫑', status: 'Active' },
    { id: 'potato', name: 'Potato', scientific: 'Solanum tuberosum', emoji: '🥔', status: 'Active' },
    { id: 'carrot', name: 'Carrot', scientific: 'Daucus carota', emoji: '🥕', status: 'Active' },
    { id: 'onion', name: 'Onion', scientific: 'Allium cepa', emoji: '🧅', status: 'Active' },
    { id: 'cucumber', name: 'Cucumber', scientific: 'Cucumis sativus', emoji: '🥒', status: 'Active' },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 text-xs">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-slate-100">Quality Engine Configuration</h2>
        <p className="text-[11px] text-slate-400">
          Configure grading thresholds, inspection tolerances, and active vegetable modules
        </p>
      </div>

      {/* Configurable Grading Thresholds */}
      {rules && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Grading Engine Tolerances</span>
            </h3>
            <button
              onClick={handleResetRules}
              className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Minimum Confidence Slider */}
          <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex justify-between font-medium">
              <span className="text-slate-300">Min Automatic Confidence Threshold:</span>
              <span className="font-mono font-bold text-emerald-400">
                {Math.round(rules.minConfidenceThreshold * 100)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Scans with AI observation confidence below this value trigger Human Review before final grading.
            </p>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={rules.minConfidenceThreshold}
              onChange={(e) =>
                setRules({
                  ...rules,
                  minConfidenceThreshold: parseFloat(e.target.value),
                })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Grade A minor defects tolerance */}
          <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex justify-between font-medium">
              <span className="text-slate-300">Grade A Max Minor Defects Allowed:</span>
              <span className="font-mono font-bold text-emerald-400">
                {rules.gradeA.maxMinorDefects}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={rules.gradeA.maxMinorDefects}
              onChange={(e) =>
                setRules({
                  ...rules,
                  gradeA: {
                    ...rules.gradeA,
                    maxMinorDefects: parseInt(e.target.value, 10),
                  },
                })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-1">
            {savedSuccess ? (
              <span className="text-emerald-400 text-xs font-semibold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Rules updated successfully</span>
              </span>
            ) : (
              <span />
            )}
            <button
              onClick={handleSaveRules}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {saving ? 'Updating...' : 'Save Parameters'}
            </button>
          </div>
        </div>
      )}

      {/* Produce Classification Standards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm">
        <h3 className="font-bold text-slate-200 flex items-center space-x-1.5">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Universal Commercial Grading Tiers</span>
        </h3>

        <div className="space-y-2">
          {/* Grade A */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-xs">Grade A (Premium Retail Market)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                Top Commercial
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Proper varietal characteristics, uniform shape symmetry, crisp/firm texture. Clean surface with zero wet soft rot, bacterial decay, deep open cracks, or unhealed punctures. Maximum 1 minor superficial blemish permitted.
            </p>
          </div>

          {/* Grade B */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-xs">Grade B (Processing / Commercial)</span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono">
                Secondary Tier
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Fairly well-shaped specimens suitable for industrial slicing, canning, dicing, or food service. Tolerates minor cosmetic scarring, slight shape curvature, or superficial scabbing covering less than 5% surface area.
            </p>
          </div>

          {/* Reject */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 text-xs">Cull / Reject (Quarantined)</span>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono">
                Non-Compliant
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Any specimen with active soft rot, bacterial leakage, sunken fungal craters, deep unhealed tears, severe deformity, or pest penetration. Strictly separated from commercial shipping containers.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Crop Module Active Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Active Commodity Modules ({allCommodities.length})</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-400">USDA Compliant</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {allCommodities.map((c) => (
            <div
              key={c.id}
              className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">{c.emoji}</span>
                <div>
                  <div className="font-bold text-slate-200 text-xs">{c.name}</div>
                  <div className="text-[9px] text-slate-500 font-mono italic truncate max-w-[90px]">
                    {c.scientific}
                  </div>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold font-mono">
                ONLINE
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
