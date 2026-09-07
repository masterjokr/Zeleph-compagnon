import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ZELEPH_TOPOS } from '../data/hikeAndFlyData';
import { 
  Mountain, 
  Compass, 
  Footprints, 
  Calculator, 
  Award, 
  Plus, 
  Search, 
  Share2, 
  Check, 
  Trash2, 
  User, 
  Sparkles, 
  Calendar, 
  ArrowDownCircle,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Lock
} from 'lucide-react';
import { HikeAndFlyTopo, ClubMemberProfile } from '../types';
import { ProposeHikeAndFlyModal } from './ProposeHikeAndFlyModal';
import { isZelephMember } from '../utils/authUtils';

const COMMUNITY_TOPOS_KEY = 'zeleph_community_topos_v1';
const HIDDEN_OFFICIAL_TOPOS_KEY = 'zeleph_hidden_official_topos_v1';

const INITIAL_COMMUNITY_TOPOS: HikeAndFlyTopo[] = [
  {
    id: 'topo-colombier-bauges',
    title: 'Mont Colombier par la Bottière',
    summit: 'Mont Colombier (2045m) - Bauges',
    dPlus: 865,
    distanceKm: 6.0,
    durationAscentMin: 110,
    startPoint: 'Parking de la Bottière (1180m, Aillon-le-Vieux)',
    landingSpot: "Atterrissage FFVL d'Aillon ou grand pré fauché",
    finessePlan: 5.6,
    difficulty: 'Moyen',
    description: "Un sommet emblématique des Bauges avec vue imprenable sur le lac du Bourget et la combe de Savoie. L'arête finale est splendide et le décollage en herbe sous la croix est d'une grande facilité en conditions calmes.",
    itinerary: [
      "Départ du parking de la Bottière par la piste forestière ombragée",
      "Sortie en alpage vers les chalets de la Cha",
      "Montée vers le Col du Colombier puis arête Sud herbeuse",
      "Croix sommitale et étalement des ailes sur la croupe Ouest / Sud-Ouest"
    ],
    takeoffTip: "Décollage herbeux vaste orienté Ouest / Sud-Ouest. Idéal en fin d'après-midi avec la restitution thermique ou brise montante douce.",
    authorName: 'Jonathan Roux',
    authorRole: 'Pilote Zéléph',
    createdAt: '2026-05-18',
    isCommunity: true,
    orientation: 'Ouest / Sud-Ouest',
    recommendedSeason: 'Juin à Octobre'
  },
  {
    id: 'topo-grand-som-chartreuse',
    title: 'Le Grand Som par la Correrie',
    summit: 'Le Grand Som (2026m) - Chartreuse',
    dPlus: 1180,
    distanceKm: 7.4,
    durationAscentMin: 155,
    startPoint: 'La Correrie / Monastère de la Grande Chartreuse (850m)',
    landingSpot: "Saint-Pierre-d'Entremont ou Challes-les-Eaux (en transition)",
    finessePlan: 6.2,
    difficulty: 'Sportif',
    description: "Une ascension historique et grandiose au cœur du massif de la Chartreuse. Vue plongeante sur les toits du monastère et envol mémorable dans une ambiance haute montagne calcaire.",
    itinerary: [
      "Départ du parking de la Correrie",
      "Montée par le col de Bovinant et les sentiers calcaires des crêtes",
      "Cheminement sur les dalles inclinées sécurisées jusqu'à la croix",
      "Décollage sur les pelouses d'altitude sous la crête sommitale"
    ],
    takeoffTip: "Décollage d'alpage d'altitude, requiert un vent modéré bien axé (Sud ou brise Sud-Ouest). Attention à bien repérer la ligne électrique en vallée d'Entremont.",
    authorName: 'Julien M.',
    authorRole: 'Membre Zéléph Cross',
    createdAt: '2026-06-02',
    isCommunity: true,
    orientation: 'Sud / Sud-Ouest',
    recommendedSeason: 'Juin à Septembre'
  }
];

interface TrotteEtVolProps {
  currentUser?: ClubMemberProfile | null;
  onNavigateToMembers?: () => void;
  onRequireMemberAuth?: (reason: string) => void;
}

