import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Satellite, 
  Compass, 
  Wind, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  ExternalLink, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Sparkles, 
  Sliders, 
  Layers, 
  Share2, 
  Navigation,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Maximize2,
  Crosshair,
  LocateFixed,
  Check,
  Globe
} from 'lucide-react';
import { ClubMemberProfile, LivePilotTrack, LiveTrackingPlatform } from '../types';
import { GoogleLiveMap } from './GoogleLiveMap';
import { 
  getStoredActiveUser, 
  getSavedProfileByEmail, 
  getUserGpsLocation, 
  saveUserGpsLocation,
  getStoredParaglidingSites
} from '../utils/storageService';
import { SUPER_ADMIN_GOOGLE_EMAIL } from '../utils/adminGoogleAuth';
import { INITIAL_CURRENT_USER } from '../data/membersData';

interface LiveTrackingProps {
  currentUser: ClubMemberProfile | null;
  onUpdateCurrentUser?: (user: ClubMemberProfile | null) => void;
  onOpenGoogleAuth?: () => void;
  onRequireLogin?: () => void;
  onNavigateToSites?: () => void;
}

// Savoie Takeoff Sites generated dynamically from synchronized paragliding sites storage
export function getSynchronizedTakeoffSites() {
  const sites = getStoredParaglidingSites();
  return sites.map(s => ({
    id: s.id,
    name: `Déco ${s.name.split(' - ')[0]} (${s.takeoffAlt}m)`,
    siteName: s.name,
    lat: s.lat,
    lng: s.lng,
    alt: s.takeoffAlt
  }));
}

// Initial mock live tracks for club pilots in Savoie
const INITIAL_LIVE_TRACKS: LivePilotTrack[] = [
  {
    pilotId: 'usr-zeleph-me',
    pilotName: 'Jonathan Roux',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    googleEmail: 'roux.jonath@gmail.com',
    wingModel: 'Ozone Alpina 4 (EN-C)',
    wingColor: 'Bleu / Blanc / Cyan',
    lat: 45.612,
    lng: 5.985,
    altitude: 1840,
    groundSpeed: 38,
    vario: 2.3,
    headingDeg: 140,
    lastUpdate: 'Il y a 20 sec',
    status: 'climbing',
    siteNear: 'Roc des Bœufs / Nivolet',
    batteryLevel: 88,
    platform: 'puretrack',
    platformLabel: 'PureTrack Live',
    platformId: 'Jonathan-Roux-73',
    phone: '06 45 12 78 90',
    radioFrequency: '146.500 MHz (Club Zéléph)',
    emergencyContact: 'Émilie Roux (06 11 22 33 44)'
  },
  {
    pilotId: 'usr-sophie',
    pilotName: 'Sophie Mercier',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    googleEmail: 'sophie.m.parapente@gmail.com',
    wingModel: 'Niviuk Artik 6 (EN-C)',
    wingColor: 'Rouge / Noir',
    lat: 45.580,
    lng: 5.960,
    altitude: 1510,
    groundSpeed: 29,
    vario: 1.6,
    headingDeg: 45,
    lastUpdate: 'Il y a 45 sec',
    status: 'flying',
    siteNear: 'Dent de Rossane',
    batteryLevel: 74,
    platform: 'puretrack',
    platformLabel: 'PureTrack Live',
    platformId: 'Sophie-Thermique',
    phone: '06 88 77 66 55',
    radioFrequency: '146.500 MHz',
    emergencyContact: 'Pierre Mercier (06 99 88 77 66)'
  },
  {
    pilotId: 'usr-romain',
    pilotName: 'Romain Petit',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    googleEmail: 'romain.petit73@gmail.com',
    wingModel: 'Gin Camino (EN-C light)',
    wingColor: 'Lime / Blanc',
    lat: 45.645,
    lng: 5.820,
    altitude: 1420,
    groundSpeed: 42,
    vario: 0.8,
    headingDeg: 190,
    lastUpdate: 'Il y a 1 min',
    status: 'flying',
    siteNear: 'Crête Dent du Chat',
    batteryLevel: 91,
    platform: 'syride',
    platformLabel: 'Syride Sys’Nav',
    platformId: 'romain-hikefly',
    phone: '06 33 22 11 00',
    radioFrequency: '146.500 MHz',
    emergencyContact: 'Laura Petit (06 55 44 33 22)'
  },
  {
    pilotId: 'usr-julien',
    pilotName: 'Julien Blanc',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    googleEmail: 'julien.blanc73@gmail.com',
    wingModel: 'Advance Iota DLS (EN-B+)',
    wingColor: 'Orange / Gris',
    lat: 45.520,
    lng: 6.130,
    altitude: 1120,
    groundSpeed: 34,
    vario: -0.4,
    headingDeg: 275,
    lastUpdate: 'Il y a 2 min',
    status: 'flying',
    siteNear: 'Chamoux / Combe de Savoie',
    batteryLevel: 65,
    platform: 'flymaster',
    platformLabel: 'Flymaster Live',
    platformId: 'FLY-73-JULIEN',
    phone: '06 12 34 56 78',
    radioFrequency: '146.500 MHz',
    emergencyContact: 'Hélène Blanc (06 20 30 40 50)'
  }
];

