import React, { useState, useEffect } from 'react';
import { ClubOuting, OutingCategory, ClubMemberProfile, OutingParticipant } from '../types';
import { INITIAL_OUTINGS } from '../data/outingsData';
import { INITIAL_CURRENT_USER } from '../data/membersData';
import { ZELEPH_SITES } from '../data/sitesData';
import { 
  CalendarDays, 
  Plus, 
  Users, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  AlertTriangle, 
  Compass, 
  Radio, 
  Settings, 
  UserPlus, 
  UserMinus,
  Sparkles,
  PhoneCall,
  Info,
  Trash2,
  ShieldCheck
} from 'lucide-react';

const STORAGE_OUTINGS_KEY = 'zeleph_club_outings_v1';
const STORAGE_PROFILE_KEY = 'zeleph_member_profile_v1';

const CATEGORY_STYLES: Record<OutingCategory, { label: string; badgeClass: string; borderClass: string; dotColor: string }> = {
  pioupiou: {
    label: 'Sortie Pioupiou / Débutant',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    borderClass: 'border-emerald-500/40',
    dotColor: 'bg-emerald-400'
  },
  marche_vol: {
    label: 'Sortie Marche & Vol',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    borderClass: 'border-purple-500/40',
    dotColor: 'bg-purple-400'
  },
  cross_debutant: {
    label: 'Cross Débutant',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    borderClass: 'border-sky-500/40',
    dotColor: 'bg-sky-400'
  },
  cross_inter: {
    label: 'Cross Intermédiaire',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    borderClass: 'border-amber-500/40',
    dotColor: 'bg-amber-400'
  },
  cross_expert: {
    label: 'Cross Expert',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    borderClass: 'border-rose-500/40',
    dotColor: 'bg-rose-400'
  },
  soaring: {
    label: 'Soaring du Soir & Restit',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    borderClass: 'border-cyan-500/40',
    dotColor: 'bg-cyan-400'
  },
  securite: {
    label: 'Sécurité & Secours',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    borderClass: 'border-blue-500/40',
    dotColor: 'bg-blue-400'
  },
  autre: {
    label: 'Sortie Club',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    borderClass: 'border-slate-500/40',
    dotColor: 'bg-slate-400'
  }
};

interface ClubOutingsCalendarProps {
  onNavigateToSite?: (siteId: string) => void;
}

