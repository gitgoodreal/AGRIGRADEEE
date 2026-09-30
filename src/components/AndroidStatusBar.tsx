import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, SignalHigh } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-6 py-2 bg-slate-900/90 backdrop-blur-md text-xs font-mono text-slate-300 select-none border-b border-slate-800/60 z-30">
      <div className="font-semibold tracking-tight">{time || '09:41'}</div>
      
      {/* Front camera punch hole simulation on phone frame */}
      <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-emerald-900/80"></div>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-[10px] font-bold text-emerald-400">5G</span>
        <SignalHigh className="w-3.5 h-3.5 text-slate-300" />
        <Wifi className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center space-x-1">
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px]">98%</span>
        </div>
      </div>
    </div>
  );
};
