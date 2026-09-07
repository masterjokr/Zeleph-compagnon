import React, { useState, useEffect } from 'react';
import { ClubMemberProfile, PilotLevel, LiveTrackingPlatform } from '../types';
import { INITIAL_CURRENT_USER, CLUB_DIRECTORY } from '../data/membersData';
import { 
  Users, 
  UserCheck, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Shield, 
  Radio, 
  Sparkles, 
  Check, 
  X, 
  Search, 
  ExternalLink, 
  Compass, 
  AlertCircle, 
  LogIn, 
  Globe, 
  ArrowUpRight, 
  ShieldCheck, 
  Trash2, 
  UserPlus, 
  LogOut, 
  Crown, 
  Share2, 
  Navigation, 
  Wind,
  Camera,
  Upload,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { isZelephMember } from '../utils/authUtils';
import { 
  isSuperAdminEmail, 
  SUPER_ADMIN_GOOGLE_EMAIL 
} from '../utils/adminGoogleAuth';
import { 
  savePilotProfile, 
  getStoredClubDirectory, 
  getSavedProfileByEmail,
  deleteClubMember,
  deleteAllExampleMembers
} from '../utils/storageService';

interface MembersSpaceProps {
  currentUser: ClubMemberProfile | null;
  onLogin: (profile: ClubMemberProfile) => void;
  onLogout: () => void;
  onNavigateToShuttles?: () => void;
  onNavigateToOutings?: () => void;
}

export const MembersSpace: React.FC<MembersSpaceProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onNavigateToShuttles,
  onNavigateToOutings
}) => {
  // Directory state loaded from storageService
  const [directory, setDirectory] = useState<ClubMemberProfile[]>(() => {
    return getStoredClubDirectory();
  });

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');

  // Profile Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ClubMemberProfile>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deletion modals state
  const [memberToDelete, setMemberToDelete] = useState<ClubMemberProfile | null>(null);
  const [showPurgeExamplesModal, setShowPurgeExamplesModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmDeleteMember = () => {
    if (!memberToDelete) return;
    const targetName = memberToDelete.fullName;
    const isSelf = currentUser?.id === memberToDelete.id;
    const updated = deleteClubMember(memberToDelete.id);
    setDirectory(updated);
    setMemberToDelete(null);

    if (isSelf) {
      onLogout();
      showToast(`Votre profil (${targetName}) a été supprimé de la base de données.`);
    } else {
      showToast(`Le membre "${targetName}" a bien été retiré de l'annuaire du club.`);
    }
  };

  const handleConfirmPurgeExamples = () => {
    const updated = deleteAllExampleMembers();
    setDirectory(updated);
    setShowPurgeExamplesModal(false);
    showToast("Tous les profils d'exemples ont été supprimés de l'annuaire !");
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("L'image est trop volumineuse (maximum 5 Mo).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setEditForm(prev => ({ ...prev, avatarUrl: dataUrl }));
      showToast("Photo chargée ! Pensez à enregistrer pour valider.");
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEdit = () => {
    if (currentUser) {
      setEditForm({ ...currentUser });
    } else {
      setEditForm({
        id: `usr-google-${Date.now()}`,
        fullName: '',
        email: '',
        googleEmail: '',
        role: "Pilote Club • Les Z'éléphants Volants",
        pilotLevel: 'Brevet Initial (Autonome sur site calme)',
        wingModel: '',
        wingColor: '',
        harness: '',
        sector: 'Chambéry & Bassin',
        vehicleInfo: '',
        availableSeats: 2,
        emergencyContactName: '',
        emergencyContactPhone: '',
        radioFrequency: '146.500 MHz (Club Zéléph)',
        bio: '',
        isGoogleConnected: true,
        isGoogleVerified: true,
        isSuperAdmin: false,
        joinedClubYear: new Date().getFullYear(),
        liveTrackingPlatform: 'puretrack',
        liveTrackingId: '',
        shareLiveTracking: true
      });
    }
    setIsEditOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.fullName?.trim()) {
      showToast("Veuillez renseigner votre nom complet.");
      return;
    }

    const email = editForm.googleEmail?.trim() || editForm.email?.trim() || '';
    const isSuper = isSuperAdminEmail(email);

    const updatedProfile: ClubMemberProfile = {
      id: editForm.id || `usr-${Date.now()}`,
      fullName: editForm.fullName.trim(),
      email: email,
      googleEmail: email,
      phone: editForm.phone?.trim() || '',
      role: isSuper ? "Super-Administrateur Club • Les Z’éléphants Volants" : (editForm.role || "Pilote Club"),
      pilotLevel: (editForm.pilotLevel as PilotLevel) || 'Brevet de Pilote (Tous sites)',
      wingModel: editForm.wingModel?.trim() || '',
      wingColor: editForm.wingColor?.trim() || '',
      harness: editForm.harness?.trim() || '',
      sector: editForm.sector?.trim() || 'Chambéry',
      vehicleInfo: editForm.vehicleInfo?.trim() || '',
      availableSeats: typeof editForm.availableSeats === 'number' ? editForm.availableSeats : 2,
      emergencyContactName: editForm.emergencyContactName?.trim() || '',
      emergencyContactPhone: editForm.emergencyContactPhone?.trim() || '',
      radioFrequency: editForm.radioFrequency?.trim() || '146.500 MHz',
      bio: editForm.bio?.trim() || '',
      avatarUrl: editForm.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isGoogleConnected: true,
      isGoogleVerified: true,
      isSuperAdmin: isSuper,
      joinedClubYear: editForm.joinedClubYear || new Date().getFullYear(),
      liveTrackingPlatform: editForm.liveTrackingPlatform || 'puretrack',
      liveTrackingId: editForm.liveTrackingId?.trim() || '',
      shareLiveTracking: editForm.shareLiveTracking ?? true
    };

    // Save to persistent database
    savePilotProfile(updatedProfile);

    // Notify app state
    onLogin(updatedProfile);

    // Refresh directory from persistent database
    setDirectory(getStoredClubDirectory());

    setIsEditOpen(false);
    showToast("Votre fiche pilote et votre photo ont été enregistrées dans la base de données !");
  };

  const filteredDirectory = directory.filter(member => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !q || 
      member.fullName.toLowerCase().includes(q) ||
      member.wingModel.toLowerCase().includes(q) ||
      member.sector.toLowerCase().includes(q) ||
      (member.liveTrackingId && member.liveTrackingId.toLowerCase().includes(q));

    const matchesLevel = filterLevel === 'all' || member.pilotLevel === filterLevel;
    const matchesSector = filterSector === 'all' || member.sector.toLowerCase().includes(filterSector.toLowerCase());

    return matchesSearch && matchesLevel && matchesSector;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>Communauté Z’éléphants Volants • Savoie</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              Espace Pilotes & <span className="font-bold text-sky-400">Profil Club</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Gérez votre fiche pilote, synchronisez votre compte Google, déclarez vos identifiants LiveTracking (PureTrack / OGN) et retrouvez les coordonnées des pilotes du club pour les navettes et sorties.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser?.isGoogleConnected ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Google : {currentUser.googleEmail || currentUser.email}</span>
                {currentUser.isSuperAdmin && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    Admin
                  </span>
                )}
              </div>
            ) : null}

            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-xl shadow-sky-500/20 transition active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{currentUser ? 'Modifier ma fiche' : 'Renseigner ma fiche pilote'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active User Card */}
      {currentUser ? (
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-sky-950/30 border border-sky-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Avatar & Basic Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <img
                  src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"}
                  alt={currentUser.fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-sky-500/40 shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {currentUser.fullName}
                  </h2>
                  {currentUser.isSuperAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      Super-Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-semibold">
                      <UserCheck className="w-3.5 h-3.5" />
                      {currentUser.role || 'Pilote Club'}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-mono">
                  <span>Google : {currentUser.googleEmail || currentUser.email || 'Non renseigné'}</span>
                  {currentUser.phone && <span>Tél : {currentUser.phone}</span>}
                  <span>Secteur : {currentUser.sector}</span>
                </div>
              </div>
            </div>

            {/* Right: LiveTracking Status Pill */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">Balise LiveTracking</span>
                  {currentUser.shareLiveTracking ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Visible sur la carte
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-[10px] font-semibold">
                      Masqué
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Plateforme : <span className="text-sky-300 capitalize">{currentUser.liveTrackingPlatform || 'PureTrack'}</span> • ID : <span className="text-white">{currentUser.liveTrackingId || 'Non renseigné'}</span>
                </p>
              </div>

              <button
                onClick={handleOpenEdit}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-sky-300 border border-white/10 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3 h-3" />
                <span>Paramétrer le tracking</span>
              </button>
            </div>
          </div>

          {/* Quick Details Bar */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Niveau</span>
              <span className="font-bold text-white mt-0.5 block">{currentUser.pilotLevel}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Aile & Sellette</span>
              <span className="font-bold text-white mt-0.5 block truncate">{currentUser.wingModel || 'Non spécifiée'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Fréquence Radio</span>
              <span className="font-bold text-sky-400 font-mono mt-0.5 block">{currentUser.radioFrequency || '146.500 MHz'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Navette / Véhicule</span>
              <span className="font-bold text-white mt-0.5 block">{currentUser.vehicleInfo ? `${currentUser.vehicleInfo} (${currentUser.availableSeats} pl.)` : 'Piéton'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Vous naviguez actuellement en visiteur</h3>
              <p className="text-xs text-slate-400">Connectez-vous avec votre compte Google pour créer votre fiche pilote et partager votre balise de vol.</p>
            </div>
          </div>
          <button
            onClick={handleOpenEdit}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Créer ma fiche avec Google</span>
          </button>
        </div>
      )}

      {/* Directory Section */}
      <div className="space-y-4">
        {/* Directory Header with count, search and example purge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>Annuaire des Pilotes du Club</span>
              <span className="text-xs font-mono font-normal text-slate-400">({filteredDirectory.length} pilotes)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Coordonnées, radios, matériel et balises déclarées des pilotes Z’éléphants.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {directory.some(m => m.isExample || ['usr-julien', 'usr-sophie', 'usr-romain', 'usr-claire'].includes(m.id)) && (
              <button
                type="button"
                onClick={() => setShowPurgeExamplesModal(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition shrink-0"
                title="Supprimer tous les profils d'exemple en 1 clic"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Purger les profils exemples</span>
              </button>
            )}

            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher pilote, aile, secteur..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Pilot Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDirectory.map((pilot) => {
            const isExample = pilot.isExample || ['usr-julien', 'usr-sophie', 'usr-romain', 'usr-claire'].includes(pilot.id);
            const isSelf = currentUser?.id === pilot.id;

            return (
              <div
                key={pilot.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-sky-500/30 transition-all space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={pilot.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"}
                      alt={pilot.fullName}
                      className="w-11 h-11 rounded-xl object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{pilot.fullName}</span>
                        {pilot.isSuperAdmin && (
                          <Crown className="w-3.5 h-3.5 text-amber-400" title="Super-Admin" />
                        )}
                      </h3>
                      <span className="text-[11px] text-sky-400 block">{pilot.pilotLevel}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isExample && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                        Exemple
                      </span>
                    )}

                    {pilot.shareLiveTracking && pilot.liveTrackingId && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-mono flex items-center gap-1" title={`LiveTracking: ${pilot.liveTrackingPlatform}`}>
                        <Radio className="w-3 h-3 text-emerald-400" />
                        <span>Live</span>
                      </span>
                    )}

                    {/* Delete Member Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMemberToDelete(pilot);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 transition cursor-pointer"
                      title={isSelf ? "Supprimer mon profil" : `Supprimer ${pilot.fullName} de l'annuaire`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Aile :</span>
                    <span className="text-slate-200 font-medium truncate max-w-[170px]">{pilot.wingModel || '—'} {pilot.wingColor && `(${pilot.wingColor})`}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Radio :</span>
                    <span className="font-mono text-sky-300">{pilot.radioFrequency || '146.500 MHz'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Secteur :</span>
                    <span className="text-slate-300 truncate max-w-[170px]">{pilot.sector || 'Chambéry'}</span>
                  </div>
                  {pilot.vehicleInfo && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Navette :</span>
                      <span className="text-emerald-300 font-medium flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        <span>{pilot.vehicleInfo} ({pilot.availableSeats} pl.)</span>
                      </span>
                    </div>
                  )}
                </div>

                {pilot.bio && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5 line-clamp-2">
                    "{pilot.bio}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
            
            <div className="p-6 sm:p-7 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Fiche Pilote & Balise LiveTracking</h2>
                  <p className="text-xs text-slate-400">Renseignez vos informations de vol et de contact</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 sm:p-7 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Photo de Profil */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
                <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Photo de profil du pilote</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview */}
                  <div className="relative group shrink-0">
                    <img 
                      src={editForm.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                      alt="Aperçu profil" 
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-400/50 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white pointer-events-none">
                      <Camera className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Upload Actions */}
                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer transition flex items-center gap-2 shadow-md shadow-sky-500/20">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Télécharger une photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageFileChange} 
                          className="hidden" 
                        />
                      </label>

                      {editForm.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' }))}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/10 transition flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Réinitialiser</span>
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Formats acceptés : JPG, PNG, WEBP. Stockage direct et persistant dans votre profil.
                    </div>

                    {/* URL alternative */}
                    <div className="pt-1">
                      <input 
                        type="url"
                        placeholder="Ou collez l'URL d'une image web (https://...)"
                        value={editForm.avatarUrl?.startsWith('data:') ? '' : (editForm.avatarUrl || '')}
                        onChange={e => setEditForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Identité Google */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Identité & Compte Google</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Nom complet / Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.fullName || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="ex: Jonathan Roux"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Email Google / Gmail
                    </label>
                    <input
                      type="email"
                      value={editForm.googleEmail || editForm.email || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, googleEmail: e.target.value, email: e.target.value }))}
                      placeholder="ex: roux.jonath@gmail.com"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="06 XX XX XX XX"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Secteur d'habitation
                    </label>
                    <input
                      type="text"
                      value={editForm.sector || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, sector: e.target.value }))}
                      placeholder="ex: Chambéry, Aix-les-Bains, La Ravoire"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* LiveTracking Section - CRITICAL USER REQUEST */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-800/40 to-indigo-950/40 border border-sky-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-sky-400" />
                    <span>Configuration Balise LiveTracking</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                    Suivi en direct
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Permettez aux copains du club de vous suivre en direct sur la carte LiveTracking pendant vos vols autour du Lac du Bourget ou des Bauges.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Plateforme de tracking
                    </label>
                    <select
                      value={editForm.liveTrackingPlatform || 'puretrack'}
                      onChange={e => setEditForm(prev => ({ ...prev, liveTrackingPlatform: e.target.value as LiveTrackingPlatform }))}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="puretrack">PureTrack (Recommandé)</option>
                      <option value="ogn">Open Glider Network (OGN)</option>
                      <option value="flymaster">Flymaster Live</option>
                      <option value="syride">Syride SYS'Nav</option>
                      <option value="livetrack24">LiveTrack24</option>
                      <option value="garmin">Garmin inReach</option>
                      <option value="autre">Autre balise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Identifiant ou pseudo balise
                    </label>
                    <input
                      type="text"
                      value={editForm.liveTrackingId || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, liveTrackingId: e.target.value }))}
                      placeholder="ex: Jonathan-Roux-73 ou PureTrack ID"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                {/* LiveTracking share consent checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition">
                    <input
                      type="checkbox"
                      checked={editForm.shareLiveTracking ?? true}
                      onChange={e => setEditForm(prev => ({ ...prev, shareLiveTracking: e.target.checked }))}
                      className="mt-0.5 rounded border-white/20 text-sky-500 focus:ring-sky-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-white block">
                        Accepter d'être affiché sur la carte LiveTracking du club
                      </span>
                      <span className="text-slate-400 text-[11px] leading-tight block mt-0.5">
                        Lorsque votre balise émet, votre position, altitude et vitesse s'afficheront sur la carte de suivi en direct accessible aux membres et visiteurs.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Matériel & Niveau */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wind className="w-4 h-4" />
                  <span>Matériel & Niveau de vol</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Niveau FFVL
                    </label>
                    <select
                      value={editForm.pilotLevel || 'Brevet de Pilote (Tous sites)'}
                      onChange={e => setEditForm(prev => ({ ...prev, pilotLevel: e.target.value as PilotLevel }))}
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Pioupiou / Débutant">Pioupiou / Débutant</option>
                      <option value="Brevet Initial (Autonome sur site calme)">Brevet Initial (Autonome sur site calme)</option>
                      <option value="Brevet de Pilote (Tous sites)">Brevet de Pilote (Tous sites)</option>
                      <option value="Brevet Pilote Confirmé (BPC / Cross)">Brevet Pilote Confirmé (BPC / Cross)</option>
                      <option value="Biplaceur Fédéral">Biplaceur Fédéral</option>
                      <option value="Moniteur Fédéral">Moniteur Fédéral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Modèle de voile
                    </label>
                    <input
                      type="text"
                      value={editForm.wingModel || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, wingModel: e.target.value }))}
                      placeholder="ex: Ozone Rush 6, Advance Iota"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Couleur voile
                    </label>
                    <input
                      type="text"
                      value={editForm.wingColor || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, wingColor: e.target.value }))}
                      placeholder="ex: Bleu / Jaune"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Fréquence Radio Club
                    </label>
                    <input
                      type="text"
                      value={editForm.radioFrequency || '146.500 MHz (Club Zéléph)'}
                      onChange={e => setEditForm(prev => ({ ...prev, radioFrequency: e.target.value }))}
                      placeholder="146.500 MHz"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Sellette
                    </label>
                    <input
                      type="text"
                      value={editForm.harness || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, harness: e.target.value }))}
                      placeholder="ex: Advance Easiness 3, Kortel Kolibri"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Véhicule & Covoiturage */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4" />
                  <span>Navette & Covoiturage Décollages</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Véhicule disponible
                    </label>
                    <input
                      type="text"
                      value={editForm.vehicleInfo || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                      placeholder="ex: Kangoo 4x4, Duster, Partner"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Places disponibles pour navettes
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={8}
                      value={editForm.availableSeats ?? 2}
                      onChange={e => setEditForm(prev => ({ ...prev, availableSeats: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bio & Contact d'urgence */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Contact en cas d'urgence (Nom & relation)
                    </label>
                    <input
                      type="text"
                      value={editForm.emergencyContactName || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      placeholder="ex: Marie Roux (Conjointe)"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Téléphone d'urgence
                    </label>
                    <input
                      type="tel"
                      value={editForm.emergencyContactPhone || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      placeholder="06 XX XX XX XX"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Présentation / Pratique du vol
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.bio || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Vol sur site à Vérel et au Revard, cross vers le Colombier, rando-vol en Bauges..."
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-sky-500/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer ma fiche pilote</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Supprimer ce pilote ?</h3>
                <p className="text-xs text-slate-400">Annuaire du Club Les Z'éléphants</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer le profil de <strong className="text-white">{memberToDelete.fullName}</strong> de l'annuaire du club ?
              {memberToDelete.id === currentUser?.id && (
                <span className="block mt-2 text-rose-300 font-semibold">
                  Attention : il s'agit de votre propre compte actuellement connecté.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMember}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition shadow-lg shadow-rose-500/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge All Examples Confirmation Modal */}
      {showPurgeExamplesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Supprimer tous les profils exemples ?</h3>
                <p className="text-xs text-slate-400">Nettoyage de l'annuaire de démonstration</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cette action retirera tous les profils de démonstration (Julien Blanc, Sophie Mercier, Romain Petit, Claire Vignaud) pour ne laisser que les vrais pilotes du club.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowPurgeExamplesModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmPurgeExamples}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition shadow-lg shadow-rose-500/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer les exemples</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
