import React, { useState } from 'react';
import { ZELEPH_TOPOS } from '../data/hikeAndFlyData';
import { Mountain, Compass, Footprints, Calculator, ShieldCheck, ArrowRight, Clock, Award } from 'lucide-react';

export const TrotteEtVol: React.FC = () => {
  const [selectedTopoId, setSelectedTopoId] = useState<string>('nivolet-pragondran');

  // Calculator states
  const [calcDPlus, setCalcDPlus] = useState<number>(1000);
  const [calcVitesseAscension, setCalcVitesseAscension] = useState<number>(500); // m/h
  const [calcDistanceVolKm, setCalcDistanceVolKm] = useState<number>(5.2);
  const [calcDeniveleVolM, setCalcDeniveleVolM] = useState<number>(1050);

  const selectedTopo = ZELEPH_TOPOS.find(t => t.id === selectedTopoId) || ZELEPH_TOPOS[0];

  // Calculations
  const calculatedAscentHours = (calcDPlus / calcVitesseAscension);
  const ascentHours = Math.floor(calculatedAscentHours);
  const ascentMinutes = Math.round((calculatedAscentHours - ascentHours) * 60);

  // Finesse = distance / drop
  const calculatedFinesse = calcDeniveleVolM > 0 
    ? ((calcDistanceVolKm * 1000) / calcDeniveleVolM).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-sky-950 border border-emerald-900/40 p-5 sm:p-7 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1 rounded-full mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>L’esprit Zéleph : Trotte & Vol & Galope & Vol</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Rando-Vol & Trotte & Vol
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Le marche et vol est dans l'ADN des Z'éléphants Volants. Retrouvez ici les topos mythiques de la cluse de Chambéry et des Bauges, ainsi que le calculateur d'effort et de finesse pour vos ascensions.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <Mountain className="w-64 h-64 text-emerald-400" />
        </div>
      </div>

      {/* Topos Selection & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Topos List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Topos de Savoie
          </h2>
          <div className="space-y-2.5">
            {ZELEPH_TOPOS.map((topo) => {
              const isSelected = topo.id === selectedTopo.id;
              return (
                <div
                  key={topo.id}
                  onClick={() => setSelectedTopoId(topo.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition border ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{topo.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{topo.summit}</p>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                      D+ {topo.dPlus}m
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{topo.distanceKm} km • {Math.floor(topo.durationAscentMin / 60)}h{topo.durationAscentMin % 60}</span>
                    </div>
                    <div className="text-slate-300">
                      <span>Finesse {topo.finessePlan}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Topo Detail */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {selectedTopo.difficulty}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Finesse requise : {selectedTopo.finessePlan}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {selectedTopo.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {selectedTopo.description}
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 block">Dénivelé positif</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">+{selectedTopo.dPlus} m</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Distance marche</span>
                <span className="text-lg font-bold text-white font-mono">{selectedTopo.distanceKm} km</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Temps moyen</span>
                <span className="text-lg font-bold text-sky-400 font-mono">
                  {Math.floor(selectedTopo.durationAscentMin / 60)}h{selectedTopo.durationAscentMin % 60}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Finesse plané</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{selectedTopo.finessePlan}</span>
              </div>
            </div>

            {/* Itinerary Steps */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Itinéraire d'ascension
              </h4>
              <div className="space-y-2">
                {selectedTopo.itinerary.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Takeoff Advice */}
            <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-4 text-xs text-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
                <Compass className="w-4 h-4" />
                <span>Conseils Décollage & Atterrissage</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedTopo.takeoffTip}</p>
              <div className="mt-2 text-slate-400 text-[11px]">
                Atterrissage visé : <strong className="text-white">{selectedTopo.landingSpot}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Flight & Hike Calculator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Calculateur d'Ascension & de Finesse en Vol
            </h3>
            <p className="text-xs text-slate-400">
              Estimez votre temps de montée selon votre rythme et calculez si votre finesse suffit pour atteindre l'atterro sans vent de face.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hike Time Estimator */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Footprints className="w-4 h-4" />
              <span>1. Estimation Temps de Montée</span>
            </h4>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Dénivelé à gravir (D+)</span>
                <span className="font-mono font-bold text-white">{calcDPlus} m</span>
              </div>
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={calcDPlus}
                onChange={e => setCalcDPlus(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Vitesse ascensionnelle moyenne</span>
                <span className="font-mono font-bold text-white">{calcVitesseAscension} m/h</span>
              </div>
              <input
                type="range"
                min="300"
                max="1000"
                step="50"
                value={calcVitesseAscension}
                onChange={e => setCalcVitesseAscension(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Tranquille (350)</span>
                <span>Moyen (500)</span>
                <span>Trail (800+)</span>
              </div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">Temps estimé sac sur le dos :</span>
              <span className="text-2xl font-black text-sky-400 font-mono">
                {ascentHours}h {ascentMinutes}min
              </span>
            </div>
          </div>

          {/* Glide Ratio (Finesse) Estimator */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>2. Finesse Requise jusqu'à l'Atterrissage</span>
            </h4>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Distance horizontale sol</span>
                <span className="font-mono font-bold text-white">{calcDistanceVolKm} km</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.2"
                value={calcDistanceVolKm}
                onChange={e => setCalcDistanceVolKm(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Dénivelé entre déco et atterro</span>
                <span className="font-mono font-bold text-white">{calcDeniveleVolM} m</span>
              </div>
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={calcDeniveleVolM}
                onChange={e => setCalcDeniveleVolM(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">Finesse théorique (en air calme) :</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {calculatedFinesse}
                </span>
                <span className="text-xs text-slate-400">pour 1</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {Number(calculatedFinesse) <= 6.0 ? (
                  <span className="text-emerald-400 font-semibold">✓ Très confortable pour toute voile standard (EN-A / B)</span>
                ) : Number(calculatedFinesse) <= 8.5 ? (
                  <span className="text-amber-400 font-semibold">⚠ Attention en cas de brise de face ou de dégueulante</span>
                ) : (
                  <span className="text-rose-400 font-semibold">✕ Très engagé : requiert une voile performante et des thermiques</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
