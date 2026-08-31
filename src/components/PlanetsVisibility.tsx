import React, { useState } from 'react';
import { PlanetData } from '../types';
import { Eye, EyeOff, Compass, ArrowUpRight, Sparkles, SlidersHorizontal, Info } from 'lucide-react';

interface PlanetsVisibilityProps {
  planets: PlanetData[];
  selectedDate: Date;
  onHourOffsetChange: (offsetHours: number) => void;
  hourOffset: number;
}

export const PlanetsVisibility: React.FC<PlanetsVisibilityProps> = ({
  planets,
  selectedDate,
  onHourOffsetChange,
  hourOffset
}) => {
  const [filterVisibleOnly, setFilterVisibleOnly] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  const visiblePlanets = planets.filter(p => !filterVisibleOnly || p.isVisible);
  const visibleCount = planets.filter(p => p.isVisible).length;
  const highestPlanet = [...planets].sort((a, b) => b.alt - a.alt)[0];

  return (
    <div className="space-y-6">
      {/* Pasek podsumowujący i kontroler czasu obserwacji */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">ŚLEDZONE OBIEKTY</div>
            <div className="text-2xl font-bold text-white mt-1">{planets.length} ciał</div>
            <div className="text-xs text-slate-400 mt-0.5">Układ Słoneczny + Księżyc</div>
          </div>
          <div className="p-3 bg-cyan-950/60 border border-cyan-800/40 rounded-xl text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">AKTUALNIE NAD HORYZONTEM</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{visibleCount} obiektów</div>
            <div className="text-xs text-emerald-500/80 mt-0.5">Widoczne z Planetarium Śląskiego</div>
          </div>
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-xl text-emerald-400">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">NAJWYŻEJ NA NIEBIE</div>
            <div className="text-xl font-bold text-amber-300 mt-1 truncate max-w-[180px]">
              {highestPlanet?.name || "Brak"}
            </div>
            <div className="text-xs text-amber-400/80 mt-0.5 font-mono">
              Wysokość (Alt): {highestPlanet?.alt > 0 ? `+${highestPlanet.alt}°` : `${highestPlanet?.alt}°`}
            </div>
          </div>
          <div className="p-3 bg-amber-950/60 border border-amber-800/40 rounded-xl text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Symulator pory nocy */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">
              Symulator pory obserwacji (Przesunięcie czasu):
            </span>
            <span className="font-mono text-sm px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {hourOffset >= 0 ? `+${hourOffset}h` : `${hourOffset}h`} ({selectedDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onHourOffsetChange(0)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Teraz
            </button>
            <button
              onClick={() => onHourOffsetChange(4)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Północ (+4h)
            </button>
            <button
              onClick={() => onHourOffsetChange(8)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Nad ranem (+8h)
            </button>
          </div>
        </div>

        <input
          type="range"
          min="-12"
          max="12"
          step="0.5"
          value={hourOffset}
          onChange={(e) => onHourOffsetChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
          <span>-12h (Wczoraj)</span>
          <span>Aktualny czas (0h)</span>
          <span>+12h (Jutro)</span>
        </div>
      </div>

      {/* Filtr i Tabela ciał niebieskich */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Pozycje Planetarne (Współrzędne Horyzontalne Alt/Az)
            </h2>
            <p className="text-xs text-slate-400">
              Współrzędne zaktualizowane dla stacji: Planetarium Śląskie (50.2911° N, 18.9922° E)
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white transition select-none">
            <input
              type="checkbox"
              checked={filterVisibleOnly}
              onChange={(e) => setFilterVisibleOnly(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0 focus:ring-offset-0"
            />
            <span>Pokaż tylko widoczne (Alt &gt; 0°)</span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Obiekt</th>
                <th className="py-3 px-4">Wysokość (Alt)</th>
                <th className="py-3 px-4">Azymut (Az)</th>
                <th className="py-3 px-4">Kierunek</th>
                <th className="py-3 px-4">Rektascensja (RA)</th>
                <th className="py-3 px-4">Deklinacja (Dec)</th>
                <th className="py-3 px-4">Jasność (Mag)</th>
                <th className="py-3 px-4">Status Obserwacji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {visiblePlanets.map((planet) => {
                const isAboveHorizon = planet.isVisible;
                return (
                  <tr
                    key={planet.name}
                    onClick={() => setSelectedPlanet(planet)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                        style={{ backgroundColor: planet.color }}
                      ></span>
                      <span className="font-semibold group-hover:text-cyan-300 transition">
                        {planet.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`font-semibold ${isAboveHorizon ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {planet.alt >= 0 ? `+${planet.alt.toFixed(2)}°` : `${planet.alt.toFixed(2)}°`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300">
                      {planet.az.toFixed(2)}°
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-medium border border-slate-700">
                        {planet.direction}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{planet.ra}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{planet.dec}</td>
                    <td className="py-3 px-4 font-mono text-amber-300">{planet.magnitude > 0 ? `+${planet.magnitude}` : planet.magnitude}</td>
                    <td className="py-3 px-4">
                      {isAboveHorizon ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[11px] font-medium">
                          <Eye className="w-3 h-3" /> Nad horyzontem
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800 text-[11px]">
                          <EyeOff className="w-3 h-3" /> Pod horyzontem
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Wskazówka sterowania teleskopem */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-cyan-300">Aplikacja w automatyce napędów kopuły: </span> 
            Współrzędne horyzontalne <strong>Wysokość (Altitude)</strong> i <strong>Azymut (Azimuth)</strong> odpowiadają bezpośrednim kątom nastawy dla montażu Alt-Az. 
            W przypadku montażu paralaktycznego w Planetarium Śląskim stosowana jest rektascensja (RA) i kąt godzinny z uwzględnieniem czasu gwiazdowego (LST).
          </div>
        </div>
      </div>
    </div>
  );
};