/**
 * Builds live pilot tracks dynamically merging persistent storage & current user
 */
function buildSynchronizedTracks(
  user: ClubMemberProfile | null,
  customGps: { lat: number; lng: number; altitude?: number } | null
): LivePilotTrack[] {
  const resolvedUser = user || getStoredActiveUser() || getSavedProfileByEmail(SUPER_ADMIN_GOOGLE_EMAIL) || INITIAL_CURRENT_USER;
  const baseTracks = INITIAL_LIVE_TRACKS.map(t => ({ ...t }));
  const realGps = customGps || getUserGpsLocation();

  // Retrieve current paragliding sites from storage to align default coordinates with user customization
  const verelSite = getStoredParaglidingSites().find(s => s.id === 'verel');
  const defaultLat = verelSite ? verelSite.lat : 45.5901;
  const defaultLng = verelSite ? verelSite.lng : 5.9542;
  const defaultAlt = verelSite ? verelSite.takeoffAlt : 880;

  const userTrackIndex = baseTracks.findIndex(t => 
    t.pilotId === resolvedUser.id || 
    t.pilotId === 'usr-zeleph-me' || 
    (resolvedUser.googleEmail && t.googleEmail?.toLowerCase() === resolvedUser.googleEmail?.toLowerCase()) ||
    (resolvedUser.email && t.googleEmail?.toLowerCase() === resolvedUser.email?.toLowerCase())
  );

  const activePilotTrack: LivePilotTrack = {
    pilotId: resolvedUser.id || 'usr-zeleph-me',
    pilotName: resolvedUser.fullName || 'Jonathan Roux',
    avatarUrl: resolvedUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    googleEmail: resolvedUser.googleEmail || resolvedUser.email || SUPER_ADMIN_GOOGLE_EMAIL,
    wingModel: resolvedUser.wingModel || 'Ozone Alpina 4 (EN-C)',
    wingColor: resolvedUser.wingColor || 'Bleu / Blanc / Cyan',
    lat: realGps ? realGps.lat : defaultLat,
    lng: realGps ? realGps.lng : defaultLng,
    altitude: realGps?.altitude || (userTrackIndex >= 0 ? baseTracks[userTrackIndex].altitude : defaultAlt),
    groundSpeed: userTrackIndex >= 0 ? baseTracks[userTrackIndex].groundSpeed : 38,
    vario: userTrackIndex >= 0 ? baseTracks[userTrackIndex].vario : 2.3,
    headingDeg: userTrackIndex >= 0 ? baseTracks[userTrackIndex].headingDeg : 140,
    lastUpdate: realGps ? 'Position GPS en direct' : 'À l’instant',
    status: 'flying',
    siteNear: realGps ? 'Position GPS réelle (Direct)' : (verelSite ? verelSite.name : 'Vérel - Pragondran'),
    batteryLevel: 94,
    platform: resolvedUser.liveTrackingPlatform || 'puretrack',
    platformLabel: resolvedUser.liveTrackingPlatform === 'puretrack' 
      ? 'PureTrack Live' 
      : resolvedUser.liveTrackingPlatform === 'ogn' 
      ? 'Open Glider Network' 
      : resolvedUser.liveTrackingPlatform === 'flymaster'
      ? 'Flymaster Live'
      : (resolvedUser.liveTrackingPlatform || 'PureTrack Live'),
    platformId: resolvedUser.liveTrackingId || 'Jonathan-Roux-73',
    phone: resolvedUser.phone || '06 45 12 78 90',
    radioFrequency: resolvedUser.radioFrequency || '146.500 MHz (Club Zéléph)',
    emergencyContact: resolvedUser.emergencyContactName ? `${resolvedUser.emergencyContactName} (${resolvedUser.emergencyContactPhone || ''})` : undefined
  };

  if (userTrackIndex >= 0) {
    baseTracks[userTrackIndex] = activePilotTrack;
  } else {
    baseTracks.unshift(activePilotTrack);
  }

  return baseTracks;
}

