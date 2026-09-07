import React from 'react';
import { ParaglidingSite, LiveBeaconData } from '../types';
import { ZELEPH_SITES } from '../data/sitesData';
import { 
  Wind, 
  Compass, 
  MapPin, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  X, 
  ChevronRight,
  Sparkles,
  Gauge,
  Clock
} from 'lucide-react';

interface FlyableSitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  beacons: LiveBeaconData[];
  onSelectSite: (siteId: string) => void;
  onOpenWeatherRadar: (filter?: 'all' | 'optimal' | 'flyable') => void;
  onOpenSiteGuideFlyable: () => void;
}

export const FlyableSitesModal: React.FC<FlyableSitesModalProps> = ({
  isOpen,
  onClose,
  beacons,
  onSelectSite,
  onOpenWeatherRadar,
  onOpenSiteGuideFlyable
}) => {
  if (!isOpen) return null;

  // Find all flyable beacons & corresponding site details
  const flyableSites = ZELEPH_SITES.map(site => {
    const beacon = beacons.find(b => b.siteId === site.id);
    return { site, beacon };
  }).filter(({ beacon }) => beacon && (beacon.status === 'optimal' || beacon.status === 'moderate'));

  const optimalCount = flyableSites.filter(({ beacon }) => beacon?.status === 'optimal').length;
  const moderateCount = flyableSites.filter(({ beacon }) => beacon?.status === 'moderate').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 sm:p-8 border-b border-white/5 bg-slate-950/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-emerald-400">
                Bulletin Aérologique Temps Réel
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              Sites & Décollages <span className="font-bold text-emerald-400">Volables Aujourd'hui</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {flyableSites.length > 0 ? (
                <span>
                  <strong>{flyableSites.length} site(s)</strong> présentent actuellement des conditions de vent favorables d'après les balises ({optimalCount} optimal{optimalCount > 1 ? 's' : ''}, {moderateCount} avec prudence).
                </span>
              ) : (
                <span>Surveillance en temps réel des conditions de vol sur le bassin de Chambéry et les Bauges.</span>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 no-scrollbar">
          {/* AI & Algorithmic Notice Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-amber-500/25 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 uppercase">
                  Exemple - En cours de création
                </span>
                <strong className="text-white">Diagnostic indicatif</strong>
              </div>
              <p>
                Ces statuts sont calculés à titre d'exemple par croisement de modèles météo locaux (rappel : tous les sites n'ont pas de balise physique, comme à Vérel où les pilotes recoupent les balises des environs). <strong>Rien ne remplace votre propre analyse in situ.</strong>
              </p>
            </div>
          </div>

          {flyableSites.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-950/40 border border-white/5 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Aucun décollage en conditions idéales pour l'instant
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Le vent météo en altitude ou la brise en vallée dépassent les seuils de sécurité, ou l'orientation est sous le vent. Surveillez l'évolution de la restitution en fin de journée.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenWeatherRadar('all');
                }}
                className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition"
              >
                Voir toutes les balises météo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flyableSites.map(({ site, beacon }) => {
                if (!beacon) return null;
                const isOptimal = beacon.status === 'optimal';

                return (
                  <div
                    key={site.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                      isOptimal
                        ? 'bg-slate-950/60 border-emerald-500/30 hover:border-emerald-500/60'
                        : 'bg-slate-950/60 border-amber-500/30 hover:border-amber-500/60'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                              {site.massif}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {site.level}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                            {site.name}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            isOptimal
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {isOptimal ? 'Idéal • Décollable' : 'Vigilance'}
                        </span>
                      </div>

                      {/* Wind Telemetry Block */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-mono font-bold text-white">
                              {beacon.windSpeed}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">km/h</span>
                            <span className="text-xs text-slate-400 font-mono">
                              (raf. <strong className="text-slate-200">{beacon.gustSpeed}</strong> km/h)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400">
                            <Compass 
                              className="w-4 h-4 transition-transform" 
                              style={{ transform: `rotate(${beacon.windDirection}deg)` }}
                            />
                            <span>{beacon.windDirectionText} ({beacon.windDirection}°)</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
                          <span>Vent idéal : {site.idealWindMin}-{site.idealWindMax} km/h</span>
                          <span>Orientations : {site.orientations.join(', ')}</span>
                        </div>
                      </div>

                      {/* Flight Hours Recommendation */}
                      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs mb-3">
                        <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Horaires conseillés :</span>
                        </span>
                        <span className="font-mono font-bold text-amber-200">{site.recommendedHours}</span>
                      </div>

                      {/* Quick Aerology Advice */}
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                        {site.aerologyTips}
                      </p>
                    </div>

                    {/* Action Links */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectSite(site.id);
                        }}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition active:scale-95"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Fiche site & accès</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onOpenWeatherRadar('flyable');
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/5 transition"
                        title="Voir la balise météo temps réel"
                      >
                        <Wind className="w-3.5 h-3.5 text-sky-400" />
                        <span>Balise</span>
                      </button>

                      {site.webcamUrl && (
                        <a
                          href={site.webcamUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sky-300 text-xs font-medium border border-white/5 transition"
                          title="Ouvrir la webcam du site"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Webcam</span>
                          <ArrowUpRight className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 sm:p-6 border-t border-white/5 bg-slate-950/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-emerald-400">FFVL 143.9875 MHz</span>
            <span>•</span>
            <span className="font-mono text-sky-400">Club 146.500 MHz</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenSiteGuideFlyable();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/5 transition"
            >
              Filtrer le Guide des sites
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenWeatherRadar('flyable');
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30 transition"
            >
              Toutes les balises météo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
