import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  MapPin, 
  Compass, 
  Wind, 
  AlertTriangle, 
  Navigation, 
  Camera, 
  Clock, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Layers,
  Sparkles,
  User
} from 'lucide-react';
import { ParaglidingSite, WindDirection, ClubMemberProfile } from '../types';

const ALL_ORIENTATIONS: WindDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

interface EditSiteModalProps {
  site: ParaglidingSite;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSite: ParaglidingSite) => void;
  onResetToDefault?: (siteId: string) => void;
  isCustomized?: boolean;
  currentUser?: ClubMemberProfile | null;
}

export const EditSiteModal: React.FC<EditSiteModalProps> = ({
  site,
  isOpen,
  onClose,
  onSave,
  onResetToDefault,
  isCustomized,
  currentUser
}) => {
  const [name, setName] = useState(site.name);
  const [subTitle, setSubTitle] = useState(site.subTitle);
  const [massif, setMassif] = useState(site.massif);
  const [level, setLevel] = useState(site.level);
  
  const [takeoffAlt, setTakeoffAlt] = useState(site.takeoffAlt);
  const [landingAlt, setLandingAlt] = useState(site.landingAlt);
  const [elevationDiff, setElevationDiff] = useState(site.elevationDiff);
  const [finesseRequired, setFinesseRequired] = useState(site.finesseRequired);
  
  const [orientations, setOrientations] = useState<WindDirection[]>(site.orientations);
  const [idealWindMin, setIdealWindMin] = useState(site.idealWindMin);
  const [idealWindMax, setIdealWindMax] = useState(site.idealWindMax);
  const [maxSafeGust, setMaxSafeGust] = useState(site.maxSafeGust);
  const [recommendedHours, setRecommendedHours] = useState(site.recommendedHours);
  
  const [description, setDescription] = useState(site.description);
  const [aerologyTips, setAerologyTips] = useState(site.aerologyTips);
  const [hazards, setHazards] = useState<string[]>(site.hazards || []);
  const [accessInfo, setAccessInfo] = useState(site.accessInfo);
  const [airspaceWarning, setAirspaceWarning] = useState(site.airspaceWarning || '');
  
  const [lat, setLat] = useState(site.lat);
  const [lng, setLng] = useState(site.lng);
  const [landingLat, setLandingLat] = useState(site.landingLat);
  const [landingLng, setLandingLng] = useState(site.landingLng);
  const [webcamUrl, setWebcamUrl] = useState(site.webcamUrl || '');
  const [updaterName, setUpdaterName] = useState('');

  const [activeTab, setActiveTab] = useState<'general' | 'aero' | 'access' | 'gps'>('general');

  // Reset form with site when opened
  useEffect(() => {
    if (isOpen) {
      setName(site.name);
      setSubTitle(site.subTitle);
      setMassif(site.massif);
      setLevel(site.level);
      setTakeoffAlt(site.takeoffAlt);
      setLandingAlt(site.landingAlt);
      setElevationDiff(site.elevationDiff);
      setFinesseRequired(site.finesseRequired);
      setOrientations([...site.orientations]);
      setIdealWindMin(site.idealWindMin);
      setIdealWindMax(site.idealWindMax);
      setMaxSafeGust(site.maxSafeGust);
      setRecommendedHours(site.recommendedHours);
      setDescription(site.description);
      setAerologyTips(site.aerologyTips);
      setHazards([...(site.hazards || [])]);
      setAccessInfo(site.accessInfo);
      setAirspaceWarning(site.airspaceWarning || '');
      setLat(site.lat);
      setLng(site.lng);
      setLandingLat(site.landingLat);
      setLandingLng(site.landingLng);
      setWebcamUrl(site.webcamUrl || '');
      setUpdaterName(currentUser?.fullName || 'Bureau Zéléph / Gestionnaire Site');
    }
  }, [isOpen, site, currentUser]);

  if (!isOpen) return null;

  // Auto-calculate elevation difference when takeoff/landing altitude changes
  const handleTakeoffAltChange = (val: number) => {
    setTakeoffAlt(val);
    setElevationDiff(Math.max(0, val - landingAlt));
  };

  const handleLandingAltChange = (val: number) => {
    setLandingAlt(val);
    setElevationDiff(Math.max(0, takeoffAlt - val));
  };

  const toggleOrientation = (ori: WindDirection) => {
    setOrientations(prev => {
      if (prev.includes(ori)) {
        return prev.filter(o => o !== ori);
      } else {
        return [...prev, ori];
      }
    });
  };

  const handleAddHazard = () => {
    setHazards(prev => [...prev, '']);
  };

  const handleUpdateHazard = (index: number, val: string) => {
    setHazards(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveHazard = (index: number) => {
    setHazards(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedHazards = hazards.map(h => h.trim()).filter(Boolean);

    const updated: ParaglidingSite = {
      ...site,
      name: name.trim(),
      subTitle: subTitle.trim(),
      massif,
      level,
      takeoffAlt: Number(takeoffAlt) || site.takeoffAlt,
      landingAlt: Number(landingAlt) || site.landingAlt,
      elevationDiff: Number(elevationDiff) || site.elevationDiff,
      finesseRequired: Number(finesseRequired) || site.finesseRequired,
      orientations: orientations.length > 0 ? orientations : site.orientations,
      idealWindMin: Number(idealWindMin) || site.idealWindMin,
      idealWindMax: Number(idealWindMax) || site.idealWindMax,
      maxSafeGust: Number(maxSafeGust) || site.maxSafeGust,
      recommendedHours: recommendedHours.trim() || site.recommendedHours,
      description: description.trim(),
      aerologyTips: aerologyTips.trim(),
      hazards: cleanedHazards.length > 0 ? cleanedHazards : site.hazards,
      accessInfo: accessInfo.trim(),
      airspaceWarning: airspaceWarning.trim() || undefined,
      lat: Number(lat) || site.lat,
      lng: Number(lng) || site.lng,
      landingLat: Number(landingLat) || site.landingLat,
      landingLng: Number(landingLng) || site.landingLng,
      webcamUrl: webcamUrl.trim() || undefined,
      lastUpdatedDate: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      updatedBy: updaterName.trim() || 'Club Zéléph'
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl my-6 bg-slate-900 border border-sky-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-950/90 via-slate-900 to-indigo-950/90 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                <Sparkles className="w-3 h-3" />
                <span>Gestion & Actualisation Saisonnière</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Modifier la Fiche Site : {site.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adaptez les informations en fonction de l'évolution au fil des saisons (accès, clôtures, brises, pièges, arrêtés, webcam).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-white/5 bg-slate-950/40 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2 rounded-t-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-slate-900 text-sky-400 border-t border-x border-sky-500/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Général & Altitudes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('aero')}
            className={`px-3 py-2 rounded-t-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'aero'
                ? 'bg-slate-900 text-sky-400 border-t border-x border-sky-500/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Vent, Orientations & Horaires</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('access')}
            className={`px-3 py-2 rounded-t-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'access'
                ? 'bg-slate-900 text-sky-400 border-t border-x border-sky-500/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Accès, Dangers & CTR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gps')}
            className={`px-3 py-2 rounded-t-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'gps'
                ? 'bg-slate-900 text-sky-400 border-t border-x border-sky-500/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>GPS & Webcam</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: Général & Altitudes */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nom du site *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sous-titre / Description courte *
                  </label>
                  <input
                    type="text"
                    required
                    value={subTitle}
                    onChange={e => setSubTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Massif *
                  </label>
                  <select
                    value={massif}
                    onChange={e => setMassif(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Bauges">Bauges</option>
                    <option value="Chartreuse">Chartreuse</option>
                    <option value="Avant-Pays Savoyard">Avant-Pays Savoyard</option>
                    <option value="Combe de Savoie">Combe de Savoie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Niveau pilote requis *
                  </label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Tous pilotes">Tous pilotes (Accessible débutant encadré)</option>
                    <option value="Pilote autonome">Pilote autonome (Brevet de pilote)</option>
                    <option value="Pilote confirmé">Pilote confirmé (BPC / Site exigeant)</option>
                  </select>
                </div>
              </div>

              {/* Altitudes & Dénivelé */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Altitudes & Finesse requise
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Décollage (m)
                    </label>
                    <input
                      type="number"
                      value={takeoffAlt}
                      onChange={e => handleTakeoffAltChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Atterrissage (m)
                    </label>
                    <input
                      type="number"
                      value={landingAlt}
                      onChange={e => handleLandingAltChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Dénivelé (m)
                    </label>
                    <input
                      type="number"
                      value={elevationDiff}
                      onChange={e => setElevationDiff(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Finesse plané
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={finesseRequired}
                      onChange={e => setFinesseRequired(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Présentation complète du site
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Vent, Orientations & Horaires */}
          {activeTab === 'aero' && (
            <div className="space-y-4">
              {/* Orientations favorables */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Orientations favorables de vent (cliquer pour activer / désactiver) :
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {ALL_ORIENTATIONS.map(ori => {
                    const isSelected = orientations.includes(ori);
                    return (
                      <button
                        key={ori}
                        type="button"
                        onClick={() => toggleOrientation(ori)}
                        className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition border ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                            : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {ori}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plages de vent */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Régime de vent idéal (km/h)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Vent min (km/h)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={idealWindMin}
                      onChange={e => setIdealWindMin(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Vent max moyen (km/h)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={idealWindMax}
                      onChange={e => setIdealWindMax(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Rafales max tolérées (km/h)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="70"
                      value={maxSafeGust}
                      onChange={e => setMaxSafeGust(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Horaires de vol recommandés (plage journalière globale)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 13h30 - 20h30 (optimal en soirée)"
                  value={recommendedHours}
                  onChange={e => setRecommendedHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Conseils d'aérologie, thermiques & brise de vallée
                </label>
                <textarea
                  rows={4}
                  value={aerologyTips}
                  onChange={e => setAerologyTips(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  placeholder="Préciser l'installation de la brise, la restitution, les tendances météo..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: Accès, Dangers & Espace Aérien */}
          {activeTab === 'access' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Accès, Navettes, Parking & Sentier (évolutions saisonnières)
                </label>
                <textarea
                  rows={3}
                  value={accessInfo}
                  onChange={e => setAccessInfo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  placeholder="Itinéraire routier, état de la piste, barrière pastorale, stationnement..."
                />
              </div>

              {/* Hazards list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Points de vigilance & Pièges aérologiques</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHazard}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un point</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {hazards.map((hz, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center font-mono shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={hz}
                        onChange={e => handleUpdateHazard(idx, e.target.value)}
                        placeholder="Ex: Décollage falaise court, sous le vent par tendance Nord..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-rose-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHazard(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        title="Supprimer ce piège"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Espace Aérien & Avertissement CTR Chambéry (optionnel)</span>
                </label>
                <textarea
                  rows={2}
                  value={airspaceWarning}
                  onChange={e => setAirspaceWarning(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  placeholder="Ex: CTR Chambéry Aix-les-Bains active en classe D. Protocole FFVL / DGAC..."
                />
              </div>
            </div>
          )}

          {/* TAB 4: GPS & Webcam */}
          {activeTab === 'gps' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Coordonnées GPS (Google Maps / Guidage)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-white block">GPS Décollage</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={lat}
                          onChange={e => setLat(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={lng}
                          onChange={e => setLng(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-white block">GPS Atterrissage</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={landingLat}
                          onChange={e => setLandingLat(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={landingLng}
                          onChange={e => setLandingLng(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-sky-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  <span>Lien Webcam en direct (URL SolarCam ou webcam FFVL)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.solarcam.fr/verel/ ou autre lien webcam"
                  value={webcamUrl}
                  onChange={e => setWebcamUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Modifié par (auteur de la mise à jour)</span>
                </label>
                <input
                  type="text"
                  value={updaterName}
                  onChange={e => setUpdaterName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              {isCustomized && onResetToDefault && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Rétablir les informations d'origine du club pour le site ${site.name} ?`)) {
                      onResetToDefault(site.id);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rétablir les valeurs par défaut</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-300 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les modifications</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
