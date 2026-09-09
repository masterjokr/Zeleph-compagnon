import React, { useState, useEffect } from 'react';
import { ShuttleRide, ClubMemberProfile } from '../types';
import { ZELEPH_SITES } from '../data/sitesData';
import { 
  Car, Plus, Users, Clock, MapPin, Check, MessageSquare, PhoneCall, 
  Trash2, UserCheck, Sparkles, User, Lock, RefreshCw, X, AlertCircle, ExternalLink 
} from 'lucide-react';
import { isZelephMember } from '../utils/authUtils';
import { 
  sendShuttleToDiscord, 
  syncShuttleWithDiscord, 
  getStoredDiscordConfig 
} from '../utils/discordWebhook';
import { fetchLiveDiscordSync } from '../utils/botSyncService';

const STORAGE_KEY = 'zeleph_shuttle_rides_v1';
const STORAGE_PROFILE_KEY = 'zeleph_member_profile_v1';

export interface ShuttleBoardProps {
  currentUser?: ClubMemberProfile | null;
  onNavigateToMembers?: () => void;
  onRequireMemberAuth?: (reason: string) => void;
  onOpenDiscordModal?: () => void;
  highlightedRideId?: string | null;
  onClearHighlightedRide?: () => void;
}

const INITIAL_RIDES: ShuttleRide[] = [
  {
    id: 'ride-1',
    driverName: 'Julien (Zéléph)',
    driverPhone: '06 12 34 56 78',
    departurePlace: 'Parking Piscine Buisson-Rond (Chambéry)',
    destinationSiteId: 'verel',
    destinationSiteName: 'Vérel - Pragondran',
    departureTime: '14:15',
    availableSeats: 2,
    totalSeats: 3,
    wingTypes: 'Solo / Cocon ok',
    passengers: ['Romain P.'],
    comment: 'Montée pour la session thermique et soaring du soir.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ride-2',
    driverName: 'Claire & Thomas',
    driverPhone: '06 98 76 54 32',
    departurePlace: 'Rond-point entrée Saint-Alban-Leysse',
    destinationSiteId: 'le-sire',
    destinationSiteName: 'Le Sire - La Féclaz',
    departureTime: '15:30',
    availableSeats: 1,
    totalSeats: 2,
    wingTypes: 'Matériel léger de préférence',
    passengers: ['Marc V.'],
    comment: 'Objectif cross vers le Semnoz ou retour Nivolet.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ride-3',
    driverName: 'Antoine M.',
    departurePlace: 'Atterrissage officiel de Chamoux',
    destinationSiteId: 'chamoux',
    destinationSiteName: 'Chamoux-sur-Gelon',
    departureTime: '17:00',
    availableSeats: 3,
    totalSeats: 4,
    wingTypes: 'Toutes voiles',
    passengers: [],
    comment: 'Navette rotation pour les vols du soir.',
    createdAt: new Date().toISOString(),
  }
];

