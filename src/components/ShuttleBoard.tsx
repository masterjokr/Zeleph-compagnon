import React, { useState, useEffect } from 'react';
import { ShuttleRide, ClubMemberProfile } from '../types';
import { ZELEPH_SITES } from '../data/sitesData';
import { INITIAL_CURRENT_USER } from '../data/membersData';
import { Car, Plus, Users, Clock, MapPin, Check, MessageSquare, PhoneCall, Trash2, UserCheck, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'zeleph_shuttle_rides_v1';
const STORAGE_PROFILE_KEY = 'zeleph_member_profile_v1';

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

export const ShuttleBoard: React.FC = () => {
  const [currentUser] = useState<ClubMemberProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CURRENT_USER;
  });

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
  const [driverName, setDriverName] = useState(currentUser.fullName || '');
  const [driverPhone, setDriverPhone] = useState(currentUser.phone || '');
  const [departurePlace, setDeparturePlace] = useState(currentUser.sector ? `Lieu de RDV (${currentUser.sector})` : 'Piscine Buisson-Rond (Chambéry)');
  const [destinationSiteId, setDestinationSiteId] = useState('verel');
  const [departureTime, setDepartureTime] = useState('14:30');
  const [totalSeats, setTotalSeats] = useState(currentUser.availableSeats || 3);
  const [comment, setComment] = useState('');
  const [rideToDelete, setRideToDelete] = useState<ShuttleRide | null>(null);

  // When modal opens, sync with current user profile
  const handleOpenModal = () => {
    setDriverName(currentUser.fullName);
    setDriverPhone(currentUser.phone);
    setTotalSeats(currentUser.availableSeats || 3);
    if (currentUser.sector) {
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

  const handleCreateRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) return;

    const site = ZELEPH_SITES.find(s => s.id === destinationSiteId);
    const newRide: ShuttleRide = {
      id: `ride-${Date.now()}`,
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      departurePlace,
      destinationSiteId,
      destinationSiteName: site ? site.name : 'Décollage',
      departureTime,
      availableSeats: totalSeats,
      totalSeats,
      wingTypes: currentUser.wingModel ? `${currentUser.wingModel} / Tout sac` : 'Solo / Tandem',
      passengers: [],
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    setRides([newRide, ...rides]);
    setShowModal(false);
    setComment('');
  };

  const handleJoinRide = (rideId: string) => {
    const defaultName = currentUser.fullName || currentUser.discordUsername;
    const pilotName = window.prompt(`Confirmer votre place dans la navette sous le nom de :`, defaultName);
    if (!pilotName || !pilotName.trim()) return;

    setRides(prev => prev.map(r => {
      if (r.id === rideId && r.availableSeats > 0) {
        return {
          ...r,
          availableSeats: r.availableSeats - 1,
          passengers: [...r.passengers, pilotName.trim()]
        };
      }
      return r;
    }));
  };

  const handleDeleteRide = (ride: ShuttleRide) => {
    setRideToDelete(ride);
  };

  const filteredRides = selectedSiteFilter === 'all'
    ? rides
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

        <button
          onClick={handleOpenModal}
          className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-sky-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Proposer une montée</span>
        </button>

        {/* Ambient subtle glow */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Member Profile Sync Indicator */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Profil navette actif : <strong className="text-white">{currentUser.fullName}</strong> (@{currentUser.discordUsername})</span>
          {currentUser.phone && <span className="text-slate-400 font-mono hidden sm:inline">• {currentUser.phone}</span>}
          {currentUser.sector && <span className="text-slate-400 hidden md:inline">• Secteur {currentUser.sector}</span>}
        </div>
        <span className="text-[11px] text-sky-400 font-medium">Synchronisé avec Espace Membres</span>
      </div>

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
      </div>

      {/* Rides List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRides.map(ride => {
          const isFull = ride.availableSeats <= 0;
          return (
            <div
              key={ride.id}
              className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-white/20 transition-all"
            >
              <div>
                {/* Card Top: Destination & Time */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest block mb-0.5">
                      {ride.destinationSiteName}
                    </span>
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
                        <span key={i} className="bg-white/5 text-slate-200 text-[11px] px-2.5 py-0.5 rounded-lg border border-white/5 font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleDeleteRide(ride)}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Supprimer la navette"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleJoinRide(ride.id)}
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
          Aucune navette pour ce décollage pour l'instant. Proposez-en une pour lancer la rotation du club !
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
                    {ZELEPH_SITES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
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
    </div>
  );
};