export const ClubOutingsCalendar: React.FC<ClubOutingsCalendarProps> = ({ onNavigateToSite }) => {
  // Current user
  const [currentUser] = useState<ClubMemberProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.id === 'usr-zeleph-me' ||
          parsed.email?.toLowerCase().includes('roux.jonath') ||
          parsed.fullName?.toLowerCase().includes('jonathan') ||
          parsed.discordUsername?.toLowerCase().includes('jonathan')
        ) {
          parsed.isSuperAdmin = true;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CURRENT_USER;
  });

  // Outings state
  const [outings, setOutings] = useState<ClubOuting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_OUTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_OUTINGS;
  });

  // Calendar View Mode: 'jour' | 'semaine' | 'mois'
  const [viewMode, setViewMode] = useState<'jour' | 'semaine' | 'mois'>('mois');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [managingOuting, setManagingOuting] = useState<ClubOuting | null>(null);
  const [selectedOutingDetail, setSelectedOutingDetail] = useState<ClubOuting | null>(null);

  // In-app confirmation dialog & toast (works reliably in all iFrames)
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    isDanger: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // New Outing Form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<OutingCategory>('cross_inter');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00');
  const [newSiteId, setNewSiteId] = useState('verel');
  const [newMeetingPoint, setNewMeetingPoint] = useState('Atterrissage de Pragondran');
  const [newMinLevel, setNewMinLevel] = useState('Brevet de Pilote (autonome)');
  const [newGearRequired, setNewGearRequired] = useState('Radio 146.500 chargée, parachute de secours révisé, casque');
  const [newAerologyNotice, setNewAerologyNotice] = useState('Point météo confirmé 24h avant selon la nébulosité.');
  const [newMaxParticipants, setNewMaxParticipants] = useState(8);
  const [newDescription, setNewDescription] = useState('');

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_OUTINGS_KEY, JSON.stringify(outings));
    } catch (e) {
      console.error(e);
    }
  }, [outings]);

  // Handle Add Outing
  const handleCreateOuting = (e: React.FormEvent) => {
    e.preventDefault();
    const siteObj = ZELEPH_SITES.find(s => s.id === newSiteId);

    const created: ClubOuting = {
      id: `outing-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      typeLabel: CATEGORY_STYLES[newType].label,
      date: newDate,
      time: newTime,
      siteId: newSiteId,
      siteName: siteObj ? siteObj.name : 'Site Zéléph',
      meetingPoint: newMeetingPoint.trim(),
      organizerId: currentUser.id,
      organizerName: currentUser.fullName,
      organizerAvatar: currentUser.discordAvatarUrl,
      organizerPhone: currentUser.phone,
      organizerRole: currentUser.discordRole,
      conditionsRequired: {
        minPilotLevel: newMinLevel,
        gearRequired: newGearRequired.split(',').map(s => s.trim()).filter(Boolean),
        aerologyNotice: newAerologyNotice
      },
      maxParticipants: newMaxParticipants,
      participants: [
        {
          id: currentUser.id,
          name: currentUser.fullName,
          avatar: currentUser.discordAvatarUrl,
          discordRole: currentUser.discordRole,
          phone: currentUser.phone,
          wing: currentUser.wingModel,
          level: currentUser.pilotLevel,
          status: 'confirmed',
          joinedAt: new Date().toISOString()
        }
      ],
      status: 'confirmed',
      statusNote: 'Sortie ouverte aux inscriptions.',
      description: newDescription.trim(),
      createdAt: new Date().toISOString()
    };

    setOutings([created, ...outings]);
    setShowAddModal(false);
    // Reset fields
    setNewTitle('');
    setNewDescription('');
  };

  // Join or Leave Outing
  const handleToggleJoin = (outingId: string) => {
    setOutings(prev => prev.map(out => {
      if (out.id !== outingId) return out;
      const isAlreadyIn = out.participants.some(p => p.id === currentUser.id);

      if (isAlreadyIn) {
        // Leave
        return {
          ...out,
          participants: out.participants.filter(p => p.id !== currentUser.id)
        };
      } else {
        // Join
        if (out.participants.length >= out.maxParticipants) {
          showToast('Cette sortie est déjà complète !');
          return out;
        }
        const newPart: OutingParticipant = {
          id: currentUser.id,
          name: currentUser.fullName,
          avatar: currentUser.discordAvatarUrl,
          discordRole: currentUser.discordRole,
          phone: currentUser.phone,
          wing: currentUser.wingModel,
          level: currentUser.pilotLevel,
          status: 'confirmed',
          joinedAt: new Date().toISOString()
        };
        return {
          ...out,
          participants: [...out.participants, newPart]
        };
      }
    }));
  };

  // Organizer: Confirm/remove participant
  const handleRemoveParticipant = (outingId: string, participantId: string) => {
    setOutings(prev => prev.map(out => {
      if (out.id !== outingId) return out;
      return {
        ...out,
        participants: out.participants.filter(p => p.id !== participantId)
      };
    }));
    if (managingOuting && managingOuting.id === outingId) {
      setManagingOuting(prev => prev ? {
        ...prev,
        participants: prev.participants.filter(p => p.id !== participantId)
      } : null);
    }
  };

  const handleUpdateStatus = (outingId: string, newStatus: ClubOuting['status'], note?: string) => {
    setOutings(prev => prev.map(out => {
      if (out.id !== outingId) return out;
      return {
        ...out,
        status: newStatus,
        statusNote: note !== undefined ? note : out.statusNote
      };
    }));
    if (managingOuting && managingOuting.id === outingId) {
      setManagingOuting(prev => prev ? {
        ...prev,
        status: newStatus,
        statusNote: note !== undefined ? note : prev.statusNote
      } : null);
    }
  };

  // Super-Admin & Organizer Outing Deletion
  const handleDeleteOuting = (outingId: string, outingTitle: string) => {
    const targetOuting = outings.find(o => o.id === outingId);
    const isAllowed = currentUser.isSuperAdmin || (targetOuting && targetOuting.organizerId === currentUser.id);

    if (!isAllowed) {
      showToast("Action réservée à l'organisateur de la sortie ou au Super-Administrateur (Jonathan ROUX).");
      return;
    }

    setConfirmModal({
      title: `Supprimer "${outingTitle}" ?`,
      message: `Êtes-vous certain de vouloir supprimer définitivement cette sortie club ? Cette action est immédiate et la sortie sera retirée du calendrier.`,
      confirmLabel: "Supprimer la sortie",
      isDanger: true,
      onConfirm: () => {
        setOutings(prev => {
          const updated = prev.filter(o => o.id !== outingId);
          try {
            localStorage.setItem(STORAGE_OUTINGS_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
          return updated;
        });

        if (managingOuting && managingOuting.id === outingId) {
          setManagingOuting(null);
        }
        if (selectedOutingDetail && selectedOutingDetail.id === outingId) {
          setSelectedOutingDetail(null);
        }
        showToast(`La sortie "${outingTitle}" a été supprimée.`);
        setConfirmModal(null);
      }
    });
  };

  const handlePurgeSampleOutings = () => {
    if (!currentUser.isSuperAdmin) return;
    const sampleIds = ['out-1', 'out-2', 'out-3', 'out-4'];
    const count = outings.filter(o => sampleIds.includes(o.id)).length;
    if (count === 0) {
      showToast("Toutes les sorties créées pour l'exemple ont déjà été supprimées.");
      return;
    }

    setConfirmModal({
      title: "Purger les sorties d'exemple",
      message: `Voulez-vous supprimer immédiatement les ${count} sorties d'exemple de démonstration ? Seules vos sorties créées manuellement seront conservées.`,
      confirmLabel: `Purger les ${count} sorties d'exemple`,
      isDanger: true,
      onConfirm: () => {
        setOutings(prev => {
          const updated = prev.filter(o => !sampleIds.includes(o.id));
          try {
            localStorage.setItem(STORAGE_OUTINGS_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
          return updated;
        });
        setManagingOuting(null);
        setSelectedOutingDetail(null);
        showToast("Les sorties de démonstration ont été supprimées.");
        setConfirmModal(null);
      }
    });
  };

  const handleResetSampleOutings = () => {
    if (!currentUser.isSuperAdmin) return;
    setConfirmModal({
      title: "Rétablir les sorties d'exemple",
      message: "Voulez-vous réinitialiser le calendrier avec les sorties de démonstration initiales ?",
      confirmLabel: "Rétablir les sorties",
      isDanger: false,
      onConfirm: () => {
        setOutings(INITIAL_OUTINGS);
        try {
          localStorage.setItem(STORAGE_OUTINGS_KEY, JSON.stringify(INITIAL_OUTINGS));
        } catch (e) {
          console.error(e);
        }
        showToast("Les sorties d'exemple ont été rétablies.");
        setConfirmModal(null);
      }
    });
  };

  // Next 5 upcoming outings (as explicitly requested)
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingFiveOutings = [...outings]
    .filter(out => out.date >= todayStr && out.status !== 'cancelled')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);

  // Month navigation helpers
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDayOfMonth.getDate();

  const prevPeriod = () => {
    if (viewMode === 'mois') {
      setSelectedDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'semaine') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 7);
      setSelectedDate(d);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      setSelectedDate(d);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'mois') {
      setSelectedDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'semaine') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 7);
      setSelectedDate(d);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      setSelectedDate(d);
    }
  };

  const setToday = () => {
    setSelectedDate(new Date());
  };

  // Week days calculation
  const getWeekDays = (curr: Date) => {
    const d = new Date(curr);
    const day = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - day);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const wDay = new Date(d);
      wDay.setDate(d.getDate() + i);
      week.push(wDay);
    }
    return week;
  };

  const currentWeekDays = getWeekDays(selectedDate);

  // Month name
  const monthName = selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Agenda & Sorties Vol Libre</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              Calendrier des <span className="font-bold text-sky-400">Sorties Club Zéléph</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Proposez et rejoignez les sorties du club : sessions Pioupiou, Marche & Vol, Cross tous niveaux ou soaring du soir au Sire et à Vérel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-xl shadow-sky-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Proposer une sortie club</span>
            </button>
          </div>
        </div>

        {/* Subtle AI & Weather Notice */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Rappel sécurité : Les sorties sont organisées sous la responsabilité des participants. Les prévisions et indices aérologiques restent indicatifs et ne remplacent jamais l'analyse in situ de la masse d'air par le pilote.
          </span>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Super-Admin Outings Administration Panel (Jonathan ROUX) */}
      {currentUser.isSuperAdmin && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-sky-950/40 border border-amber-500/30 shadow-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-white tracking-wide">
                    Administration Sorties Club • Jonathan ROUX
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">
                    Droits Super-Admin
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Gérez l'agenda du club : supprimez n'importe quelle sortie, gérez les inscrits ou purgez les sorties créées pour la démonstration.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePurgeSampleOutings}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-500/10"
                title="Supprimer toutes les sorties créées pour l'exemple"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Purger les sorties d'exemple</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle sortie</span>
              </button>

              <button
                type="button"
                onClick={handleResetSampleOutings}
                className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-medium transition"
                title="Rétablir les sorties de démonstration"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Controls & Navigation Bar */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* View Modes Switch: Jour / Semaine / Mois */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-white/10 w-fit">
            <button
              onClick={() => setViewMode('jour')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'jour' 
                  ? 'bg-sky-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setViewMode('semaine')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'semaine' 
                  ? 'bg-sky-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('mois')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'mois' 
                  ? 'bg-sky-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mois
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevPeriod}
              className="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={setToday}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs font-semibold text-sky-400 hover:bg-slate-900 transition"
            >
              Aujourd'hui
            </button>

            <button
              onClick={nextPeriod}
              className="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-white/10 font-bold text-xs sm:text-sm text-white capitalize min-w-[140px] text-center">
              {viewMode === 'jour' 
                ? selectedDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
                : monthName
              }
            </div>
          </div>

          {/* Filter by Category */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
            >
              <option value="all">Tous les types de sortie</option>
              <option value="pioupiou">Sortie Pioupiou / Débutant</option>
              <option value="marche_vol">Sortie Marche & Vol</option>
              <option value="cross_debutant">Cross Débutant</option>
              <option value="cross_inter">Cross Intermédiaire</option>
              <option value="cross_expert">Cross Expert</option>
              <option value="soaring">Soaring du Soir & Restit</option>
            </select>
          </div>
        </div>

        {/* 1. MONTH VIEW */}
        {viewMode === 'mois' && (
          <div className="space-y-2 pt-2">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1 border-b border-white/5">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mer</span>
              <span>Jeu</span>
              <span>Ven</span>
              <span>Sam</span>
              <span>Dim</span>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Empty padding cells for starting day */}
              {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-2xl bg-slate-950/20 border border-white/5 opacity-40"></div>
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isToday = dStr === todayStr;
                const dayOutings = outings.filter(o => o.date === dStr && (selectedCategoryFilter === 'all' || o.type === selectedCategoryFilter));

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => {
                      setSelectedDate(new Date(year, month, dayNum));
                      if (dayOutings.length > 0) {
                        setViewMode('jour');
                      }
                    }}
                    className={`h-24 sm:h-28 p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                      isToday
                        ? 'bg-sky-500/10 border-sky-400/50 ring-1 ring-sky-400/30'
                        : dayOutings.length > 0
                        ? 'bg-slate-950/80 border-white/10 hover:border-sky-400/40'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold ${isToday ? 'text-sky-400' : 'text-slate-300'}`}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-mono uppercase px-1 rounded bg-sky-500/20 text-sky-300">
                          Auj
                        </span>
                      )}
                    </div>

                    {/* Outing Badges in Day Cell */}
                    <div className="space-y-1 overflow-hidden">
                      {dayOutings.slice(0, 2).map(out => {
                        const style = CATEGORY_STYLES[out.type] || CATEGORY_STYLES.autre;
                        return (
                          <div 
                            key={out.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOutingDetail(out);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border flex items-center gap-1 ${style.badgeClass}`}
                            title={`${out.time} - ${out.title}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor} shrink-0`}></span>
                            <span className="truncate">{out.time} {out.title}</span>
                          </div>
                        );
                      })}
                      {dayOutings.length > 2 && (
                        <span className="text-[9px] font-mono text-slate-400 block px-1">
                          +{dayOutings.length - 2} autre(s)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. WEEK VIEW */}
        {viewMode === 'semaine' && (
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 pt-2">
            {currentWeekDays.map((wDay, idx) => {
              const dStr = wDay.toISOString().split('T')[0];
              const isToday = dStr === todayStr;
              const dayOutings = outings.filter(o => o.date === dStr && (selectedCategoryFilter === 'all' || o.type === selectedCategoryFilter));

              return (
                <div 
                  key={idx}
                  className={`p-3 rounded-2xl border flex flex-col ${
                    isToday ? 'bg-sky-500/10 border-sky-400/40 ring-1 ring-sky-400/20' : 'bg-slate-950/60 border-white/5'
                  }`}
                >
                  <div className="text-center pb-2 mb-2 border-b border-white/5">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                      {wDay.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </span>
                    <span className={`text-base font-bold font-mono ${isToday ? 'text-sky-400' : 'text-white'}`}>
                      {wDay.getDate()}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {dayOutings.length === 0 ? (
                      <span className="text-[11px] text-slate-500 text-center block pt-4 italic">
                        Aucune sortie
                      </span>
                    ) : (
                      dayOutings.map(out => {
                        const style = CATEGORY_STYLES[out.type] || CATEGORY_STYLES.autre;
                        return (
                          <div 
                            key={out.id}
                            onClick={() => setSelectedOutingDetail(out)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] ${style.badgeClass}`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                              <span>{out.time}</span>
                              <span>{out.participants.length}/{out.maxParticipants}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                              {out.title}
                            </h4>
                            <div className="text-[10px] text-slate-300 mt-1 truncate flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{out.siteName}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. DAY VIEW */}
        {viewMode === 'jour' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-white capitalize">
                Programme du {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
            </div>

            {(() => {
              const dStr = selectedDate.toISOString().split('T')[0];
              const dayOutings = outings.filter(o => o.date === dStr && (selectedCategoryFilter === 'all' || o.type === selectedCategoryFilter));

              if (dayOutings.length === 0) {
                return (
                  <div className="p-8 text-center rounded-3xl bg-slate-950/40 border border-white/5 space-y-3">
                    <CalendarDays className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs sm:text-sm text-slate-400">
                      Aucune sortie club n'est programmée pour cette journée.
                    </p>
                    <button
                      onClick={() => {
                        setNewDate(dStr);
                        setShowAddModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold"
                    >
                      + Proposer un vol pour cette date
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayOutings.map(out => {
                    const style = CATEGORY_STYLES[out.type] || CATEGORY_STYLES.autre;
                    const isJoined = out.participants.some(p => p.id === currentUser.id);
                    const isOrganizer = out.organizerId === currentUser.id;

                    return (
                      <div 
                        key={out.id}
                        className="p-5 rounded-3xl bg-slate-950/80 border border-white/10 space-y-4 shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${style.badgeClass}`}>
                              {style.label}
                            </span>
                            <h3 className="text-base font-bold text-white tracking-tight mt-1.5">
                              {out.title}
                            </h3>
                          </div>
                          <span className="font-mono text-sm font-bold text-sky-400 bg-white/5 px-2.5 py-1 rounded-xl">
                            {out.time}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                          <div className="p-2 rounded-xl bg-white/5">
                            <span className="text-[10px] text-slate-400 block">Site de vol</span>
                            <span className="font-bold text-white">{out.siteName}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/5">
                            <span className="text-[10px] text-slate-400 block">Rendez-vous</span>
                            <span className="font-bold text-white truncate block">{out.meetingPoint}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {out.description}
                        </p>

                        {/* Conditions */}
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                          <span className="font-bold flex items-center gap-1.5 text-amber-300">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Conditions requises :</span>
                          </span>
                          <p>{out.conditionsRequired.minPilotLevel}</p>
                          <div className="text-[11px] text-amber-200/80">
                            Matériel : {out.conditionsRequired.gearRequired.join(' • ')}
                          </div>
                        </div>

                        {/* Participants & Action */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-sky-400" />
                            <span className="text-xs font-mono text-slate-300">
                              {out.participants.length}/{out.maxParticipants} inscrits
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {(isOrganizer || currentUser.isSuperAdmin) && (
                              <button
                                onClick={() => setManagingOuting(out)}
                                className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold"
                              >
                                Gérer {currentUser.isSuperAdmin && !isOrganizer ? '(Admin)' : ''}
                              </button>
                            )}
                            {currentUser.isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteOuting(out.id, out.title)}
                                className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs transition"
                                title="Supprimer la sortie (Action Super-Admin Jonathan ROUX)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleJoin(out.id)}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                                isJoined
                                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md'
                              }`}
                            >
                              {isJoined ? 'Se désister' : 'Rejoindre'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: 5 NEXT UPCOMING OUTINGS (As explicitly requested) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Les 5 Prochaines Sorties Club
              </h2>
              <p className="text-xs text-slate-400">
                Inscrivez-vous dès maintenant pour organiser le covoiturage et les rotations.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/5 hidden sm:inline-block">
            {upcomingFiveOutings.length} sortie(s) à venir
          </span>
        </div>

        <div className="space-y-3.5">
          {upcomingFiveOutings.map((outing) => {
            const style = CATEGORY_STYLES[outing.type] || CATEGORY_STYLES.autre;
            const isJoined = outing.participants.some(p => p.id === currentUser.id);
            const isOrganizer = outing.organizerId === currentUser.id;
            const placesLeft = Math.max(0, outing.maxParticipants - outing.participants.length);

            // Format readable date
            const dateObj = new Date(outing.date + 'T12:00:00Z');
            const dateLabel = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

            return (
              <div
                key={outing.id}
                className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 transition-all hover:border-white/20 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left info column */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Date & Time pill */}
                    <div className="px-3 py-1 rounded-xl bg-slate-950 text-white font-mono text-xs font-bold border border-white/10 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>{dateLabel} • {outing.time}</span>
                    </div>

                    {/* Category */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${style.badgeClass}`}>
                      {style.label}
                    </span>

                    {/* Status badge */}
                    {outing.status === 'weather_pending' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                        Météo à confirmer
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {outing.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                      <span className="flex items-center gap-1 text-sky-300">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        <strong>{outing.siteName}</strong>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">RDV : {outing.meetingPoint}</span>
                    </div>
                  </div>

                  {/* Conditions & Level */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-white/5 text-amber-300 font-medium">
                      Niveau : <strong>{outing.conditionsRequired.minPilotLevel}</strong>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Équipements : {outing.conditionsRequired.gearRequired.join(', ')}
                    </span>
                  </div>

                  {/* Organizer info */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                    <img 
                      src={outing.organizerAvatar} 
                      alt={outing.organizerName} 
                      className="w-5 h-5 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <span>Organisé par <strong className="text-white">{outing.organizerName}</strong> ({outing.organizerRole})</span>
                    {outing.organizerPhone && (
                      <span className="font-mono text-slate-400 hidden sm:inline">• {outing.organizerPhone}</span>
                    )}
                  </div>
                </div>

                {/* Right actions column */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  {/* Participants Avatars */}
                  <div className="space-y-1 text-left lg:text-right">
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-2 overflow-hidden">
                        {outing.participants.slice(0, 5).map((p, idx) => (
                          <img
                            key={idx}
                            src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={p.name}
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 object-cover"
                            title={`${p.name} (${p.wing || 'Pilote'})`}
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold text-white ml-1">
                        {outing.participants.length}/{outing.maxParticipants}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {placesLeft > 0 ? `${placesLeft} place(s) disponible(s)` : 'Sortie complète'}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {(isOrganizer || currentUser.isSuperAdmin) && (
                      <button
                        onClick={() => setManagingOuting(outing)}
                        className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Gérer {currentUser.isSuperAdmin && !isOrganizer ? '(Admin)' : ''} ({outing.participants.length})</span>
                      </button>
                    )}

                    {currentUser.isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteOuting(outing.id, outing.title)}
                        className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition shadow-sm"
                        title="Supprimer cette sortie (Action Super-Admin Jonathan ROUX)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleJoin(outing.id)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex-1 sm:flex-none shadow-lg ${
                        isJoined
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                          : placesLeft === 0
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
                      }`}
                    >
                      {isJoined ? 'Se désister' : 'Rejoindre la sortie'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal 1: Add New Outing */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Proposer une nouvelle sortie club
                  </h3>
                  <p className="text-xs text-slate-400">
                    Organisateur : {currentUser.fullName} ({currentUser.discordRole})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOuting} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Titre de la sortie
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Soaring et restit du soir au Sire, Cross matinal à Montlambert..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Type de sortie
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as OutingCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="pioupiou">Sortie Pioupiou / Débutant</option>
                    <option value="marche_vol">Sortie Marche & Vol (Trotte & Vol)</option>
                    <option value="cross_debutant">Cross Débutant</option>
                    <option value="cross_inter">Cross Intermédiaire</option>
                    <option value="cross_expert">Cross Expert</option>
                    <option value="soaring">Soaring du Soir & Restitution</option>
                    <option value="securite">Sécurité & Pliage Secours</option>
                    <option value="autre">Autre vol club</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Site de vol Zéléph
                  </label>
                  <select
                    value={newSiteId}
                    onChange={e => {
                      setNewSiteId(e.target.value);
                      const site = ZELEPH_SITES.find(s => s.id === e.target.value);
                      if (site) setNewMeetingPoint(`Atterrissage de ${site.name}`);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    {ZELEPH_SITES.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.massif})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Date de la sortie
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Heure de rendez-vous
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Lieu précis de rendez-vous
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Parking atterro de Pragondran..."
                    value={newMeetingPoint}
                    onChange={e => setNewMeetingPoint(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nombre maximum de pilotes
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={newMaxParticipants}
                    onChange={e => setNewMaxParticipants(parseInt(e.target.value) || 8)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Conditions */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  Conditions Requises & Niveau
                </span>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Niveau minimum requis</label>
                  <input
                    type="text"
                    placeholder="Ex: Brevet Initial, Brevet de Pilote, BPC, Autonomie décollage falaise..."
                    value={newMinLevel}
                    onChange={e => setNewMinLevel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Matériel obligatoire (séparé par virgules)</label>
                  <input
                    type="text"
                    placeholder="Radio 146.500 MHz, Secours révisé, Casque, Vario..."
                    value={newGearRequired}
                    onChange={e => setNewGearRequired(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Critères météo / Notice aérologique</label>
                  <input
                    type="text"
                    placeholder="Ex: Pas de vent météo > 15 km/h, point la veille à 20h sur Discord..."
                    value={newAerologyNotice}
                    onChange={e => setNewAerologyNotice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description & consignes de vol
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Expliquez le programme du vol, l'objectif du cross, les transitions prévues, le plan de covoiturage..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  Publier la sortie club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Manage Outing Members (For Organizer) */}
      {managingOuting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">
                  Gestion Organisateur
                </div>
                <h3 className="text-base font-bold text-white">
                  {managingOuting.title}
                </h3>
              </div>
              <button
                onClick={() => setManagingOuting(null)}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
              {/* Change status */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Statut de la sortie
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(managingOuting.id, 'confirmed')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      managingOuting.status === 'confirmed'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950 border-white/5 text-slate-400'
                    }`}
                  >
                    Confirmée
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(managingOuting.id, 'weather_pending')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      managingOuting.status === 'weather_pending'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-white/5 text-slate-400'
                    }`}
                  >
                    Attente Météo
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(managingOuting.id, 'cancelled')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      managingOuting.status === 'cancelled'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                        : 'bg-slate-950 border-white/5 text-slate-400'
                    }`}
                  >
                    Annulée
                  </button>
                </div>
              </div>

              {/* Participants list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Pilotes Inscrits ({managingOuting.participants.length} / {managingOuting.maxParticipants})</span>
                </div>

                {managingOuting.participants.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Aucun inscrit pour le moment.</p>
                ) : (
                  <div className="space-y-2">
                    {managingOuting.participants.map(p => (
                      <div 
                        key={p.id}
                        className="p-3 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                            alt={p.name}
                            className="w-9 h-9 rounded-xl object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{p.name}</span>
                              {p.id === managingOuting.organizerId && (
                                <span className="text-[10px] text-purple-400 font-mono">(Orga)</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {p.wing || 'Voile non précisée'} {p.phone ? `• ${p.phone}` : ''}
                            </div>
                          </div>
                        </div>

                        {p.id !== managingOuting.organizerId && (
                          <button
                            onClick={() => handleRemoveParticipant(managingOuting.id, p.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold"
                            title="Retirer ce pilote"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Danger Zone: Delete Outing */}
              {(currentUser.isSuperAdmin || managingOuting.organizerId === currentUser.id) && (
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20">
                  <div>
                    <span className="text-xs font-bold text-rose-300 block">Suppression de la sortie</span>
                    <span className="text-[11px] text-slate-400">Cette action annulera et supprimera l'événement pour tous les inscrits.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteOuting(managingOuting.id, managingOuting.title)}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer la sortie {currentUser.isSuperAdmin ? '(Super-Admin)' : ''}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Outing Details */}
      {selectedOutingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                  {selectedOutingDetail.typeLabel}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedOutingDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOutingDetail(null)}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 space-y-2 text-xs text-slate-300">
              <div><strong>Date & Heure :</strong> {selectedOutingDetail.date} à {selectedOutingDetail.time}</div>
              <div><strong>Site :</strong> {selectedOutingDetail.siteName}</div>
              <div><strong>RDV :</strong> {selectedOutingDetail.meetingPoint}</div>
              <div><strong>Niveau min :</strong> {selectedOutingDetail.conditionsRequired.minPilotLevel}</div>
              <div><strong>Organisateur :</strong> {selectedOutingDetail.organizerName} ({selectedOutingDetail.organizerPhone})</div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedOutingDetail.description}
            </p>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
              {(currentUser.isSuperAdmin || selectedOutingDetail.organizerId === currentUser.id) ? (
                <button
                  type="button"
                  onClick={() => handleDeleteOuting(selectedOutingDetail.id, selectedOutingDetail.title)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer {currentUser.isSuperAdmin ? '(Admin)' : ''}</span>
                </button>
              ) : <div />}

              <button
                onClick={() => {
                  handleToggleJoin(selectedOutingDetail.id);
                  setSelectedOutingDetail(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold"
              >
                {selectedOutingDetail.participants.some(p => p.id === currentUser.id) ? 'Se désister' : 'Rejoindre cette sortie'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl shrink-0 ${confirmModal.isDanger ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'}`}>
                {confirmModal.isDanger ? <Trash2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg ${
                  confirmModal.isDanger
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
                }`}
              >
                {confirmModal.isDanger && <Trash2 className="w-3.5 h-3.5" />}
                <span>{confirmModal.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-sky-500/40 shadow-2xl text-xs text-white animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>{notificationToast}</span>
        </div>
      )}
    </div>
  );
};
