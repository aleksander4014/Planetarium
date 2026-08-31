import React, { useState } from 'react';
import { PlanetData } from '../types';
import { Compass, Target, Info, Sparkles } from 'lucide-react';
import { CHORZOW_COORDS } from '../utils/astronomy';

interface SkyDomeViewProps {
  planets: PlanetData[];
  selectedDate: Date;
}

export const SkyDomeView: React.FC<SkyDomeViewProps> = ({ planets, selectedDate }) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null);

  // Rozmiary projekcji polarnej
  const size = 500;
  const center = size / 2;
  const radius = size / 2 - 40; // promień horyzontu

  /**
   * Konwersja współrzędnych sferycznych (Alt, Az) na płaszczyznę projekcji zenitalnej:
   * r = radius * (90 - Alt) / 90  (gdzie Alt=90 to środek, Alt=0 to brzeg horyzontu)
   * kąt: Azymut liczony zgodnie z ruchem wskazówek zegara od Północy (N = góra)
   */
  const getCoordinates = (alt: number, az: number) => {
    // Jeśli ciało pod horyzontem, rzutujemy na obrzeże lub ignorujemy
    const zenithAngle = Math.max(0, 90 - alt);
    const r = (zenithAngle / 90) * radius;
    
    // Kąt w układzie kartezjańskim: N (0°) to kąt -90° (góra)
    const angleRad = (az - 90) * (Math.PI / 180);
    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);

    return { x, y, r };
  };

  const visiblePlanets = planets.filter(p => p.isVisible);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sferyczna Kopuła Nieba */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Sferyczna Projekcja Horyzontalna (Alt-Az)
            </h2>
            <p className="text-xs text-slate-400">
              Rzut zenitalny kopuły Planetarium Śląskiego ({CHORZOW_COORDS.lat}° N, {CHORZOW_COORDS.lon}° E)
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-300">
            Kopuła 360°
          </span>
        </div>

        <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full select-none"
          >
            {/* Tło kopuły nieba */}
            <defs>
              <radialGradient id="skyGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#082f49" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#0f172a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#020617" stopOpacity="1" />
              </radialGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Koło horyzontu (obszar widoczny) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="url(#skyGradient)"
              stroke="#0284c7"
              strokeWidth="2"
              className="drop-shadow-lg"
            />

            {/* Pierścienie wysokości (Altitudes: 30°, 60°) */}
            <circle
              cx={center}
              cy={center}
              r={radius * (60 / 90)}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text x={center + 5} y={center - radius * (60 / 90) + 12} fill="#64748b" fontSize="10" fontFamily="monospace">
              Alt 30°
            </text>

            <circle
              cx={center}
              cy={center}
              r={radius * (30 / 90)}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text x={center + 5} y={center - radius * (30 / 90) + 12} fill="#64748b" fontSize="10" fontFamily="monospace">
              Alt 60°
            </text>

            {/* Linie siatki azymutalnej (Kierunki świata i pośrednie) */}
            {/* N-S */}
            <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#1e293b" strokeWidth="1.5" />
            {/* E-W */}
            <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#1e293b" strokeWidth="1.5" />
            {/* NE-SW */}
            <line
              x1={center - radius * 0.707}
              y1={center - radius * 0.707}
              x2={center + radius * 0.707}
              y2={center + radius * 0.707}
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            {/* NW-SE */}
            <line
              x1={center - radius * 0.707}
              y1={center + radius * 0.707}
              x2={center + radius * 0.707}
              y2={center - radius * 0.707}
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray="2 4"
            />

            {/* Punkt Zenitu (Alt = 90°) */}
            <circle cx={center} cy={center} r="3" fill="#38bdf8" />
            <text x={center + 6} y={center - 4} fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
              ZENIT (90°)
            </text>

            {/* Oznaczenia kierunków świata */}
            <text x={center} y={center - radius - 12} fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
              N (0°)
            </text>
            <text x={center + radius + 18} y={center + 4} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
              E (90°)
            </text>
            <text x={center} y={center + radius + 22} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
              S (180°)
            </text>
            <text x={center - radius - 18} y={center + 4} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
              W (270°)
            </text>

            {/* Rysowanie ciał niebieskich nad horyzontem */}
            {visiblePlanets.map((planet) => {
              const { x, y } = getCoordinates(planet.alt, planet.az);
              const isHovered = hoveredPlanet?.name === planet.name;

              return (
                <g
                  key={planet.name}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredPlanet(planet)}
                  onMouseLeave={() => setHoveredPlanet(null)}
                >
                  {/* Poświata przy najechaniu */}
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill={planet.color}
                      opacity="0.3"
                      filter="url(#glow)"
                    />
                  )}

                  {/* Punkt planety */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "8" : "6"}
                    fill={planet.color}
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="transition-all"
                  />

                  {/* Etykieta planety */}
                  <text
                    x={x}
                    y={y - 10}
                    fill={isHovered ? "#38bdf8" : "#f1f5f9"}
                    fontSize={isHovered ? "12" : "10"}
                    fontWeight={isHovered ? "bold" : "600"}
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow"
                  >
                    {planet.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Panel boczny z detalami wybranego / najechany obiektu */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Inspektor Teleskopowy</h3>
          </div>

          {hoveredPlanet ? (
            <div className="space-y-4 bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full inline-block"
                    style={{ backgroundColor: hoveredPlanet.color }}
                  ></span>
                  <span className="text-lg font-bold text-white">{hoveredPlanet.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono">
                  Nad horyzontem
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Wysokość (Alt)</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">+{hoveredPlanet.alt.toFixed(2)}°</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Azymut (Az)</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">{hoveredPlanet.az.toFixed(2)}° ({hoveredPlanet.direction})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Rektascensja (RA)</span>
                  <span className="text-slate-200 font-mono">{hoveredPlanet.ra}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Deklinacja (Dec)</span>
                  <span className="text-slate-200 font-mono">{hoveredPlanet.dec}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Jasność widoma</span>
                  <span className="text-amber-300 font-mono">{hoveredPlanet.magnitude > 0 ? `+${hoveredPlanet.magnitude}` : hoveredPlanet.magnitude} mag</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Odległość geo.</span>
                  <span className="text-slate-200 font-mono">{hoveredPlanet.distanceAU} AU</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <Compass className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-spin-slow" />
              <p className="text-xs text-slate-400">
                Najedź kursorem na planetę na radarze, aby odczytać precyzyjne kąty nastawy dla serwomotorów montażu teleskopu.
              </p>
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Legenda Kopuły:
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Środek = Zenit (dokładnie 90° nad głową)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                <span>Zewnętrzny okrąg = Horyzont (Alt = 0°)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Północ (N) = góra wykresu (Az = 0°)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-lg text-xs text-cyan-300">
          📍 <strong>Stacja bazowa:</strong> Wzgórze w Parku Śląskim (320 m n.p.m.). Brak przeszkód terenowych w sektorze południowo-wschodnim.
        </div>
      </div>
    </div>
  );
};