export const TrotteEtVol: React.FC<TrotteEtVolProps> = ({ 
  currentUser, 
  onNavigateToMembers,
  onRequireMemberAuth 
}) => {
  // Admin mode detection & override for effortless moderation
  const [adminOverrideMode, setAdminOverrideMode] = useState<boolean>(false);

  const isAdmin = Boolean(
    adminOverrideMode ||
    currentUser?.isSuperAdmin || 
    currentUser?.discordRole?.toLowerCase().includes('admin') || 
    currentUser?.discordRole?.toLowerCase().includes('bureau') ||
    currentUser?.fullName?.toLowerCase().includes('jonathan') ||
    currentUser?.email?.toLowerCase().includes('roux.jonath')
  );

  // Community topos loaded from localStorage
  const [communityTopos, setCommunityTopos] = useState<HikeAndFlyTopo[]>(() => {
    try {
      const saved = localStorage.getItem(COMMUNITY_TOPOS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load community topos", e);
    }
    return INITIAL_COMMUNITY_TOPOS;
  });

  // Hidden official topos (if deleted by an admin)
  const [hiddenOfficialIds, setHiddenOfficialIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(HIDDEN_OFFICIAL_TOPOS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal state
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [topoToDelete, setTopoToDelete] = useState<{ id: string; title: string; isCommunity?: boolean } | null>(null);

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState<'all' | 'club' | 'community'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Selected topo ID
  const [selectedTopoId, setSelectedTopoId] = useState<string>('nivolet-pragondran');

  // Calculator states
  const [calcDPlus, setCalcDPlus] = useState<number>(1000);
  const [calcVitesseAscension, setCalcVitesseAscension] = useState<number>(500); // m/h
  const [calcDistanceVolKm, setCalcDistanceVolKm] = useState<number>(5.2);
  const [calcDeniveleVolM, setCalcDeniveleVolM] = useState<number>(1050);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Ref for calculator scroll
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Save community topos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(COMMUNITY_TOPOS_KEY, JSON.stringify(communityTopos));
    } catch (e) {
      console.error("Failed to persist community topos", e);
    }
  }, [communityTopos]);

  // Combine official (non-hidden) + community topos
  const allTopos = useMemo(() => {
    const activeOfficials = ZELEPH_TOPOS.filter(t => !hiddenOfficialIds.includes(t.id));
    return [...activeOfficials, ...communityTopos];
  }, [communityTopos, hiddenOfficialIds]);

  // Filtered topos
  const filteredTopos = useMemo(() => {
    return allTopos.filter(topo => {
      // Source filter
      if (activeFilter === 'club' && topo.isCommunity) return false;
      if (activeFilter === 'community' && !topo.isCommunity) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && topo.difficulty !== selectedDifficulty) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = topo.title.toLowerCase().includes(query);
        const matchesSummit = topo.summit.toLowerCase().includes(query);
        const matchesDesc = topo.description.toLowerCase().includes(query);
        const matchesAuthor = (topo.authorName || '').toLowerCase().includes(query);
        const matchesLanding = topo.landingSpot.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSummit && !matchesDesc && !matchesAuthor && !matchesLanding) {
          return false;
        }
      }

      return true;
    });
  }, [allTopos, activeFilter, selectedDifficulty, searchQuery]);

  // Ensure a valid topo is selected
  const selectedTopo = useMemo(() => {
    const found = allTopos.find(t => t.id === selectedTopoId);
    if (found) return found;
    return filteredTopos[0] || allTopos[0] || ZELEPH_TOPOS[0];
  }, [allTopos, selectedTopoId, filteredTopos]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add new proposed topo
  const handleAddTopo = (newTopo: HikeAndFlyTopo) => {
    setCommunityTopos(prev => [newTopo, ...prev]);
    setSelectedTopoId(newTopo.id);
    setActiveFilter('all');
    showToast(`Le rando-vol "${newTopo.title}" a bien été partagé avec le club !`);
  };

  // Delete topo handler (Admin can delete ANY topo, author can delete their own)
  const handleDeleteTopo = (id: string, title: string, isCommunity?: boolean) => {
    setTopoToDelete({ id, title, isCommunity });
  };

  const confirmDeleteTopo = () => {
    if (!topoToDelete) return;
    const { id, title, isCommunity } = topoToDelete;

    if (isCommunity) {
      setCommunityTopos(prev => {
        const next = prev.filter(t => t.id !== id);
        try {
          localStorage.setItem(COMMUNITY_TOPOS_KEY, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
    } else {
      // Hide official topo
      const next = [...hiddenOfficialIds, id];
      setHiddenOfficialIds(next);
      try {
        localStorage.setItem(HIDDEN_OFFICIAL_TOPOS_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
    }

    if (selectedTopoId === id) {
      setSelectedTopoId('');
    }
    showToast(`Le rando-vol "${title}" a été supprimé avec succès.`);
    setTopoToDelete(null);
  };

  // Restore hidden official topos (Admin action)
  const handleRestoreOfficialTopos = () => {
    setHiddenOfficialIds([]);
    try {
      localStorage.removeItem(HIDDEN_OFFICIAL_TOPOS_KEY);
    } catch (e) {
      console.error(e);
    }
    showToast("Tous les topos officiels du club ont été réactivés.");
  };

  // Pre-fill calculator with this topo
  const handleInjectIntoCalculator = (topo: HikeAndFlyTopo) => {
    setCalcDPlus(topo.dPlus);
    setCalcDistanceVolKm(Math.max(1, topo.distanceKm));
    setCalcDeniveleVolM(topo.dPlus);
    showToast(`Dénivelé (+${topo.dPlus}m) et distance injectés dans le calculateur !`);
    
    if (calculatorRef.current) {
      calculatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Share / Copy Topo Summary
  const handleShareTopo = (topo: HikeAndFlyTopo) => {
    const text = `🏔️ Topo Rando-Vol Zéléph : ${topo.title}
📍 Sommet : ${topo.summit}
📈 Dénivelé : +${topo.dPlus}m • Distance : ${topo.distanceKm} km
⏱️ Montée moyenne : ${Math.floor(topo.durationAscentMin / 60)}h${topo.durationAscentMin % 60}min
🪂 Atterrissage : ${topo.landingSpot} (Finesse requise : ${topo.finessePlan})
💡 Conseils déco : ${topo.takeoffTip}
👤 Partagé par : ${topo.authorName || 'Club Zéléph'}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      showToast("Résumé du topo copié dans le presse-papier !");
    }
  };

  // Calculations for calculator
  const calculatedAscentHours = (calcDPlus / calcVitesseAscension);
  const ascentHours = Math.floor(calculatedAscentHours);
  const ascentMinutes = Math.round((calculatedAscentHours - ascentHours) * 60);

  const calculatedFinesse = calcDeniveleVolM > 0 
    ? ((calcDistanceVolKm * 1000) / calcDeniveleVolM).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-sky-950 border border-emerald-900/40 p-5 sm:p-7 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1 rounded-full">
              <Award className="w-3.5 h-3.5" />
              <span>L’esprit Zéléph : Trotte & Vol & Galope & Vol</span>
            </div>
            <div className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>{allTopos.length} topos répertoriés ({communityTopos.length} partagés par les membres)</span>
            </div>

            {/* Admin status pill */}
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
                <ShieldAlert className="w-3 h-3" />
                <span>Modération Admin : suppression active</span>
              </span>
            ) : (
              <button
                onClick={() => setAdminOverrideMode(true)}
                className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-[11px] px-2.5 py-1 rounded-full transition"
                title="Débloquer les fonctions de modération admin"
              >
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                <span>Activer modération admin</span>
              </button>
            )}

            {isAdmin && hiddenOfficialIds.length > 0 && (
              <button
                onClick={handleRestoreOfficialTopos}
                className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full hover:bg-amber-500/30 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurer topos masqués ({hiddenOfficialIds.length})</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                Rando-Vol & Trotte & Vol
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Le marche et vol est au cœur de l'esprit des Z'éléphants Volants. Retrouvez les topos du club et ceux proposés par les membres. L'administration peut modérer et supprimer les parcours à tout moment.
              </p>
            </div>

            <button
              onClick={() => {
                if (!isZelephMember(currentUser)) {
                  if (onRequireMemberAuth) {
                    onRequireMemberAuth("Pour proposer un parcours rando-vol (Trotte & Vol), vous devez être connecté avec votre compte Discord (statut minimum : Membre Z'éléph).");
                  } else if (onNavigateToMembers) {
                    onNavigateToMembers();
                  } else {
                    showToast("Connexion Discord requise (statut Membre Z'éléph) pour proposer un topo.");
                  }
                  return;
                }
                setIsProposeModalOpen(true);
              }}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition shadow-lg shrink-0 active:scale-95 ${
                isZelephMember(currentUser)
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow-slate-900/50'
              }`}
              title={isZelephMember(currentUser) ? "Proposer un nouveau parcours de marche & vol" : "Mode Visiteur : connectez-vous avec Discord (statut Membre Z'éléph requis)"}
            >
              {isZelephMember(currentUser) ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
              <span>{isZelephMember(currentUser) ? 'Proposer un Rando-Vol' : 'Connexion requise pour proposer'}</span>
            </button>
          </div>
        </div>

        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <Mountain className="w-64 h-64 text-emerald-400" />
        </div>
      </div>

      {/* Visitor / Non-Member Status Banner */}
      {!isZelephMember(currentUser) && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Mode Visiteur (Lecture seule) : Vous pouvez consulter et calculer les paramètres de tous les topos. Pour proposer vos propres topos rando-vol, connectez-vous avec votre compte Discord (statut minimum : <strong>Membre Z'éléph</strong>).
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onRequireMemberAuth) {
                onRequireMemberAuth("Pour proposer des topos rando-vol, connectez-vous avec votre compte Discord avec le statut minimum 'Membre Z'éléph'.");
              } else if (onNavigateToMembers) {
                onNavigateToMembers();
              }
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2 flex items-center gap-1 self-start sm:self-auto shrink-0"
          >
            <span>Se connecter avec Discord</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Topos Selection & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Topos List with Search & Source Filters */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Controls: Source filter tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-white/5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                activeFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous ({allTopos.length})
            </button>
            <button
              onClick={() => setActiveFilter('club')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                activeFilter === 'club'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Club ({ZELEPH_TOPOS.filter(t => !hiddenOfficialIds.includes(t.id)).length})
            </button>
            <button
              onClick={() => setActiveFilter('community')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 ${
                activeFilter === 'community'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Membres ({communityTopos.length})</span>
            </button>
          </div>

          {/* Search bar & Difficulty dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher sommet, massif, auteur..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Toutes difficultés</option>
              <option value="Facile">Facile</option>
              <option value="Moyen">Moyen</option>
              <option value="Sportif">Sportif</option>
              <option value="Alpin">Alpin</option>
            </select>
          </div>

          {/* Topos Cards List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredTopos.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-white/5 space-y-3">
                <Mountain className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Aucun topo ne correspond à votre recherche.</p>
                <button
                  onClick={() => setIsProposeModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition"
                >
                  + Proposer ce parcours
                </button>
              </div>
            ) : (
              filteredTopos.map((topo) => {
                const isSelected = selectedTopo && topo.id === selectedTopo.id;
                return (
                  <div
                    key={topo.id}
                    onClick={() => setSelectedTopoId(topo.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition border relative group ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/40'
                        : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {topo.isCommunity ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>{topo.authorName || 'Membre'}</span>
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              Classique Club
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {topo.difficulty}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-base truncate">{topo.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{topo.summit}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          D+ {topo.dPlus}m
                        </span>

                        {/* Admin quick delete button directly on card */}
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTopo(topo.id, topo.title, topo.isCommunity);
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition opacity-80 group-hover:opacity-100"
                            title="Supprimer ce rando-vol (Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
              })
            )}
          </div>
        </div>

        {/* Right: Selected Topo Detail */}
        <div className="lg:col-span-7">
          {selectedTopo ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedTopo.isCommunity ? (
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        <span>Proposé par {selectedTopo.authorName}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        Topo Officiel Club Zéléph
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {selectedTopo.difficulty}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Finesse requise : {selectedTopo.finessePlan}
                    </span>
                  </div>

                  {/* Topo action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShareTopo(selectedTopo)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
                      title="Partager ou copier ce topo"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Partager</span>
                    </button>

                    {/* Admin or Author Delete Button */}
                    {(isAdmin || selectedTopo.isCommunity) && (
                      <button
                        onClick={() => handleDeleteTopo(selectedTopo.id, selectedTopo.title, selectedTopo.isCommunity)}
                        className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/30 transition text-xs font-semibold flex items-center gap-1.5"
                        title={isAdmin ? "Supprimer définitivement ce rando-vol (Droits Admin)" : "Supprimer ce topo"}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Supprimer {isAdmin ? '(Admin)' : ''}</span>
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {selectedTopo.title}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>{selectedTopo.summit}</span>
                </p>

                {/* Author attribution card if member topo */}
                {selectedTopo.isCommunity && (
                  <div className="mt-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Partagé par {selectedTopo.authorName}</span>
                        <span className="text-[11px] text-purple-300/80">{selectedTopo.authorRole || 'Membre Zéléph'}</span>
                      </div>
                    </div>
                    {selectedTopo.createdAt && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        Partagé le {selectedTopo.createdAt}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
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

              {/* Locations Details (Départ & Atterrissage) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Départ / Parking</span>
                  <span className="text-white font-medium mt-0.5 block">{selectedTopo.startPoint}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Atterrissage visé</span>
                  <span className="text-white font-medium mt-0.5 block">{selectedTopo.landingSpot}</span>
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
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Takeoff Advice */}
              <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-4 text-xs text-emerald-200">
                <div className="flex items-center justify-between gap-2 font-bold text-emerald-300 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    <span>Conseils Décollage, Aérologie & Pièges</span>
                  </div>
                  {selectedTopo.orientation && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      Orientation : {selectedTopo.orientation}
                    </span>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedTopo.takeoffTip}</p>
                
                {selectedTopo.recommendedSeason && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-900/40 text-slate-400 text-[11px] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saison / moments recommandés : <strong className="text-white">{selectedTopo.recommendedSeason}</strong></span>
                  </div>
                )}
              </div>

              {/* Inject into calculator action */}
              <div className="pt-2">
                <button
                  onClick={() => handleInjectIntoCalculator(selectedTopo)}
                  className="w-full py-3 px-4 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <Calculator className="w-4 h-4 text-sky-400" />
                  <span>Tester cette montée (+{selectedTopo.dPlus}m) et la finesse dans le calculateur ci-dessous</span>
                  <ArrowDownCircle className="w-4 h-4 text-sky-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-white/5 text-slate-400">
              <Mountain className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p>Sélectionnez un topo dans la liste pour afficher ses caractéristiques.</p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Flight & Hike Calculator */}
      <div ref={calculatorRef} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
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
                <span className="font-mono font-bold text-white">+{calcDPlus} m</span>
              </div>
              <input
                type="range"
                min="200"
                max="2500"
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
                max="2500"
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

      {/* Propose Topo Modal */}
      <ProposeHikeAndFlyModal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        onSubmit={handleAddTopo}
        currentUser={currentUser}
      />

      {/* In-App Delete Confirmation Modal */}
      {topoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 flex items-center justify-center border border-rose-500/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Supprimer le Rando-Vol</h3>
                <span className="text-[11px] text-slate-400">
                  {isAdmin ? "Action modération administrateur" : "Suppression de votre parcours"}
                </span>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer le topo rando-vol{' '}
              <strong className="text-white">« {topoToDelete.title} »</strong> ?
              {topoToDelete.isCommunity 
                ? " Il sera définitivement supprimé de la liste partagée du club." 
                : " En tant qu'administrateur, ce topo officiel sera masqué pour l'ensemble des membres."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTopoToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteTopo}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
