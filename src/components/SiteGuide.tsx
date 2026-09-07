import React, { useState, useMemo } from 'react';
import { ZELEPH_SITES } from '../data/sitesData';
import { ParaglidingSite, ClubMemberProfile } from '../types';
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
  ShieldAlert,
  Edit3,
  RotateCcw,
  Sparkles,
  Check,
  Calendar,
  UserCheck,
  Wind
} from 'lucide-react';
import { EditSiteModal } from './EditSiteModal';
import { isZelephMember } from '../utils/authUtils';
import { 
  getSiteOverridesMap, 
  saveSiteOverride, 
  resetSiteOverride 
} from '../utils/storageService';

interface SiteGuideProps {
  selectedSiteId?: string;
  onSelectSite?: (siteId: string) => void;
  currentUser?: ClubMemberProfile | null;
  onRequireMemberAuth?: (reason: string) => void;
}

export const SiteGuide: React.FC<SiteGuideProps> = ({ 
  selectedSiteId: controlledSiteId,
  onSelectSite,
  currentUser,
  onRequireMemberAuth
}) => {
  const [internalSiteId, setInternalSiteId] = useState<string>('verel');
  const [filterMassif, setFilterMassif] = useState<string>('all');

  // Overrides stored in storageService
  const [siteOverrides, setSiteOverrides] = useState<Record<string, ParaglidingSite>>(() => {
    return getSiteOverridesMap();
  });

  // Modal & Toast states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [siteToReset, setSiteToReset] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Merge default sites with custom overrides
  const sites = useMemo(() => {
    return ZELEPH_SITES.map(s => {
      if (siteOverrides[s.id]) {
        return { ...s, ...siteOverrides[s.id] };
      }
      return s;
    });
  }, [siteOverrides]);

  const activeSiteId = controlledSiteId || internalSiteId;
  const handleSelectSite = (siteId: string) => {
    setInternalSiteId(siteId);
    if (onSelectSite) onSelectSite(siteId);
  };

  const selectedSite = sites.find(s => s.id === activeSiteId) || sites[0];
  const isSelectedSiteCustomized = Boolean(siteOverrides[selectedSite.id]);

  const massifs = ['all', 'Bauges', 'Combe de Savoie', 'Avant-Pays Savoyard'];

  const filteredSites = sites.filter(s => {
    if (filterMassif === 'all') return true;
    return s.massif === filterMassif;
  });

  // Save updated site
  const handleSaveSite = (updatedSite: ParaglidingSite) => {
    saveSiteOverride(updatedSite);
    setSiteOverrides(prev => ({ ...prev, [updatedSite.id]: updatedSite }));
    showToast(`La fiche du site "${updatedSite.name}" a été mise à jour avec succès !`);
  };

  // Reset site to club default
  const handleResetSite = (siteId: string) => {
    resetSiteOverride(siteId);
    setSiteOverrides(prev => {
      const next = { ...prev };
      delete next[siteId];
      return next;
    });
    showToast(`La fiche du site a été réinitialisée aux informations d'origine.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Introduction banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3">
            <span>Massifs de Savoie • Lac du Bourget • Bauges</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
                Guide des Sites & <span className="font-bold text-sky-400">Décollages Club</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                Fiches techniques officielles des sites de décollage et atterrissage de Savoie gérés ou fréquentés par les Z’éléphants Volants. Accès, aérologie, finesses requises, restrictions et webcams.
              </p>
            </div>

            <button
              onClick={() => {
                if (!isZelephMember(currentUser)) {
                  if (onRequireMemberAuth) {
                    onRequireMemberAuth("La modification des fiches de site est réservée aux pilotes connectés avec un compte Google.");
                  } else {
                    showToast("Connectez-vous avec Google pour modifier une fiche.");
                  }
                  return;
                }
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-sky-500/20 shrink-0 active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Modifier la fiche site</span>
            </button>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-5 pointer-events-none">
          <Compass className="w-72 h-72 text-sky-400" />
        </div>
      </div>

      {/* Massif Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest pl-1">Massif :</span>
        
        {massifs.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMassif(m)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
              filterMassif === m
                ? 'bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20'
                : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {m === 'all' ? 'Tous les sites' : m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Sites List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {filteredSites.length} site{filteredSites.length > 1 ? 's' : ''} répertorié{filteredSites.length > 1 ? 's' : ''}
            </span>
            {Object.keys(siteOverrides).length > 0 && (
              <span className="text-[10px] font-mono text-sky-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{Object.keys(siteOverrides).length} fiche(s) actualisée(s)</span>
              </span>
            )}
          </div>

          {filteredSites.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-white/5 space-y-2">
              <Compass className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Aucun site ne correspond aux critères sélectionnés.</p>
              <button
                onClick={() => setFilterMassif('all')}
                className="text-xs text-sky-400 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSites.map((site) => {
                const isSelected = site.id === selectedSite.id;
                const isCustomized = Boolean(siteOverrides[site.id]);

                return (
                  <div
                    key={site.id}
                    onClick={() => handleSelectSite(site.id)}
                    className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all border text-left relative overflow-hidden group ${
                      isSelected
                        ? 'bg-slate-900/90 border-sky-500/60 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500/30'
                        : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/5 text-slate-400">
                            {site.massif}
                          </span>
                          {isCustomized && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Infos à jour</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-sky-300 transition-colors">
                          {site.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {site.subTitle}
                        </p>
                      </div>

                      {/* Site Altitude Pill */}
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          {site.takeoffAlt}m
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          Décollage
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                        <span>Dénivelé : {site.elevationDiff}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-slate-300">{site.orientations.join(' ')}</span>
                      </div>
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {selectedSite.massif}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-white/5 text-slate-300 border border-white/5">
                    Niveau : {selectedSite.level}
                  </span>

                  {isSelectedSiteCustomized && (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Fiche actualisée</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!isZelephMember(currentUser)) {
                        if (onRequireMemberAuth) {
                          onRequireMemberAuth("La modification des fiches de site est réservée aux membres connectés avec Discord (statut minimum : Membre Z'éléph).");
                        } else {
                          setToastMessage("Action réservée aux membres Zéléph connectés.");
                          setTimeout(() => setToastMessage(null), 3500);
                        }
                        return;
                      }
                      setIsEditModalOpen(true);
                    }}
                    className={`p-2 rounded-xl transition text-xs font-semibold flex items-center gap-1.5 ${
                      isZelephMember(currentUser)
                        ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-white border border-sky-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-700'
                    }`}
                    title={isZelephMember(currentUser) ? "Modifier les informations de cette fiche de site" : "Mode Visiteur : connectez-vous avec Discord (Membre Z'éléph) pour modifier la fiche"}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Modifier la fiche</span>
                  </button>

                  {isSelectedSiteCustomized && isZelephMember(currentUser) && (
                    <button
                      onClick={() => setSiteToReset(selectedSite.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 transition text-xs"
                      title="Rétablir les informations par défaut du club"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
                {selectedSite.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {selectedSite.subTitle}
              </p>

              {/* Updated information banner if edited */}
              {isSelectedSiteCustomized && (
                <div className="mt-3 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    <div>
                      <span className="font-bold text-white">Infos adaptées pour la saison en cours</span>
                      {selectedSite.updatedBy && (
                        <span className="text-[11px] text-slate-400 block">Dernière mise à jour par : {selectedSite.updatedBy}</span>
                      )}
                    </div>
                  </div>
                  {selectedSite.lastUpdatedDate && (
                    <span className="text-[11px] text-sky-300 font-mono shrink-0">
                      {selectedSite.lastUpdatedDate}
                    </span>
                  )}
                </div>
              )}
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

              {selectedSite.bestTimeSlots && selectedSite.bestTimeSlots.length > 0 && (
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
              )}
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

      {/* Edit Site Modal */}
      <EditSiteModal
        site={selectedSite}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveSite}
        onResetToDefault={handleResetSite}
        isCustomized={isSelectedSiteCustomized}
        currentUser={currentUser}
      />

      {/* In-App Reset Confirmation Modal */}
      {siteToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center border border-amber-500/30">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rétablir la fiche d'origine</h3>
                <span className="text-[11px] text-slate-400">Restitution des données club de base</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Voulez-vous réinitialiser la fiche du site <strong className="text-white">« {selectedSite.name} »</strong> aux informations officielles du club ? Toutes les modifications saisonnières personnalisées seront effacées.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSiteToReset(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetSite(siteToReset);
                  setSiteToReset(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rétablir les données club</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
