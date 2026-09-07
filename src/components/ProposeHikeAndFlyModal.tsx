import React, { useState, useEffect } from 'react';
import { X, Mountain, Compass, Footprints, Plus, Trash2, CheckCircle2, Sparkles, User, MapPin } from 'lucide-react';
import { HikeAndFlyTopo, ClubMemberProfile } from '../types';

interface ProposeHikeAndFlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (topo: HikeAndFlyTopo) => void;
  currentUser?: ClubMemberProfile | null;
}

export const ProposeHikeAndFlyModal: React.FC<ProposeHikeAndFlyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [summit, setSummit] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [landingSpot, setLandingSpot] = useState('');
  const [dPlus, setDPlus] = useState<number>(850);
  const [distanceKm, setDistanceKm] = useState<number>(5.5);
  const [durationHours, setDurationHours] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [finessePlan, setFinessePlan] = useState<number>(5.5);
  const [difficulty, setDifficulty] = useState<'Facile' | 'Moyen' | 'Sportif' | 'Alpin'>('Moyen');
  const [orientation, setOrientation] = useState('Ouest / Sud-Ouest');
  const [recommendedSeason, setRecommendedSeason] = useState('Printemps / Été / Automne');
  const [description, setDescription] = useState('');
  const [itinerarySteps, setItinerarySteps] = useState<string[]>([
    "Départ du parking de la randonnée",
    "Montée par le sentier balisé à travers la forêt / les alpages",
    "Arrivée au sommet et repérage de la zone d'étalement"
  ]);
  const [takeoffTip, setTakeoffTip] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill user information when opened
  useEffect(() => {
    if (isOpen) {
      if (currentUser?.fullName) {
        setAuthorName(currentUser.fullName);
      } else if (!authorName) {
        setAuthorName('Pilote Zéléph');
      }
      setErrorMsg('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    setItinerarySteps(prev => [...prev, '']);
  };

  const handleUpdateStep = (index: number, val: string) => {
    setItinerarySteps(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveStep = (index: number) => {
    if (itinerarySteps.length <= 1) return;
    setItinerarySteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Veuillez indiquer un titre pour la rando-vol.');
      return;
    }
    if (!summit.trim()) {
      setErrorMsg('Veuillez préciser le sommet ou le décollage atteint.');
      return;
    }
    if (!startPoint.trim()) {
      setErrorMsg('Veuillez préciser le lieu de départ (parking / arrêt).');
      return;
    }
    if (!landingSpot.trim()) {
      setErrorMsg("Veuillez préciser l'atterrissage visé.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Merci de partager quelques mots sur ce rando-vol (pourquoi vous l’aimez, ambiance).');
      return;
    }
    if (!takeoffTip.trim()) {
      setErrorMsg('Merci de donner des conseils sur le décollage et les conditions aérologiques.');
      return;
    }

    const filteredSteps = itinerarySteps.map(s => s.trim()).filter(Boolean);
    if (filteredSteps.length === 0) {
      filteredSteps.push("Itinéraire selon sentier balisé jusqu'au sommet.");
    }

    const totalMinutes = Math.max(20, (durationHours * 60) + durationMinutes);

    const newTopo: HikeAndFlyTopo = {
      id: `topo-${Date.now()}`,
      title: title.trim(),
      summit: summit.trim(),
      dPlus: Number(dPlus) || 500,
      distanceKm: Number(distanceKm) || 4,
      durationAscentMin: totalMinutes,
      startPoint: startPoint.trim(),
      landingSpot: landingSpot.trim(),
      finessePlan: Number(finessePlan) || 5.0,
      difficulty,
      description: description.trim(),
      itinerary: filteredSteps,
      takeoffTip: takeoffTip.trim(),
      authorName: authorName.trim() || (currentUser?.fullName || 'Membre Zéléph'),
      authorId: currentUser?.id,
      authorRole: currentUser?.role || 'Pilote du club',
      createdAt: new Date().toISOString().split('T')[0],
      isCommunity: true,
      orientation: orientation.trim(),
      recommendedSeason: recommendedSeason.trim()
    };

    onSubmit(newTopo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl my-6 bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-sky-950/80 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                <Sparkles className="w-3 h-3" />
                <span>Partage entre Z'éléphants</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Proposer un Rando-Vol
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Partagez un itinéraire que vous aimez pour que les autres pilotes du club puissent le tester et le refaire !
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="font-bold">Attention :</span> {errorMsg}
            </div>
          )}

          {/* Section 1: Informations Générales */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>1. Destination & Parcours</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Titre du Rando-Vol *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mont Colombier par la Bottière, Pointe de la Galoppaz..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sommet & Altitude *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mont Colombier (2045m) - Bauges"
                  value={summit}
                  onChange={e => setSummit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Difficulté globale *
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="Facile">Facile (Sentier large, déco herbeux évident)</option>
                  <option value="Moyen">Moyen (Dénivelé standard, sentier de montagne)</option>
                  <option value="Sportif">Sportif (D+ &gt; 1000m ou sentier raide)</option>
                  <option value="Alpin">Alpin (Arêtes, passages câblés, déco technique)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Point de départ & Parking *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Parking de la Bottière (1180m), Mouxy gare..."
                  value={startPoint}
                  onChange={e => setStartPoint(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Atterrissage visé *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pragondran, Challes, Aillon ou Buisson-Rond"
                  value={landingSpot}
                  onChange={e => setLandingSpot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Métriques Physiques & Aérologie */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Footprints className="w-3.5 h-3.5 text-sky-400" />
              <span>2. Données Physiques & Aérologiques</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Dénivelé D+ (m) *
                </label>
                <input
                  type="number"
                  min="50"
                  max="3500"
                  step="10"
                  required
                  value={dPlus}
                  onChange={e => setDPlus(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Distance rando (km) *
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="40"
                  step="0.1"
                  required
                  value={distanceKm}
                  onChange={e => setDistanceKm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Temps de montée *
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={durationHours}
                    onChange={e => setDurationHours(Number(e.target.value))}
                    className="w-14 px-2 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white text-center focus:outline-none focus:border-sky-400 font-mono"
                    title="Heures"
                  />
                  <span className="text-xs text-slate-400">h</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-14 px-2 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white text-center focus:outline-none focus:border-sky-400 font-mono"
                    title="Minutes"
                  />
                  <span className="text-xs text-slate-400">min</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Finesse requise *
                </label>
                <input
                  type="number"
                  min="3.0"
                  max="12.0"
                  step="0.1"
                  required
                  value={finessePlan}
                  onChange={e => setFinessePlan(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Orientation favorable du déco
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ouest, Sud-Ouest, Brise de vallée face..."
                  value={orientation}
                  onChange={e => setOrientation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Période / Saison conseillée
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mai à Octobre, tôt le matin ou vol du soir..."
                  value={recommendedSeason}
                  onChange={e => setRecommendedSeason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Récit & Itinéraire */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Description, Itinéraire & Conseils de Vol</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description & Coup de cœur du pilote *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Pourquoi aimez-vous ce vol ? Points de vue, ambiance en vol, faune, dépaysement..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Étapes de l'itinéraire */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Étapes clés de la montée (pas à pas)
                </label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une étape</span>
                </button>
              </div>

              <div className="space-y-2">
                {itinerarySteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step}
                      placeholder={`Étape ${idx + 1}...`}
                      onChange={e => handleUpdateStep(idx, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                    />
                    {itinerarySteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        title="Supprimer cette étape"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Conseils Décollage, Aérologie & Pièges à éviter *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Ex: Décollage spacieux en herbe. Attention au vent de Sud qui peut créer des rouleaux sous le vent. Ne pas traîner dans la combe si brise forte..."
                value={takeoffTip}
                onChange={e => setTakeoffTip(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Section 4: Auteur */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300">
              Proposé par (votre prénom / nom) *
            </label>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Ex: Jonathan Roux (Pilote Zéléph)"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-300 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publier ce Rando-Vol</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
