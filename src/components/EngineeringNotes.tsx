import React from 'react';
import { Cpu, Orbit, Compass, Calculator, Layers, Award } from 'lucide-react';
import { CHORZOW_COORDS } from '../utils/astronomy';

export const EngineeringNotes: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-cyan-950 border border-cyan-800/60 rounded-xl text-cyan-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Noty Techniczne: Astrometria i Automatyka w Planetarium Śląskim
            </h2>
            <p className="text-xs text-slate-400">
              Dokumentacja założeń inżynierskich, geometrii sferycznej i układów sterowania
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-2">
              <Calculator className="w-4 h-4" />
              1. Transformacja Sferyczna (RA/Dec ➔ Alt/Az)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Obliczenia realizują układ równań trygonometrii sferycznej w trójkącie paralaktycznym:
            </p>
            <div className="my-2 p-2.5 bg-slate-900 rounded font-mono text-[11px] text-cyan-300 border border-slate-800 space-y-1">
              <div>sin(Alt) = sin(φ)·sin(δ) + cos(φ)·cos(δ)·cos(H)</div>
              <div>cos(Az) = (sin(δ) - sin(φ)·sin(Alt)) / (cos(φ)·cos(Alt))</div>
            </div>
            <p className="text-[11px] text-slate-400">
              gdzie: φ = 50.2911° (szerokość Chorzowa), δ = deklinacja, H = kąt godzinny (LST - RA).
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
              <Cpu className="w-4 h-4" />
              2. Zastosowanie w Sterownikach Napędów (PLC / PID)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kąty horyzontalne <strong>Wysokości (Alt)</strong> i <strong>Azymutu (Az)</strong> stanowią bezpośrednie sygnały zadane dla pozycjonowania serwonapędów w montażach azymutalnych kopuły obserwacyjnej.
            </p>
            <div className="mt-2 text-[11px] text-slate-400 space-y-1">
              <div>• Korekcja refrakcji atmosferycznej przy horyzoncie</div>
              <div>• Kompensacja ruchu dobowego Ziemi (15.04107° / godzinę)</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Orbit className="w-4 h-4" />
            3. Integracja z NASA JPL SSD (Small-Body Database & NeoWS)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            API NASA NeoWS dostarcza precyzyjne wektory stanu i parametry zbliżenia obiektów NEO. Aplikacja parsuje dystans orbitalny przeliczając go na jednostki astronomiczne (AU), kilometry oraz dystanse księżycowe (Lunar Distances, LD = 384 400 km), klasyfikując ryzyko kolizyjne dla obiektów o średnicy powyżej 140 m przecinających orbitę Ziemi (klasyfikacja PHA - Potentially Hazardous Asteroids).
          </p>
        </div>
      </div>
    </div>
  );
};
