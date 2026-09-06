import React, { useState, useEffect } from 'react';
import { LiveBeaconData } from '../types';
import { ZELEPH_SITES } from '../data/sitesData';
import { 
  Wind, 
  RotateCw, 
  Thermometer, 
  Droplets, 
  Compass, 
  Gauge, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Sparkles,
  Info,
  Radio,
  Clock
} from 'lucide-react';

interface WeatherRadarProps {
  beacons: LiveBeaconData[];
  loading: boolean;
  onRefresh: () => void;
  onSelectSite: (siteId: string) => void;
  initialFilterStatus?: 'all' | 'optimal' | 'flyable';
}

export const WeatherRadar: React.FC<WeatherRadarProps> = ({
  beacons,
  loading,
  onRefresh,
  onSelectSite,
  initialFilterStatus = 'all'
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'optimal' | 'flyable'>(initialFilterStatus);

  useEffect(() => {
    if (initialFilterStatus) {
      setFilterStatus(initialFilterStatus);
    }
  }, [initialFilterStatus]);

  // Sorted sites by flyability status
  const sortedBeacons = [...beacons].sort((a, b) => {
    const score = (status: string) => status === 'optimal' ? 3 : status === 'moderate' ? 2 : 1;
    return score(b.status) - score(a.status);
  });

  const optimalCount = beacons.filter(b => b.status === 'optimal').length;
  const moderateCount = beacons.filter(b => b.status === 'moderate').length;

  const filteredBeacons = sortedBeacons.filter(b => {
    if (filterStatus === 'optimal') return b.status === 'optimal';
    if (filterStatus === 'flyable') return b.status === 'optimal' || b.status === 'moderate';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">
              Télémétrie Balises FFVL & OpenData
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Balises Météo <span className="font-bold text-sky-400">Temps Réel</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Vitesse du vent, rafales et orientation en direct sur les crêtes des Bauges, de l'Épine et de Belledonne.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-xl shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Actualisation...' : 'Actualiser'}</span>
          </button>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Strategic AI & Algorithmic Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 text-xs text-amber-200 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="leading-snug">
            <strong className="text-amber-300">Analyse automatisée & IA :</strong> Les diagnostics de volabilité (« Sécu OK », « Vigilance ») sont des estimations algorithmiques indicatives. <strong>Rien ne remplace votre propre analyse</strong> et votre observation directe sur le terrain.
          </p>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 text-[10px] font-mono whitespace-nowrap">
          Pilote commandant de bord
        </span>
      </div>

      {/* Flyability Quick Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterStatus(filterStatus === 'optimal' ? 'all' : 'optimal')}
          className={`p-6 rounded-3xl border backdrop-blur-md cursor-pointer transition-all ${
            filterStatus === 'optimal' 
              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30' 
              : 'bg-slate-900/40 border-white/5 hover:border-emerald-500/40 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Conditions Idéales</span>
            <span className="text-emerald-400 text-xs font-bold px-2 py-0.5 bg-emerald-400/10 rounded border border-emerald-400/20">
              SÉCU OK
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-mono font-bold text-emerald-400">{optimalCount}</span>
            <span className="text-xs text-slate-400">site(s) prêt(s) à décoller</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-emerald-400 transition-all duration-500" 
              style={{ width: `${(optimalCount / Math.max(beacons.length, 1)) * 100}%` }}
            />
          </div>
        </div>

        <div 
          onClick={() => setFilterStatus(filterStatus === 'flyable' ? 'all' : 'flyable')}
          className={`p-6 rounded-3xl border backdrop-blur-md cursor-pointer transition-all ${
            filterStatus === 'flyable' 
              ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30' 
              : 'bg-slate-900/40 border-white/5 hover:border-amber-500/40 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Volable avec Prudence</span>
            <span className="text-amber-400 text-xs font-bold px-2 py-0.5 bg-amber-400/10 rounded border border-amber-400/20">
              VIGILANCE
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-mono font-bold text-amber-400">{moderateCount}</span>
            <span className="text-xs text-slate-400">site(s) plus techniques</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-amber-400 transition-all duration-500" 
              style={{ width: `${(moderateCount / Math.max(beacons.length, 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Fréquences Radio Club & FFVL</span>
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          </div>
          <div className="my-2 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-medium">Club Zéléph :</span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-sky-400">
                146.500 <span className="text-xs text-slate-400 font-mono">MHz</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-medium">Sécu & Balises :</span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
                143.9875 <span className="text-xs text-slate-400 font-mono">MHz</span>
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-white/5">
            <span className="text-sky-300/80">Liaisons vol & navettes</span>
            <span className="font-mono text-emerald-400/90">Urgence fédérale</span>
          </div>
        </div>
      </div>

      {/* Live Beacons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBeacons.map((beacon) => {
          const site = ZELEPH_SITES.find(s => s.id === beacon.siteId);
          const windPercent = Math.min(Math.round((beacon.windSpeed / 35) * 100), 100);

          return (
            <div
              key={beacon.siteId}
              className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all flex flex-col justify-between shadow-xl group"
            >
              {/* Site Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400 block mb-0.5">
                      {site ? site.massif : 'Savoie'}
                    </span>
                    <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-sky-300 transition">
                      {beacon.siteName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {site ? `Déco ${site.takeoffAlt}m • D- ${site.elevationDiff}m` : ''}
                    </p>
                    {site && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-mono mt-1">
                        <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Conseillé : {site.recommendedHours}</span>
                      </div>
                    )}
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider ${
                    beacon.status === 'optimal'
                      ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                      : beacon.status === 'moderate'
                      ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                      : 'bg-rose-400/10 text-rose-400 border border-rose-400/30'
                  }`}>
                    {beacon.status === 'optimal' ? 'Volable' : beacon.status === 'moderate' ? 'Prudence' : 'Dangereux'}
                  </span>
                </div>

                {/* Wind Telemetry Cockpit Panel */}
                <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Vent Actuel</span>
                    <span className="text-[11px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {beacon.windDirectionText} ({beacon.windDirectionDeg}°)
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    {/* Compass Radar */}
                    <div className="relative w-16 h-16 rounded-full border border-slate-700/80 bg-slate-900/80 flex items-center justify-center shrink-0 shadow-inner">
                      <span className="absolute top-1 text-[7px] font-mono font-bold text-slate-500">N</span>
                      <span className="absolute bottom-1 text-[7px] font-mono font-bold text-slate-500">S</span>
                      <span className="absolute left-1 text-[7px] font-mono font-bold text-slate-500">O</span>
                      <span className="absolute right-1 text-[7px] font-mono font-bold text-slate-500">E</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>

                      <div 
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out pointer-events-none"
                        style={{ transform: `rotate(${beacon.windDirectionDeg}deg)` }}
                      >
                        <div className="w-1 h-7 bg-gradient-to-t from-transparent via-sky-400 to-sky-300 rounded-full shadow-lg shadow-sky-400/50" />
                      </div>
                    </div>

                    {/* Wind Numbers */}
                    <div className="flex-1 text-right">
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-4xl sm:text-5xl font-mono font-bold text-white">
                          {beacon.windSpeed}
                        </span>
                        <span className="text-xs font-mono text-slate-400 font-bold">km/h</span>
                      </div>
                      <div className="text-xs font-mono text-amber-400 mt-0.5">
                        Rafales : <span className="font-bold">{beacon.windGusts} km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Wind Gauge Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          beacon.status === 'optimal' 
                            ? 'bg-emerald-400' 
                            : beacon.status === 'moderate' 
                            ? 'bg-amber-400' 
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${windPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>0</span>
                      <span>15 (Calme)</span>
                      <span>25 (Fort)</span>
                      <span>35+</span>
                    </div>
                  </div>
                </div>

                {/* Status Advice */}
                <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 text-xs text-slate-300 leading-relaxed mb-4">
                  {beacon.statusReason}
                </div>

                {/* Secondary Telemetry */}
                <div className="space-y-2 py-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-light flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                      <span>Température Déco</span>
                    </span>
                    <span className="text-white font-mono font-bold">{beacon.temperature}°C</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/5"></div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-light flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" />
                      <span>Humidité Relative</span>
                    </span>
                    <span className="text-white font-mono font-bold">{beacon.relativeHumidity}%</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/5"></div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-light flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pression Atmo</span>
                    </span>
                    <span className="text-white font-mono font-bold">{beacon.pressure} hPa</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500">MaJ : {beacon.lastUpdated}</span>
                <button
                  onClick={() => onSelectSite(beacon.siteId)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-sky-500/20 text-sky-400 font-bold transition flex items-center gap-1 text-[11px]"
                >
                  <span>Fiche site</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