export const ShuttleBoard: React.FC<ShuttleBoardProps> = ({ 
  currentUser: propCurrentUser, 
  onNavigateToMembers,
  onRequireMemberAuth,
  onOpenDiscordModal,
  highlightedRideId,
  onClearHighlightedRide
}) => {
  // If prop provided, use it; otherwise fallback to checking localStorage safely (null if absent)
  const [localUser] = useState<ClubMemberProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const currentUser = propCurrentUser !== undefined ? propCurrentUser : localUser;

  const [rides, setRides] = useState<ShuttleRide[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_RIDES;
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');

  // Form state prefilled with member profile info
  const [driverName, setDriverName] = useState(currentUser?.fullName || '');
  const [driverPhone, setDriverPhone] = useState(currentUser?.phone || '');
  const [departurePlace, setDeparturePlace] = useState(currentUser?.sector ? `Lieu de RDV (${currentUser.sector})` : 'Piscine Buisson-Rond (Chambéry)');
  const [destinationSiteId, setDestinationSiteId] = useState('verel');
  const [customSiteName, setCustomSiteName] = useState('');
  const [departureTime, setDepartureTime] = useState('14:30');
  const [totalSeats, setTotalSeats] = useState(currentUser?.availableSeats || 3);
  const [comment, setComment] = useState('');
  const [rideToDelete, setRideToDelete] = useState<ShuttleRide | null>(null);

  // In-app Join Modal & Discord synchronization states
  const [joinModalRide, setJoinModalRide] = useState<ShuttleRide | null>(null);
  const [joinPilotName, setJoinPilotName] = useState<string>('');
  const [syncingRideId, setSyncingRideId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  // When modal opens, check member permissions and sync with current user profile
  const handleOpenModal = () => {
    if (!isZelephMember(currentUser)) {
      if (onRequireMemberAuth) {
        onRequireMemberAuth("Pour proposer un covoiturage ou une navette, vous devez être connecté avec votre compte Discord (statut minimum : Membre Z'éléph).");
      } else if (onNavigateToMembers) {
        onNavigateToMembers();
      }
      return;
    }
    setDriverName(currentUser?.fullName || '');
    setDriverPhone(currentUser?.phone || '');
    setTotalSeats(currentUser?.availableSeats || 3);
    setCustomSiteName('');
    if (currentUser?.sector) {
      setDeparturePlace(`Secteur ${currentUser.sector}`);
    }
    setShowModal(true);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));
    } catch {
      // ignore
    }
  }, [rides]);

  // Écoute les synchronisations en direct venues du Bot Render
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setRides(e.detail);
      } else {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) setRides(JSON.parse(saved));
        } catch {}
      }
    };
    window.addEventListener('zeleph_rides_updated', handleUpdate);
    return () => window.removeEventListener('zeleph_rides_updated', handleUpdate);
  }, []);

  const [isSyncingFromBot, setIsSyncingFromBot] = useState(false);
  const handleSyncWithBot = async () => {
    const discordCfg = getStoredDiscordConfig();
    if (!discordCfg.botApiUrl) {
      showToast("ℹ️ Veuillez renseigner l'URL de votre Bot Render dans la passerelle Discord.");
      if (onOpenDiscordModal) {
        onOpenDiscordModal();
      }
      return;
    }

    setIsSyncingFromBot(true);
    try {
      const res = await fetchLiveDiscordSync();
      if (res.success) {
        showToast(`🔄 Bot synchronisé : ${res.covoitsCount} covoiturage(s) à jour.`);
      } else {
        showToast(`ℹ️ ${res.message}`);
      }
    } catch (e: any) {
      showToast(`Erreur synchro : ${e?.message}`);
    } finally {
      setIsSyncingFromBot(false);
    }
  };

  // Handle deep-link from Discord (?join_ride=...)
  useEffect(() => {
    if (highlightedRideId) {
      const target = rides.find(r => r.id === highlightedRideId);
      if (target) {
        handleOpenJoinModal(target);
      }
    }
  }, [highlightedRideId, rides]);

  const handleCreateRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) return;

    const isCustom = destinationSiteId === 'custom';
    if (isCustom && !customSiteName.trim()) return;

    const site = isCustom ? null : ZELEPH_SITES.find(s => s.id === destinationSiteId);
    const destinationSiteName = isCustom 
      ? customSiteName.trim() 
      : (site ? site.name : 'Décollage');

    const newRide: ShuttleRide = {
      id: `ride-${Date.now()}`,
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      departurePlace,
      destinationSiteId,
      destinationSiteName,
      departureTime,
      availableSeats: totalSeats,
      totalSeats,
      wingTypes: currentUser?.wingModel ? `${currentUser.wingModel} / Tout sac` : 'Solo / Tandem',
      passengers: [],
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    setRides([newRide, ...rides]);
    setShowModal(false);
    setComment('');
    setCustomSiteName('');

    // Auto-sync with Discord if configured
    const discordCfg = getStoredDiscordConfig();
    if ((discordCfg.botApiUrl || discordCfg.shuttleWebhookUrl) && discordCfg.autoSyncShuttles) {
      setSyncingRideId(newRide.id);
      sendShuttleToDiscord(newRide).then(res => {
        if (res.ok) {
          if (res.messageId) {
            setRides(prev => prev.map(r => r.id === newRide.id ? {
              ...r,
              discordMessageId: res.messageId,
              discordChannelId: res.channelId || r.discordChannelId,
              discordWebhookUrl: res.webhookUrlUsed,
              discordLastSyncedAt: new Date().toISOString()
            } : r));
          }
          if (res.botUsed) {
            showToast("🎉 Covoiturage publié sur Discord avec boutons [Je monte] directs !");
          } else {
            showToast("🚗 Covoiturage publié et synchronisé sur Discord !");
          }
        } else {
          showToast(`Alerte Discord : ${res.error || 'Erreur d\'envoi'}`);
        }
      }).catch(err => {
        console.error('Erreur synchronisation Discord navette:', err);
      }).finally(() => {
        setSyncingRideId(null);
      });
    } else {
      showToast("Covoiturage publié sur l'application !");
    }
  };

  const handleOpenJoinModal = (ride: ShuttleRide) => {
    if (ride.availableSeats <= 0) {
      showToast("Cette navette est déjà complète (0 place disponible) !");
      return;
    }
    const defaultName = currentUser ? (currentUser.fullName || currentUser.discordUsername || '') : '';
    setJoinPilotName(defaultName);
    setJoinModalRide(ride);
  };

  const handleConfirmJoin = async () => {
    if (!joinModalRide) return;
    const name = joinPilotName.trim();
    if (!name) {
      showToast("Veuillez saisir votre prénom ou pseudo pilote.");
      return;
    }

    if (joinModalRide.availableSeats <= 0) {
      showToast("Désolé, cette navette est déjà complète !");
      setJoinModalRide(null);
      return;
    }

    const updatedRide: ShuttleRide = {
      ...joinModalRide,
      availableSeats: joinModalRide.availableSeats - 1,
      passengers: [...joinModalRide.passengers, name],
      discordLastSyncedAt: new Date().toISOString()
    };

    // Update state & storage
    setRides(prev => prev.map(r => r.id === updatedRide.id ? updatedRide : r));
    setJoinModalRide(null);
    if (onClearHighlightedRide) onClearHighlightedRide();

    // In-place Discord sync (PATCH message without duplicate!)
    const discordCfg = getStoredDiscordConfig();
    if ((discordCfg.botApiUrl || discordCfg.shuttleWebhookUrl) && discordCfg.autoSyncShuttles) {
      setSyncingRideId(updatedRide.id);
      try {
        const syncRes = await syncShuttleWithDiscord(updatedRide);
        if (syncRes.ok) {
          if (syncRes.messageId) {
            setRides(prev => prev.map(r => r.id === updatedRide.id ? { 
              ...r, 
              discordMessageId: syncRes.messageId,
              discordChannelId: syncRes.channelId || r.discordChannelId 
            } : r));
          }
          if (syncRes.isPatched) {
            showToast(`✅ ${name} inscrit ! Message Discord mis à jour en direct (sans doublon).`);
          } else {
            showToast(`✅ ${name} inscrit et synchronisé sur Discord !`);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSyncingRideId(null);
      }
    } else {
      showToast(`✅ ${name} inscrit avec succès dans la navette !`);
    }
  };

  const handleLeaveRide = async (ride: ShuttleRide, passengerName: string) => {
    const updatedRide: ShuttleRide = {
      ...ride,
      availableSeats: Math.min(ride.totalSeats, ride.availableSeats + 1),
      passengers: ride.passengers.filter(p => p !== passengerName),
      discordLastSyncedAt: new Date().toISOString()
    };

    setRides(prev => prev.map(r => r.id === updatedRide.id ? updatedRide : r));

    // In-place Discord sync (PATCH)
    const discordCfg = getStoredDiscordConfig();
    if ((discordCfg.botApiUrl || discordCfg.shuttleWebhookUrl) && discordCfg.autoSyncShuttles) {
      setSyncingRideId(updatedRide.id);
      try {
        const syncRes = await syncShuttleWithDiscord(updatedRide);
        if (syncRes.ok) {
          showToast(`Place de ${passengerName} libérée. Message Discord actualisé en direct !`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSyncingRideId(null);
      }
    } else {
      showToast(`Place de ${passengerName} libérée.`);
    }
  };

  const handleManualSync = async (ride: ShuttleRide) => {
    setSyncingRideId(ride.id);
    try {
      const res = await syncShuttleWithDiscord(ride);
      if (res.ok) {
        if (res.messageId) {
          setRides(prev => prev.map(r => r.id === ride.id ? { 
            ...r, 
            discordMessageId: res.messageId,
            discordChannelId: res.channelId || r.discordChannelId,
            discordLastSyncedAt: new Date().toISOString() 
          } : r));
        }
        showToast(res.isPatched 
          ? "✅ Message Discord mis à jour en direct (sans doublon) !" 
          : "✅ Covoiturage synchronisé sur Discord avec succès !");
      } else {
        showToast(`Erreur Discord : ${res.error || 'Vérifiez la connexion Discord'}`);
      }
    } catch (err) {
      showToast("Impossible de synchroniser avec Discord.");
    } finally {
      setSyncingRideId(null);
    }
  };

  const handleDeleteRide = (ride: ShuttleRide) => {
    if (!isZelephMember(currentUser)) {
      if (onRequireMemberAuth) {
        onRequireMemberAuth("Seul le conducteur ou un administrateur peut supprimer une annonce.");
      }
      return;
    }
    setRideToDelete(ride);
  };

  const filteredRides = selectedSiteFilter === 'all'
    ? rides
    : selectedSiteFilter === 'custom'
      ? rides.filter(r => r.destinationSiteId === 'custom')
      : rides.filter(r => r.destinationSiteId === selectedSiteFilter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-sky-400">
              Coopération Membres Zéléph
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Covoit’ & <span className="font-bold text-sky-400">Navettes Décollage</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Optimisez les montées au décollage et réduisez les rotations de véhicules (Buisson-Rond, Saint-Alban, atterrissages).
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncWithBot}
            disabled={isSyncingFromBot}
            className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs sm:text-sm transition active:scale-95 shadow-lg shadow-emerald-500/10"
            title="Synchroniser immédiatement les covoiturages avec le Bot Discord (Render)"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingFromBot ? 'animate-spin' : ''}`} />
            <span>{isSyncingFromBot ? 'Synchro...' : 'Synchro Bot'}</span>
          </button>

          {onOpenDiscordModal && (
            <button
              onClick={onOpenDiscordModal}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#5865F2]/15 hover:bg-[#5865F2]/25 text-[#5865F2] hover:text-white border border-[#5865F2]/30 font-bold text-xs sm:text-sm transition active:scale-95 shadow-lg shadow-[#5865F2]/10"
              title="Configurer la passerelle Discord et synchroniser les covoiturages"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Passerelle Discord</span>
            </button>
          )}

          <button
            onClick={handleOpenModal}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xl transition-all active:scale-95 ${
              isZelephMember(currentUser)
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow-slate-900/50'
            }`}
            title={isZelephMember(currentUser) ? "Proposer une navette / un covoiturage" : "Mode Visiteur : connectez-vous avec Discord (statut Membre Z'éléph requis)"}
          >
            {isZelephMember(currentUser) ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
            <span>{isZelephMember(currentUser) ? 'Proposer une montée' : 'Connexion requise pour proposer'}</span>
          </button>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Member Profile Sync / Visitor Indicator */}
      {currentUser && isZelephMember(currentUser) ? (
        <div className="bg-slate-900/40 border border-emerald-500/20 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profil navette actif : <strong className="text-white">{currentUser.fullName}</strong> (@{currentUser.discordUsername})</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
              Membre Z'éléph ✓
            </span>
            {currentUser.phone && <span className="text-slate-400 font-mono hidden sm:inline">• {currentUser.phone}</span>}
            {currentUser.sector && <span className="text-slate-400 hidden md:inline">• Secteur {currentUser.sector}</span>}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Droits de publication actifs</span>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Mode Visiteur (Lecture seule) : Vous visualisez les navettes. Pour proposer une montée ou réserver, connectez-vous avec votre compte Discord (statut minimum : <strong>Membre Z'éléph</strong>).
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onRequireMemberAuth) {
                onRequireMemberAuth("Pour proposer ou réserver une navette, connectez-vous avec votre compte Discord avec le statut minimum 'Membre Z'éléph'.");
              } else if (onNavigateToMembers) {
                onNavigateToMembers();
              }
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-2 flex items-center gap-1 self-start sm:self-auto shrink-0"
          >
            <span>Se connecter avec Discord</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Filter by destination site */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest pl-1">Destination :</span>
        <button
          onClick={() => setSelectedSiteFilter('all')}
          className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
            selectedSiteFilter === 'all'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20'
              : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Tous les décollages
        </button>
        {ZELEPH_SITES.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSiteFilter(s.id)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
              selectedSiteFilter === s.id
                ? 'bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20'
                : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {s.name}
          </button>
        ))}
        <button
          onClick={() => setSelectedSiteFilter('custom')}
          className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
            selectedSiteFilter === 'custom'
              ? 'bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20'
              : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-purple-300 hover:bg-white/5'
          }`}
        >
          Sites extérieurs / Autres
        </button>
      </div>

      {/* Rides List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRides.map(ride => {
          const isFull = ride.availableSeats <= 0;
          const isCustomSite = ride.destinationSiteId === 'custom';
          return (
            <div
              key={ride.id}
              className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-white/20 transition-all"
            >
              <div>
                {/* Card Top: Destination & Time */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest block">
                        {ride.destinationSiteName}
                      </span>
                      {isCustomSite && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold uppercase tracking-wider">
                          Site extérieur
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-lg tracking-tight">
                      {ride.driverName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{ride.departureTime}</span>
                  </div>
                </div>

                {/* Departure Place */}
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="font-medium">{ride.departurePlace}</span>
                  </div>
                  {ride.driverPhone && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <a href={`tel:${ride.driverPhone}`} className="hover:text-emerald-300 font-mono">
                        {ride.driverPhone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Comment */}
                {ride.comment && (
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-white/5 mb-4 leading-relaxed">
                    "{ride.comment}"
                  </p>
                )}

                {/* Passenger list */}
                <div className="text-xs text-slate-400 mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[10px]">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Places restantes :</span>
                    </span>
                    <span className={`font-mono font-bold text-sm ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {ride.availableSeats} / {ride.totalSeats}
                    </span>
                  </div>

                  {ride.passengers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {ride.passengers.map((p, i) => (
                        <span 
                          key={i} 
                          className="bg-white/5 text-slate-200 text-[11px] px-2.5 py-1 rounded-lg border border-white/5 font-medium flex items-center gap-1.5 hover:bg-white/10 transition"
                        >
                          <span>{p}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLeaveRide(ride, p);
                            }}
                            className="text-slate-500 hover:text-rose-400 transition"
                            title={`Désinscrire ${p} et libérer la place`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Discord Sync Indicator & Action */}
                <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    {ride.discordMessageId ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Synchronisé Discord
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Non synchronisé</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleManualSync(ride)}
                    disabled={syncingRideId === ride.id}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-[10px] font-mono"
                    title="Mettre à jour le message Discord existant sans doublon"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncingRideId === ride.id ? 'animate-spin text-sky-400' : ''}`} />
                    <span>{ride.discordMessageId ? 'Sync Discord' : 'Publier'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDeleteRide(ride)}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Supprimer la navette"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenJoinModal(ride)}
                  disabled={isFull}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    isFull
                      ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20'
                  }`}
                >
                  {isFull ? (
                    <span>Complet</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      <span>Réserver une place (+1)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRides.length === 0 && (
        <div className="p-8 text-center bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 text-slate-400 text-sm">
          {selectedSiteFilter === 'custom'
            ? "Aucune navette vers un site extérieur pour le moment. Proposez la vôtre vers Saint-Hilaire, Annecy, Chamoux, ou un autre décollage !"
            : "Aucune navette pour ce décollage pour l'instant. Proposez-en une pour lancer la rotation du club !"}
        </div>
      )}

      {/* Modal: Proposer une navette */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-950 border border-white/10 p-6 sm:p-7 shadow-2xl text-slate-100 relative">
            <h3 className="text-xl font-light text-white mb-4">
              Proposer une <span className="font-bold text-sky-400">montée au décollage</span>
            </h3>

            <form onSubmit={handleCreateRide} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Votre nom / prénom (ou indicatif club) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Thomas G."
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="06 ..."
                    value={driverPhone}
                    onChange={e => setDriverPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Heure de départ prévue *
                  </label>
                  <input
                    type="time"
                    required
                    value={departureTime}
                    onChange={e => setDepartureTime(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Point de rendez-vous / départ *
                </label>
                <input
                  type="text"
                  required
                  value={departurePlace}
                  onChange={e => setDeparturePlace(e.target.value)}
                  placeholder="Ex: Parking Buisson-Rond, Rond-point Saint-Alban..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Décollage de destination *
                  </label>
                  <select
                    value={destinationSiteId}
                    onChange={e => setDestinationSiteId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-400"
                  >
                    <optgroup label="Sites du club & locaux">
                      {ZELEPH_SITES.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.massif})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Autre destination">
                      <option value="custom">Autre (renseigner manuellement...)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Places passagers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={totalSeats}
                    onChange={e => setTotalSeats(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>
              </div>

              {/* Champ conditionnel pour site personnalisé */}
              {destinationSiteId === 'custom' && (
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1.5">
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider">
                    Nom du décollage ou site extérieur *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Saint-Hilaire (Chartreuse), Montmin (Annecy), Chamoux, Aiguebelette Ouest..."
                    value={customSiteName}
                    onChange={e => setCustomSiteName(e.target.value)}
                    className="w-full bg-slate-900 border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  <p className="text-[11px] text-slate-400">
                    Indiquez le nom du site et éventuellement la commune ou le massif pour que les passagers sachent où vous vous rendez.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Commentaire / Détails
                </label>
                <input
                  type="text"
                  placeholder="Ex: Grand coffre, retour prévu après 18h..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 transition"
                >
                  Publier la navette
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app confirmation modal for deleting ride */}
      {rideToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl shrink-0 bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">
                  Supprimer la navette ?
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Voulez-vous retirer la navette vers <strong>{rideToDelete.destinationSiteName}</strong> ({rideToDelete.departureTime}) proposée par {rideToDelete.driverName} ?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRideToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setRides(prev => prev.filter(r => r.id !== rideToDelete.id));
                  setRideToDelete(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Join Shuttle Modal with prefilled name and live Discord PATCH sync */}
      {joinModalRide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Réserver une place en navette</h3>
                  <p className="text-xs text-sky-400 font-semibold">{joinModalRide.destinationSiteName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setJoinModalRide(null);
                  if (onClearHighlightedRide) onClearHighlightedRide();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Conducteur :</span>
                <span className="font-bold text-white">{joinModalRide.driverName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Heure de départ :</span>
                <span className="font-mono font-bold text-sky-300">{joinModalRide.departureTime}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Lieu de rendez-vous :</span>
                <span className="text-slate-200">{joinModalRide.departurePlace}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-white/5 font-semibold">
                <span>Places restantes :</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {joinModalRide.availableSeats} / {joinModalRide.totalSeats} places disponibles
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Votre nom, prénom ou pseudo Discord :
              </label>
              <input
                type="text"
                value={joinPilotName}
                onChange={(e) => setJoinPilotName(e.target.value)}
                placeholder="Ex: Jonathan R. ou votre pseudo Discord"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-sky-500 transition"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                ⚡ <strong>Synchronisation en direct :</strong> dès validation, le message Discord de cette navette sera automatiquement actualisé avec votre nom et le décompte des places restantes, <em>sans créer de doublon</em>.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setJoinModalRide(null);
                  if (onClearHighlightedRide) onClearHighlightedRide();
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmJoin}
                disabled={!joinPilotName.trim() || joinModalRide.availableSeats <= 0}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 disabled:opacity-50 transition"
              >
                Valider ma place (+1)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 border border-sky-500/40 text-sky-200 text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce-short">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