export const LiveTracking: React.FC<LiveTrackingProps> = ({
  currentUser,
  onUpdateCurrentUser,
  onOpenGoogleAuth,
  onRequireLogin,
  onNavigateToSites
}) => {
  // GPS location state
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; altitude?: number } | null>(() => {
    return getUserGpsLocation();
  });
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);

  // Synchronized takeoffs from storageService
  const [takeoffSites, setTakeoffSites] = useState(() => getSynchronizedTakeoffSites());

  // Synchronized tracks state
  const [tracks, setTracks] = useState<LivePilotTrack[]>(() => {
    return buildSynchronizedTracks(currentUser, getUserGpsLocation());
  });
  const [selectedPilot, setSelectedPilot] = useState<LivePilotTrack | null>(() => {
    const list = buildSynchronizedTracks(currentUser, getUserGpsLocation());
    return list[0] || null;
  });

  const [filterSearch, setFilterSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAirspaces, setShowAirspaces] = useState(true);
  const [showSites, setShowSites] = useState(true);
  const [embeddedPuretrack, setEmbeddedPuretrack] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Profile live tracking preferences state
  const isUserSharing = currentUser?.shareLiveTracking !== false;
  const userPlatform = currentUser?.liveTrackingPlatform || 'puretrack';
  const userTrackingId = currentUser?.liveTrackingId || '';

  // Synchronize when sites are edited in the app
  useEffect(() => {
    const handleSitesUpdated = () => {
      setTakeoffSites(getSynchronizedTakeoffSites());
      setTracks(buildSynchronizedTracks(currentUser, gpsLocation));
    };
    window.addEventListener('zeleph_sites_updated', handleSitesUpdated);
    window.addEventListener('storage', handleSitesUpdated);
    return () => {
      window.removeEventListener('zeleph_sites_updated', handleSitesUpdated);
      window.removeEventListener('storage', handleSitesUpdated);
    };
  }, [currentUser, gpsLocation]);

  // Synchronize when currentUser or gpsLocation changes
  useEffect(() => {
    const synced = buildSynchronizedTracks(currentUser, gpsLocation);
    setTracks(synced);
    setSelectedPilot(prev => {
      if (!prev) return synced[0];
      const found = synced.find(p => p.pilotId === prev.pilotId);
      return found || synced[0];
    });
  }, [currentUser, gpsLocation]);

  // Periodic subtle drift simulation for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setTracks(prev => prev.map(pilot => {
        // Small random movement
        const varioDelta = (Math.random() - 0.48) * 0.4;
        const newVario = Math.round((pilot.vario + varioDelta) * 10) / 10;
        const altDelta = Math.round(newVario * 4);
        const newAlt = Math.max(400, Math.min(2800, pilot.altitude + altDelta));
        const speedDelta = Math.round((Math.random() - 0.5) * 3);
        const newSpeed = Math.max(15, Math.min(65, pilot.groundSpeed + speedDelta));

        return {
          ...pilot,
          vario: newVario,
          altitude: newAlt,
          groundSpeed: newSpeed,
          status: newVario > 1.2 ? 'climbing' : 'flying',
          lastUpdate: 'À l’instant'
        };
      }));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const synced = buildSynchronizedTracks(currentUser, gpsLocation);
    setTracks(synced);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleActivateDeviceGps = () => {
    if (!navigator.geolocation) {
      setLocationFeedback("La géolocalisation n'est pas supportée sur ce navigateur.");
      return;
    }

    setIsLocatingGps(true);
    setLocationFeedback("Recherche de votre signal GPS réel en cours...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Math.round(pos.coords.latitude * 100000) / 100000,
          lng: Math.round(pos.coords.longitude * 100000) / 100000,
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : 1250
        };
        saveUserGpsLocation(coords);
        setGpsLocation(coords);
        setIsLocatingGps(false);
        setLocationFeedback(`✓ Signal GPS synchronisé : ${coords.lat}°N, ${coords.lng}°E (${coords.altitude}m)`);
        setTimeout(() => setLocationFeedback(null), 5000);
      },
      (err) => {
        setIsLocatingGps(false);
        setLocationFeedback("Accès GPS refusé ou indisponible. Vous pouvez aussi choisir un décollage ci-dessous.");
        setTimeout(() => setLocationFeedback(null), 6000);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleSelectTakeoffSite = (site: ReturnType<typeof getSynchronizedTakeoffSites>[0]) => {
    const coords = { lat: site.lat, lng: site.lng, altitude: site.alt };
    saveUserGpsLocation(coords);
    setGpsLocation(coords);
    setLocationFeedback(`✓ Balise calée sur ${site.name} (${site.lat.toFixed(4)}°N, ${site.lng.toFixed(4)}°E)`);
    setTimeout(() => setLocationFeedback(null), 4000);
  };

  const handleToggleShareLiveTracking = () => {
    if (!currentUser) {
      if (onOpenGoogleAuth) onOpenGoogleAuth();
      return;
    }

    const updatedUser: ClubMemberProfile = {
      ...currentUser,
      shareLiveTracking: !isUserSharing
    };

    if (onUpdateCurrentUser) {
      onUpdateCurrentUser(updatedUser);
    }
  };

  const handleCopyClubLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredTracks = tracks.filter(t => 
    !filterSearch || 
    t.pilotName.toLowerCase().includes(filterSearch.toLowerCase()) ||
    t.wingModel.toLowerCase().includes(filterSearch.toLowerCase()) ||
    t.siteNear.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Cockpit */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Réseau OGN & PureTrack Zéléph</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Savoie • Bauges • Chartreuse</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Radio className="w-7 h-7 text-sky-400" />
              <span>LiveTracking des Pilotes</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Suivi en temps réel des pilotes des Z’éléphants Volants actuellement en vol sur les sites de Savoie. Balises OGN, PureTrack, Flymaster, Syride et Garmin regroupées.
            </p>
          </div>

          {/* Quick Frequency & Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Fréquence Club</div>
                <div className="text-xs font-bold text-white font-mono">146.500 MHz</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Secours FFVL</div>
                <div className="text-xs font-bold text-white font-mono">143.9875 MHz</div>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
              title="Rafraîchir les positions"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* User's Personal LiveTracking Status Bar */}
        <div className="mt-5 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {currentUser ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 font-bold text-xs">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{currentUser.fullName}</span>
                    {currentUser.isSuperAdmin && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30 font-semibold">Admin</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Plateforme : <span className="text-sky-300 uppercase font-mono">{userPlatform}</span>
                    {userTrackingId ? ` (${userTrackingId})` : ' • Aucun ID configuré'}
                  </div>
                </div>
              </div>

              {/* Share LiveTracking Toggle */}
              <button
                type="button"
                onClick={handleToggleShareLiveTracking}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                  isUserSharing
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isUserSharing ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{isUserSharing ? 'Affiché sur la carte générale du club' : 'Masqué de la carte du club'}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 bg-slate-800/40 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Vous consultez le LiveTracking en mode visiteur. Connectez-vous avec votre compte Google pour activer et diffuser votre propre balise en vol.</span>
              </div>
              <button
                type="button"
                onClick={onOpenGoogleAuth}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition shrink-0"
              >
                Connexion Google
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {userTrackingId && (
              <a
                href={`https://puretrack.io/${userTrackingId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition"
                title={`Ouvrir mon profil PureTrack : ${userTrackingId}`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Mon PureTrack ↗</span>
              </a>
            )}
            <button
              onClick={() => setEmbeddedPuretrack(!embeddedPuretrack)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                embeddedPuretrack 
                  ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{embeddedPuretrack ? 'Mode Radar Club' : 'Vue Satellite PureTrack'}</span>
            </button>
            <button
              onClick={handleCopyClubLink}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Partager le LiveTracking du club"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* GPS Position Synchronizer & Takeoff Selector HUD */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <LocateFixed className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Position GPS de ma balise :</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleActivateDeviceGps}
                disabled={isLocatingGps}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Détecter ma position GPS réelle via ce smartphone ou PC"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin text-emerald-300' : ''}`} />
                <span>{isLocatingGps ? 'Localisation GPS...' : 'Activer GPS réel (Appareil)'}</span>
              </button>
            </div>
          </div>

          {/* Quick Takeoff Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">Ou décollage :</span>
            {takeoffSites.map((site) => {
              const isActive = gpsLocation && Math.abs(gpsLocation.lat - site.lat) < 0.005 && Math.abs(gpsLocation.lng - site.lng) < 0.005;
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => handleSelectTakeoffSite(site)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/5'
                  }`}
                  title={`Positionner ma balise sur ${site.siteName || site.name} (lat: ${site.lat.toFixed(4)}, lng: ${site.lng.toFixed(4)})`}
                >
                  {site.name.replace('Déco ', '')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location Feedback Toast Alert */}
        {locationFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-xs text-sky-200 flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{locationFeedback}</span>
          </div>
        )}

      </div>

      {/* Embedded Puretrack View or Radar Tactical Map */}
      {embeddedPuretrack ? (
        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-3 bg-slate-950 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{userTrackingId ? `Radar PureTrack : ${userTrackingId}` : 'Flux direct PureTrack.io (Savoie / Massif des Bauges)'}</span>
            </span>
            <a
              href={userTrackingId ? `https://puretrack.io/${userTrackingId}` : "https://puretrack.io/?lat=45.5646&lon=5.9177&z=11"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Ouvrir en plein écran</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="h-[650px] w-full bg-slate-950">
            <iframe
              src={userTrackingId ? `https://puretrack.io/${userTrackingId}?embed=true` : "https://puretrack.io/?lat=45.5646&lon=5.9177&z=11&embed=true"}
              title="PureTrack Live Savoie"
              className="w-full h-full border-0"
              allow="geolocation"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tactical Google Map Area (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <GoogleLiveMap
              tracks={filteredTracks}
              selectedPilot={selectedPilot}
              onSelectPilot={setSelectedPilot}
              showAirspaces={showAirspaces}
              showSites={showSites}
            />

            {/* Quick Pilot Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                placeholder="Filtrer les pilotes en l'air par nom, voile (ex: Alpina, Niviuk), secteur..."
                className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Pilot Telemetry & Information Sidebar (1 col on lg) */}
          <div className="space-y-4">
            {selectedPilot ? (
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl space-y-5">
                {/* Pilot Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedPilot.avatarUrl} 
                      alt="" 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-500/40 shadow-md" 
                    />
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <span>{selectedPilot.pilotName}</span>
                        {selectedPilot.pilotId === 'usr-zeleph-me' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">Admin</span>
                        )}
                      </h3>
                      <div className="text-xs text-sky-300 font-medium">
                        {selectedPilot.siteNear}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                    selectedPilot.status === 'climbing'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    <span>{selectedPilot.status === 'climbing' ? 'En thermique' : 'En transition'}</span>
                  </span>
                </div>

                {/* Main Telemetry Gauges */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Altitude</div>
                    <div className="text-lg font-black text-white font-mono mt-0.5">
                      {selectedPilot.altitude} <span className="text-xs font-normal text-slate-400">m</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Vitesse Sol</div>
                    <div className="text-lg font-black text-white font-mono mt-0.5">
                      {selectedPilot.groundSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-2xl border ${
                    selectedPilot.vario >= 0 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Vario</div>
                    <div className="text-lg font-black font-mono mt-0.5">
                      {selectedPilot.vario >= 0 ? `+${selectedPilot.vario}` : selectedPilot.vario} <span className="text-xs font-normal">m/s</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry note clarification */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/5 text-[10px] text-slate-400">
                  <Activity className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>Télémétrie en direct : Vario & thermiques simulés en vol (données de vol indicatives)</span>
                </div>

                {/* Glider & Radio Info */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                    <span className="text-slate-400">Voile :</span>
                    <span className="font-bold text-white">{selectedPilot.wingModel}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                    <span className="text-slate-400">Couleurs voile :</span>
                    <span className="font-medium text-slate-200">{selectedPilot.wingColor}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                    <span className="text-slate-400">Balise / Source :</span>
                    <span className="font-mono text-sky-400 font-semibold">{selectedPilot.platformLabel} ({selectedPilot.platformId})</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                    <span className="text-slate-400">Radio :</span>
                    <span className="font-mono font-bold text-amber-300">{selectedPilot.radioFrequency || '146.500 MHz'}</span>
                  </div>
                </div>

                {/* Safety & Contact Actions */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sécurité & Récup</div>
                  
                  {selectedPilot.platform === 'puretrack' && selectedPilot.platformId && (
                    <a
                      href={`https://puretrack.io/${selectedPilot.platformId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-sky-500/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Suivre sur PureTrack ({selectedPilot.platformId}) ↗</span>
                    </a>
                  )}

                  {selectedPilot.phone ? (
                    <a
                      href={`tel:${selectedPilot.phone.replace(/\s+/g, '')}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Appeler le pilote ({selectedPilot.phone})</span>
                    </a>
                  ) : null}

                  {selectedPilot.emergencyContact && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                      <span className="font-bold">Contact d'urgence :</span> {selectedPilot.emergencyContact}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 text-center text-slate-400 text-xs">
                Sélectionnez un pilote sur la carte pour afficher sa télémétrie complète et ses informations de sécurité.
              </div>
            )}

            {/* List of all active pilots */}
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider px-1">
                Pilotes en l'air ({filteredTracks.length})
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredTracks.map(p => (
                  <button
                    key={p.pilotId}
                    type="button"
                    onClick={() => setSelectedPilot(p)}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition border ${
                      selectedPilot?.pilotId === p.pilotId
                        ? 'bg-sky-500/15 border-sky-500/40 text-white'
                        : 'bg-slate-950/40 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={p.avatarUrl} alt="" className="w-8 h-8 rounded-xl object-cover" />
                      <div>
                        <div className="text-xs font-bold leading-tight">{p.pilotName}</div>
                        <div className="text-[10px] text-slate-400">{p.wingModel}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-white">{p.altitude}m</div>
                      <div className={`text-[10px] font-mono font-bold ${p.vario >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.vario >= 0 ? `+${p.vario}` : p.vario} m/s
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-Outing LiveTracking Roadmap & Future integration card */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-sky-950/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>Nouveauté en cours de déploiement</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            LiveTracking par Sortie Club
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Lorsque vous rejoignez une sortie du club (cross, pioupiou ou rando-vol), une page de tracking dédiée regroupera uniquement les pilotes de votre groupe pour voler de concert et faciliter les récupérations !
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://live.glidernet.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>OGN Glidernet Direct</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </div>
  );
};
