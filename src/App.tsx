import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PlanetsVisibility } from './components/PlanetsVisibility';
import { AsteroidRadar } from './components/AsteroidRadar';
import { SkyDomeView } from './components/SkyDomeView';
import { PythonSourceViewer } from './components/PythonSourceViewer';
import { EngineeringNotes } from './components/EngineeringNotes';
import { calculateAllPlanets, getLST, CHORZOW_COORDS } from './utils/astronomy';
import { PlanetData } from './types';
import { Orbit, Compass, Target, FileCode, BookOpen, Sparkles, MapPin } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'planets' | 'asteroids' | 'skydome' | 'python' | 'notes'>('planets');
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [hourOffset, setHourOffset] = useState<number>(0);
  const [apiKey, setApiKey] = useState<string>('DEMO_KEY');

  // Skuteczny czas obserwacji z uwzględnieniem przesunięcia
  const effectiveDate = new Date(baseDate.getTime() + hourOffset * 3600 * 1000);
  const dateStr = effectiveDate.toISOString().split('T')[0];

  // Obliczenia astronomiczne
  const lstDeg = getLST(effectiveDate, CHORZOW_COORDS.lon);
  const [planets, setPlanets] = useState<PlanetData[]>(() => calculateAllPlanets(effectiveDate));

  // Zegar czasu rzeczywistego (aktualizacja co sekundę)
  useEffect(() => {
    const timer = setInterval(() => {
      setBaseDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Przeliczanie pozycji planet przy zmianie czasu lub offsetu
  useEffect(() => {
    const updated = calculateAllPlanets(effectiveDate);
    setPlanets(updated);
  }, [hourOffset, Math.floor(effectiveDate.getTime() / 60000)]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Nagłówek Obserwatorium */}
      <Header
        currentDate={effectiveDate}
        onDateChange={setBaseDate}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        lstDeg={lstDeg}
      />

      {/* Główna sekcja */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Baner Powitalny i Geometria Stacji Chorzów */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Planetarium – Śląski Park Nauki w Chorzowie
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Silesia Sky Tracker • Asystent Obserwatora
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                System telemetryczny i astrometryczny sprofilowany dla współrzędnych stacji bazowej w Parku Śląskim (<strong>50.2911° N, 18.9922° E</strong>, wys. 320 m n.p.m.). Przelicza współrzędne horyzontalne (Alt/Az) oraz monitoruje zbliżenia obiektów NEO z bazy NASA w czasie rzeczywistym.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right font-mono text-xs">
                <div className="text-slate-400 text-[10px]">OBIEKT BAZOWY</div>
                <div className="text-cyan-400 font-bold">Kopuła Główna 23m</div>
                <div className="text-slate-500 text-[10px]">Chorzów Park Nauki</div>
              </div>
            </div>
          </div>
        </div>

        {/* Zakładki Nawigacyjne */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('planets')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition shrink-0 ${
              activeTab === 'planets'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
            }`}
          >
            <Orbit className="w-4 h-4" />
            🪐 Widoczność Planet (Alt/Az)
          </button>

          <button
            onClick={() => setActiveTab('asteroids')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition shrink-0 ${
              activeTab === 'asteroids'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
            }`}
          >
            <Compass className="w-4 h-4" />
            ☄️ Radar Asteroid (NASA NeoWS)
          </button>

          <button
            onClick={() => setActiveTab('skydome')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition shrink-0 ${
              activeTab === 'skydome'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
            }`}
          >
            <Target className="w-4 h-4" />
            🎯 Sferyczna Kopuła Nieba
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition shrink-0 ${
              activeTab === 'python'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
            }`}
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            🐍 Kod Python & Streamlit (app.py)
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition shrink-0 ${
              activeTab === 'notes'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            📐 Noty Inżynierskie
          </button>
        </div>

        {/* Widoki Zakładek */}
        <div className="transition-all duration-200">
          {activeTab === 'planets' && (
            <PlanetsVisibility
              planets={planets}
              selectedDate={effectiveDate}
              hourOffset={hourOffset}
              onHourOffsetChange={setHourOffset}
            />
          )}

          {activeTab === 'asteroids' && (
            <AsteroidRadar
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              selectedDate={dateStr}
            />
          )}

          {activeTab === 'skydome' && (
            <SkyDomeView
              planets={planets}
              selectedDate={effectiveDate}
            />
          )}

          {activeTab === 'python' && (
            <PythonSourceViewer />
          )}

          {activeTab === 'notes' && (
            <EngineeringNotes />
          )}
        </div>
      </main>

      {/* Stopka Obserwatorium */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            🌌 <strong>Silesia Sky Tracker</strong> | Projekt dla <span className="text-slate-400">Planetarium – Śląskiego Parku Nauki</span> (Chorzów)
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            Współrzędne: 50.2911° N, 18.9922° E • Astrometry Core & Streamlit Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
