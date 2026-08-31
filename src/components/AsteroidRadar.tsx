import React, { useState, useEffect } from 'react';
import { AsteroidNEO } from '../types';
import { fetchNasaAsteroids } from '../utils/nasaApi';
import { AlertTriangle, ShieldCheck, RefreshCw, Key, ExternalLink, Zap, Search, ArrowUpDown, Flame } from 'lucide-react';

interface AsteroidRadarProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  selectedDate: string;
}

export const AsteroidRadar: React.FC<AsteroidRadarProps> = ({
  apiKey,
  onApiKeyChange,
  selectedDate
}) => {
  const [asteroids, setAsteroids] = useState<AsteroidNEO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [filterHazardousOnly, setFilterHazardousOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'distance' | 'velocity' | 'diameter'>('distance');
  const [inputKey, setInputKey] = useState<string>(apiKey);

  const loadData = async (key: string, date: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchNasaAsteroids(key, date);
      setAsteroids(result.data);
      setIsDemo(result.isDemo);
      if (result.error) {
        setErrorMessage(result.error);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Błąd pobierania danych.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(apiKey, selectedDate);
  }, [apiKey, selectedDate]);

  const handleApplyKey = (e: React.FormEvent) => {
    e.preventDefault();
    onApiKeyChange(inputKey.trim() || 'DEMO_KEY');
  };

  // Filtrowanie i sortowanie
  const filteredAsteroids = asteroids
    .filter(a => !filterHazardousOnly || a.isPotentiallyHazardous)
    .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'distance') return a.missDistanceKm - b.missDistanceKm;
      if (sortBy === 'velocity') return b.velocityKms - a.velocityKms;
      if (sortBy === 'diameter') return b.avgDiameterM - a.avgDiameterM;
      return 0;
    });

  const hazardousCount = asteroids.filter(a => a.isPotentiallyHazardous).length;
  const closestAsteroid = [...asteroids].sort((a, b) => a.missDistanceKm - b.missDistanceKm)[0];
  const fastestAsteroid = [...asteroids].sort((a, b) => b.velocityKms - a.velocityKms)[0];

  return (
    <div className="space-y-6">
      {/* Konfiguracja API i metryki */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                NASA NeoWS API
              </span>
              {isDemo ? (
                <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  DEMO_KEY (Limit 30 zapytań/h)
                </span>
              ) : (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> WŁASNY KLUCZ AKTYWNY
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Radar Asteroid i Obiektów Bliskich Ziemi (NEO)
            </h2>
            <p className="text-xs text-slate-400">
              Pobieranie w czasie rzeczywistym trajektorii przelotów z bazy NASA JPL SSD na dzień <strong>{selectedDate}</strong>
            </p>
          </div>

          {/* Formularz klucza API */}
          <form onSubmit={handleApplyKey} className="flex items-center gap-2">
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Wpisz klucz NASA API lub DEMO_KEY"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 w-56 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 shrink-0"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Zastosuj'}
            </button>
            <button
              type="button"
              onClick={() => loadData(apiKey, selectedDate)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Odśwież dane"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </form>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center justify-between">
            <span>ℹ️ {errorMessage}</span>
            <a
              href="https://api.nasa.gov"
              target="_blank"
              rel="noreferrer"
              className="underline flex items-center gap-1 hover:text-white"
            >
              Wygeneruj darmowy klucz na api.nasa.gov <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Karty telemetryczne NEO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-mono">WSZYSTKIE PRZELOTY</div>
          <div className="text-2xl font-bold text-white mt-1">{asteroids.length} obiektów</div>
          <div className="text-xs text-slate-400 mt-0.5">Zarejestrowane na dzień dzisiejszy</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-mono">POTENCJALNIE NIEBEZPIECZNE (PHA)</div>
          <div className={`text-2xl font-bold mt-1 ${hazardousCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {hazardousCount} obiektów
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {hazardousCount > 0 ? 'Wymaga wzmożonego monitoringu' : 'Brak bezpośredniego zagrożenia'}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-mono">NAJBLIŻSZY PRZELOT</div>
          <div className="text-xl font-bold text-cyan-300 mt-1 truncate">
            {closestAsteroid ? `${closestAsteroid.missDistanceLD} LD` : '—'}
          </div>
          <div className="text-xs text-cyan-400/80 mt-0.5 font-mono">
            {closestAsteroid ? `${(closestAsteroid.missDistanceKm / 1e6).toFixed(2)} mln km (${closestAsteroid.name})` : ''}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-mono">REKORDOWA PRĘDKOŚĆ</div>
          <div className="text-xl font-bold text-amber-300 mt-1 truncate">
            {fastestAsteroid ? `${fastestAsteroid.velocityKms} km/s` : '—'}
          </div>
          <div className="text-xs text-amber-400/80 mt-0.5 font-mono">
            {fastestAsteroid ? `${fastestAsteroid.velocityKmh.toLocaleString('pl-PL')} km/h` : ''}
          </div>
        </div>
      </div>

      {/* Kontrolki filtrowania i tabela */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Szukaj asteroidy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 w-44 font-mono"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white transition select-none">
              <input
                type="checkbox"
                checked={filterHazardousOnly}
                onChange={(e) => setFilterHazardousOnly(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-rose-600 focus:ring-0 focus:ring-offset-0"
              />
              <span className="flex items-center gap-1 text-rose-300">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Tylko PHA (Zagrożenie)
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sortuj:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="distance">Odległość przelotu (od najbliższej)</option>
              <option value="velocity">Prędkość względna (od najszybszej)</option>
              <option value="diameter">Szacowana średnica (od największej)</option>
            </select>
          </div>
        </div>

        {/* Tabela obiektów NEO */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nazwa Asteroidy</th>
                <th className="py-3 px-4">Odległość [km]</th>
                <th className="py-3 px-4">Dystans Księżycowy [LD]</th>
                <th className="py-3 px-4">Prędkość [km/s]</th>
                <th className="py-3 px-4">Prędkość [km/h]</th>
                <th className="py-3 px-4">Średnica [m]</th>
                <th className="py-3 px-4">Klasyfikacja PHA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredAsteroids.map((ast) => (
                <tr key={ast.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-medium text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>{ast.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">
                    {ast.missDistanceKm.toLocaleString('pl-PL')} km
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${ast.missDistanceLD < 5 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-300'}`}>
                      {ast.missDistanceLD.toFixed(2)} LD
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-300 font-medium">
                    {ast.velocityKms.toFixed(2)} km/s
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {ast.velocityKmh.toLocaleString('pl-PL')}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    ~{ast.avgDiameterM} m ({ast.estimatedDiameterMinM}–{ast.estimatedDiameterMaxM} m)
                  </td>
                  <td className="py-3 px-4">
                    {ast.isPotentiallyHazardous ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-semibold animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Potencjalnie Niebezpieczna
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[11px]">
                        <ShieldCheck className="w-3 h-3" /> Bezpieczna
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>* 1 LD (Lunar Distance) = ok. 384 400 km (średnia odległość Ziemia - Księżyc).</span>
          <span className="font-mono text-slate-500">Źródło: NASA CNEOS / JPL SSD REST API</span>
        </div>
      </div>
    </div>
  );
};
