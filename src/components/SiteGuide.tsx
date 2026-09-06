import React, { useState } from 'react';
import { ZELEPH_SITES } from '../data/sitesData';
import { ParaglidingSite, LiveBeaconData } from '../types';
import { 
  Compass, 
  ArrowUpRight, 
  AlertTriangle, 
  Navigation, 
  ExternalLink, 
  Camera, 
  Layers, 
  Gauge,
  Info,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface SiteGuideProps {
  beacons: LiveBeaconData[];
  onSelectBeaconTab: (siteId: string) => void;
  selectedSiteId?: string;
  onSelectSite?: (siteId: string) => void;
  initialFilterFlyable?: boolean;
}

export const SiteGuide: React.FC<SiteGuideProps> = ({ 
  beacons, 
  onSelectBeaconTab,
  selectedSiteId: controlledSiteId,
  onSelectSite,
  initialFilterFlyable = false
}) => {
  const [internalSiteId, setInternalSiteId] = useState<string>('verel');
  const [filterMassif, setFilterMassif] = useState<string>(initialFilterFlyable ? 'flyable' : 'all');

  const activeSiteId = controlledSiteId || internalSiteId;
  const handleSelectSite = (siteId: string) => {
    setInternalSiteId(siteId);
    if (onSelectSite) onSelectSite(siteId);
  };

  const selectedSite = ZELEPH_SITES.find(s => s.id === activeSiteId) || ZELEPH_SITES[0];
  const siteBeacon = beacons.find(b => b.siteId === selectedSite.id);

  const massifs = ['all', 'Bauges', 'Combe de Savoie', 'Avant-Pays Savoyard'];

  const flyableCount = beacons.filter(b => b.status === 'optimal' || b.status === 'moderate').length;

  const filteredSites = ZELEPH_SITES.filter(s => {
    if (filterMassif === 'all') return true;
    if (filterMassif === 'flyable') {
      const b = beacons.find(beacon => beacon.siteId === s.id);
      return b && (b.status === 'optimal' || b.status === 'moderate');
    }
    return s.massif === filterMassif;
  });

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3">
            <span>Massifs de Savoie • Lac du Bourget • Bauges</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
            Guide des Sites & <span className="font-bold text-sky-400">Décollages Club</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            Fiches techniques des sites gérés et fréquentés par le club autour du bassin chambérien, de la cluse de Savoie et du Lac du Bourget. Consignes de vol, aérologie et espace aérien.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-5 pointer-events-none">
          <Compass className="w-72 h-72 text-sky-400" />
        </div>
      </div>

      {/* Massif & Flyability Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest pl-1">Filtre :</span>
        
        {/* Flyable live filter button */}
        <button
          onClick={() => setFilterMassif(filterMassif === 'flyable' ? 'all' : 'flyable')}
          className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
            filterMassif === 'flyable'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${filterMassif === 'flyable' ? 'bg-slate-950' : 'bg-emerald-400 animate-pulse'}`} />
          <span>Volables en direct ({flyableCount})</span>
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        {massifs.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMassif(m)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
              filterMassif === m
                ? 'bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20'
                : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {m === 'all' ? `Tous les sites (${ZELEPH_SITES.length})` : m}
          </button>
        ))}
      </div>

      {/* Sites Quick Grid & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Sites List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {filterMassif === 'flyable' ? 'Sites praticables aujourd’hui' : 'Sélectionnez un site'}
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              {filteredSites.length} site(s)
            </span>
          </div>

          {filteredSites.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400">
              Aucun site ne correspond actuellement à ce filtre.
              <button 
                onClick={() => setFilterMassif('all')}
                className="block mx-auto mt-2 text-sky-400 hover:underline font-semibold"
              >
                Afficher tous les sites
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSites.map((site) => {
                const isSelected = site.id === selectedSite.id;
                const live = beacons.find(b => b.siteId === site.id);
                return (
                  <div
                    key={site.id}
                    id={`site-card-${site.id}`}
                    onClick={() => handleSelectSite(site.id)}
                  className={`p-5 rounded-3xl cursor-pointer transition-all border backdrop-blur-md ${
                    isSelected
                      ? 'bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-sky-400/80 ring-1 ring-sky-400/30 shadow-xl shadow-sky-950/50'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base tracking-tight">{site.name}</h3>
                        <span className="text-[10px] font-mono font-bold bg-white/5 text-sky-400 border border-white/5 px-2 py-0.5 rounded-full">
                          {site.massif}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{site.subTitle}</p>
                    </div>
                    {live && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        live.status === 'optimal' 
                          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                          : live.status === 'moderate'
                          ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                          : 'bg-rose-400/10 text-rose-400 border border-rose-400/30'
                      }`}>
                        {live.windSpeed} km/h {live.windDirectionText}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      <span>Déco <strong className="font-mono text-slate-300">{site.takeoffAlt}m</strong> • D- <strong className="font-mono text-slate-300">{site.elevationDiff}m</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300 font-mono text-xs">
                      <span>Finesse {site.finesseRequired}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-amber-300/90 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Créneau : <strong className="text-amber-200">{site.recommendedHours}</strong></span>
                    </div>
                    {site.id === 'montlambert' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Abrité en Nord
                      </span>
                    )}
                    {site.id === 'verel' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        + Nord-Ouest
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Right Side: Selected Site In-depth View */}
        <div className="lg:col-span-7">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-28">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {selectedSite.massif}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-white/5 text-slate-300 border border-white/5">
                    Niveau : {selectedSite.level}
                  </span>
                </div>
                {siteBeacon && (
                  <button
                    onClick={() => onSelectBeaconTab(selectedSite.id)}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition font-medium"
                  >
                    <span>Voir balise en direct</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
                {selectedSite.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {selectedSite.subTitle}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Altitude Déco</span>
                <span className="text-xl font-mono font-bold text-white">{selectedSite.takeoffAlt} m</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Altitude Atterro</span>
                <span className="text-xl font-mono font-bold text-white">{selectedSite.landingAlt} m</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Dénivelé utile</span>
                <span className="text-xl font-mono font-bold text-sky-400">{selectedSite.elevationDiff} m</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Finesse requise</span>
                <span className="text-xl font-mono font-bold text-amber-400">{selectedSite.finesseRequired}</span>
              </div>
            </div>

            {/* Wind & Orientations Banner */}
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Orientations Favorables</span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {selectedSite.orientations.map(ori => (
                      <span 
                        key={ori} 
                        className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-300 font-mono font-bold text-xs border border-sky-500/20"
                      >
                        {ori}
                      </span>
                    ))}
                    {selectedSite.id === 'montlambert' && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-mono font-semibold text-[11px] border border-amber-500/30 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Abrité en Nord (vigilance)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs">
                <span className="text-slate-400 block font-semibold uppercase tracking-wider">Régime de vent idéal</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {selectedSite.idealWindMin} à {selectedSite.idealWindMax} km/h
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">Max rafales : {selectedSite.maxSafeGust} km/h</span>
              </div>
            </div>

            {/* Recommended Flight Hours & Time Windows */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-amber-500/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Horaires de vol recommandés</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs">
                  Plage optimale : {selectedSite.recommendedHours}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {selectedSite.bestTimeSlots.map((slot, idx) => (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      slot.isOptimal 
                        ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm' 
                        : 'bg-slate-950/60 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-xs text-white">
                        {slot.period}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        slot.isOptimal ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/10 text-slate-300 border border-white/5'
                      }`}>
                        {slot.hours}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {slot.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description & Aerology */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Présentation du site
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedSite.description}
                </p>
              </div>

              <div className="bg-sky-500/10 backdrop-blur-md border border-sky-500/20 rounded-2xl p-4 text-xs text-sky-200 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-sky-400 mb-1.5">
                  <Info className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Aérologie & Brise de vallée</span>
                </div>
                {selectedSite.aerologyTips}
              </div>
            </div>

            {/* Hazards & Vigilance */}
            <div className="bg-rose-500/10 backdrop-blur-md border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="uppercase tracking-wider">Points de vigilance & Pièges aérologiques</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                {selectedSite.hazards.map((hazard, idx) => (
                  <li key={idx}>{hazard}</li>
                ))}
              </ul>
            </div>

            {/* AI & Local synthesis disclaimer */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center gap-2.5 text-[11px] text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Rappel de sécurité : Les fiches, horaires et indices de volabilité sont des synthèses d'aide à la décision. Rien ne remplace l'analyse personnelle in situ du pilote et son jugement souverain.</span>
            </div>

            {/* Airspace Reminder */}
            {selectedSite.airspaceWarning && (
              <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-200">
                <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
                  <Gauge className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Espace Aérien & CTR Chambéry LFLB</span>
                </div>
                <p className="text-slate-300">{selectedSite.airspaceWarning}</p>
              </div>
            )}

            {/* Access info */}
            <div className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
              <span className="font-bold text-slate-200 block mb-1 uppercase tracking-wider text-[10px]">Accès & Montée :</span>
              {selectedSite.accessInfo}
            </div>

            {/* Action Buttons: GPS, Webcams */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSite.lat},${selectedSite.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/5 transition"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>GPS Décollage</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSite.landingLat},${selectedSite.landingLng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/5 transition"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>GPS Atterrissage</span>
              </a>

              {selectedSite.webcamUrl ? (
                <a
                  href={selectedSite.webcamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition"
                >
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  <span>Webcam live</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900/40 text-slate-600 text-xs font-semibold cursor-not-allowed border border-white/5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Pas de webcam</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
