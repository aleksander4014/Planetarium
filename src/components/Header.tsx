import React from 'react';
import { Telescope, Compass, MapPin, Clock, Radio, Key } from 'lucide-react';
import { CHORZOW_COORDS } from '../utils/astronomy';

interface HeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  lstDeg: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  apiKey,
  onApiKeyChange,
  lstDeg
}) => {
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatLST = (deg: number) => {
    const hours = deg / 15;
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo i Tytuł */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
              <Telescope className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Park Śląski • Chorzów
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE TELEMETRIA
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Silesia Sky Tracker
                <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  v1.0 Streamlit & ASTRO-CORE
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Interaktywny Asystent Obserwatora dla <span className="text-cyan-300 font-medium">{CHORZOW_COORDS.name}</span>
              </p>
            </div>
          </div>

          {/* Dane telemetryczne obserwatorium */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <div className="text-slate-400 text-[10px]">WSPÓŁRZĘDNE KOPUŁY</div>
                <div className="text-slate-200 font-medium">{CHORZOW_COORDS.lat}° N, {CHORZOW_COORDS.lon}° E</div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <div className="text-slate-400 text-[10px]">CZAS GWIAZDOWY (LST)</div>
                <div className="text-amber-300 font-medium">{formatLST(lstDeg)}</div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <div>
                <div className="text-slate-400 text-[10px]">CZAS LOKALNY</div>
                <div className="text-slate-200 font-medium">{formatTime(currentDate)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
