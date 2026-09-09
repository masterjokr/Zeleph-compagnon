import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SiteGuide } from './components/SiteGuide';
import { LiveTracking } from './components/LiveTracking';
import { ShuttleBoard } from './components/ShuttleBoard';
import { TrotteEtVol } from './components/TrotteEtVol';
import { SafetySOS } from './components/SafetySOS';
import { AiAeroBriefing } from './components/AiAeroBriefing';
import { MembersSpace } from './components/MembersSpace';
import { ClubOutingsCalendar } from './components/ClubOutingsCalendar';
import { OfflineBadge } from './components/OfflineBadge';
import { WelcomeAccessModal } from './components/WelcomeAccessModal';
import { AdminGoogleAuthModal } from './components/AdminGoogleAuthModal';
import { DiscordIntegrationModal } from './components/DiscordIntegrationModal';
import { ClubMemberProfile, AppTheme, ShuttleRide, ClubOuting } from './types';
import { Radio, ExternalLink, Globe, Sparkles, CheckCircle2, Crown, Compass } from 'lucide-react';
import { 
  isSuperAdminEmail, 
  SUPER_ADMIN_GOOGLE_EMAIL, 
  createJonathanSuperAdminProfile 
} from './utils/adminGoogleAuth';
import { 
  getStoredActiveUser, 
  saveStoredActiveUser, 
  clearStoredActiveUser, 
  savePilotProfile,
  getStoredTheme,
  saveStoredTheme
} from './utils/storageService';
import { initDiscordBotAutoSync } from './utils/botSyncService';

const WELCOME_DISMISSED_KEY = 'zeleph_welcome_dismissed_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('sites');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('verel');
  
  // Theme state: dark by default as loved by user, with toggle to light
  const [theme, setTheme] = useState<AppTheme>(() => getStoredTheme());

  const handleToggleTheme = () => {
    const next: AppTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveStoredTheme(next);
    showToast(next === 'light' ? "Thème clair activé ☀️" : "Thème sombre activé 🌙");
  };

  // Super-admin dedicated modal state
  const [isAdminGoogleModalOpen, setIsAdminGoogleModalOpen] = useState<boolean>(false);

  // Discord Gateway Integration modal state
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState<boolean>(false);

  // Deep-link query parameters from Discord buttons/links (?join_ride=... or ?join_outing=...)
  const [highlightedRideId, setHighlightedRideId] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('join_ride');
    } catch {
      return null;
    }
  });

  const [highlightedOutingId, setHighlightedOutingId] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('join_outing');
    } catch {
      return null;
    }
  });

  // Automatically switch tabs if deep-linked
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const rideId = params.get('join_ride');
      const outingId = params.get('join_outing');
      if (rideId) {
        setActiveTab('navettes');
        setHighlightedRideId(rideId);
      } else if (outingId) {
        setActiveTab('calendrier');
        setHighlightedOutingId(outingId);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Current logged in user loaded from storage
  const [currentUser, setCurrentUser] = useState<ClubMemberProfile | null>(() => {
    return getStoredActiveUser();
  });

  // Welcome modal state: shown on initial arrival if not connected and not yet dismissed this session
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    try {
      const active = getStoredActiveUser();
      if (active) return false;
      const dismissed = sessionStorage.getItem(WELCOME_DISMISSED_KEY);
      return !dismissed;
    } catch {
      return true;
    }
  });

  const [restrictedActionMessage, setRestrictedActionMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectVisitor = () => {
    try {
      sessionStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
    } catch {}
    setIsWelcomeModalOpen(false);
    setRestrictedActionMessage(null);
  };

  const handleOpenWelcome = (reason?: string) => {
    setRestrictedActionMessage(reason || null);
    setIsWelcomeModalOpen(true);
  };

  const handleLogin = (profile: ClubMemberProfile) => {
    // If Jonathan Roux, ensure isSuperAdmin is true
    if (isSuperAdminEmail(profile.email || profile.googleEmail || '')) {
      profile.isSuperAdmin = true;
    }

    // Persist to database
    savePilotProfile(profile);
    saveStoredActiveUser(profile);

    setCurrentUser(profile);
    showToast(`Connecté avec succès : ${profile.fullName}${profile.isSuperAdmin ? ' (Super-Administrateur)' : ''}`);
  };

  const handleLogout = () => {
    clearStoredActiveUser();
    setCurrentUser(null);
    showToast("Vous êtes maintenant déconnecté. L'application est en mode visiteur.");
  };

  const handleSimulateIncomingShuttle = (ride: ShuttleRide) => {
    try {
      const raw = localStorage.getItem('zeleph_shuttle_rides_v1');
      const existing = raw ? JSON.parse(raw) : [];
      localStorage.setItem('zeleph_shuttle_rides_v1', JSON.stringify([ride, ...existing]));
    } catch (e) {
      console.error(e);
    }
    setActiveTab('navettes');
    showToast("🚗 Covoiturage reçu de Discord synchronisé dans l'application !");
  };

  const handleSimulateIncomingOuting = (outing: ClubOuting) => {
    try {
      const raw = localStorage.getItem('zeleph_club_outings_v1');
      const existing = raw ? JSON.parse(raw) : [];
      localStorage.setItem('zeleph_club_outings_v1', JSON.stringify([outing, ...existing]));
    } catch (e) {
      console.error(e);
    }
    setActiveTab('calendrier');
    showToast("📅 Sortie club reçue de Discord synchronisée dans l'application !");
  };

  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 10000);

    // Initialise la synchronisation automatique en arrière-plan depuis le Bot Render
    const stopBotSync = initDiscordBotAutoSync(20000);

    return () => {
      clearInterval(timer);
      stopBotSync();
    };
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'theme-light bg-slate-50 text-slate-800' : 'theme-dark bg-[#020617] text-slate-100'} flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950 relative overflow-x-hidden transition-colors duration-200`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Immersive Ambient Glows */}
      <div 
        className="fixed inset-0 opacity-25 pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 20% 15%, #38bdf8 0%, transparent 45%), radial-gradient(circle at 80% 85%, #6366f1 0%, transparent 45%)',
          filter: 'blur(90px)' 
        }} 
      />
      {/* Subtle Dot Grid */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* PWA Offline indicator */}
      <OfflineBadge />

      {/* Main App Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenWelcomeModal={() => handleOpenWelcome()}
        onOpenDiscordModal={() => setIsDiscordModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Cockpit HUD Sub-Header */}
      <div className="relative z-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-300">
                Cockpit Club • Savoie, Lac du Bourget & Bauges
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-mono font-bold uppercase tracking-wider">
                LiveTracking Opérationnel
              </span>
            </div>

            {/* Quick LiveTracking Trigger Banner */}
            <div className="mt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('livetracking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group inline-flex flex-wrap items-center gap-2 text-left transition cursor-pointer"
                title="Cliquer pour afficher la carte de suivi des pilotes en vol"
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/15 border border-sky-500/30 group-hover:bg-sky-500/25 group-hover:border-sky-500/50 transition shadow-sm">
                  <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  <strong className="text-sky-300 font-bold text-xs group-hover:text-sky-200">
                    Carte LiveTracking des pilotes en vol
                  </strong>
                  <span className="text-[10px] text-sky-400/90 font-mono font-bold underline underline-offset-2 ml-1 group-hover:translate-x-0.5 transition-transform">
                    Ouvrir la carte →
                  </span>
                </span>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 hidden xs:inline">
                  • PureTrack & OGN synchronisés
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:text-right">
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-sky-400 tracking-tight">
                {currentTime}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                Heure locale • UTC+2
              </div>
            </div>

            <div className="hidden md:block w-[1px] h-8 bg-white/10" />

            {/* Radio Frequencies HUD (Club 146.500 & FFVL 143.9875) */}
            <div className="hidden md:flex items-center gap-4 text-right">
              <div>
                <div className="text-xs font-mono text-sky-400 font-bold">
                  146.500 MHz
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Club Zéléph
                </div>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  143.9875 MHz
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  FFVL Sécurité
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {activeTab === 'sites' && (
          <SiteGuide 
            selectedSiteId={selectedSiteId}
            onSelectSite={(id) => setSelectedSiteId(id)}
            currentUser={currentUser}
            onRequireMemberAuth={(reason) => handleOpenWelcome(reason)}
          />
        )}

        {activeTab === 'livetracking' && (
          <LiveTracking 
            currentUser={currentUser}
            onRequireLogin={() => {
              handleOpenWelcome("Pour configurer votre balise de vol et partager votre position sur la carte, connectez-vous avec votre compte Google.");
            }}
            onNavigateToSites={() => {
              setActiveTab('sites');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'calendrier' && (
          <ClubOutingsCalendar 
            onNavigateToSite={(siteId) => {
              setSelectedSiteId(siteId);
              setActiveTab('sites');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            onRequireLogin={() => {
              handleOpenWelcome("Pour vous inscrire ou proposer une sortie club, connectez-vous avec votre compte Google.");
            }}
            onRequireMemberAuth={(reason) => handleOpenWelcome(reason)}
            onOpenDiscordModal={() => setIsDiscordModalOpen(true)}
            highlightedOutingId={highlightedOutingId}
            onClearHighlightedOuting={() => setHighlightedOutingId(null)}
          />
        )}

        {activeTab === 'navettes' && (
          <ShuttleBoard 
            currentUser={currentUser}
            onNavigateToMembers={() => {
              handleOpenWelcome("Pour proposer un covoiturage ou réserver une place de navette, connectez-vous avec votre compte Google.");
            }}
            onRequireMemberAuth={(reason) => handleOpenWelcome(reason)}
            onOpenDiscordModal={() => setIsDiscordModalOpen(true)}
            highlightedRideId={highlightedRideId}
            onClearHighlightedRide={() => setHighlightedRideId(null)}
          />
        )}

        {activeTab === 'membres' && (
          <MembersSpace 
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onOpenGoogleAuth={() => handleOpenWelcome("Connexion Google requise : Pour créer ou gérer votre fiche pilote officielle, veuillez vous connecter avec votre compte Google.")}
            onNavigateToShuttles={() => {
              setActiveTab('navettes');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToOutings={() => {
              setActiveTab('calendrier');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'trotte' && (
          <TrotteEtVol 
            currentUser={currentUser}
            onNavigateToMembers={() => {
              handleOpenWelcome("Pour proposer un topo rando-vol, connectez-vous avec votre compte Google.");
            }}
            onRequireMemberAuth={(reason) => handleOpenWelcome(reason)}
          />
        )}

        {activeTab === 'sos' && (
          <SafetySOS />
        )}

        {activeTab === 'briefing' && (
          <AiAeroBriefing />
        )}
      </main>

      {/* Welcome Access Modal: Visitor vs Google Pilot Login */}
      <WelcomeAccessModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onSelectVisitor={handleSelectVisitor}
        onLogin={handleLogin}
        currentUser={currentUser}
        restrictedActionMessage={restrictedActionMessage}
        onOpenAdminGoogleModal={() => {
          setIsWelcomeModalOpen(false);
          setIsAdminGoogleModalOpen(true);
        }}
      />

      {/* Dedicated Super-Admin Google Modal for roux.jonath@gmail.com */}
      <AdminGoogleAuthModal
        isOpen={isAdminGoogleModalOpen}
        onClose={() => setIsAdminGoogleModalOpen(false)}
        currentUser={currentUser}
        onLoginAsSuperAdmin={(profile) => {
          handleLogin(profile);
          setIsAdminGoogleModalOpen(false);
        }}
        onLogoutSuperAdmin={handleLogout}
      />

      {/* Discord Webhook & Gateway Integration Modal */}
      <DiscordIntegrationModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
        currentUser={currentUser}
        onSimulateIncomingShuttle={handleSimulateIncomingShuttle}
        onSimulateIncomingOuting={handleSimulateIncomingOuting}
      />

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 mt-12 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900/80 border border-white/10 flex items-center justify-center shadow-md shadow-sky-500/10 p-1">
              <img 
                src="https://www.zeleph.com/wp-content/uploads/2023/06/cropped-512p-1-2.png" 
                alt="Logo Zéleph" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-bold text-slate-200">
                Club Les Z'éléphants Volants (Les Z'éléph)
              </p>
              <p className="text-[11px] text-slate-400">
                Club FFVL N° 01031 • Chambéry, Savoie, Auvergne-Rhône-Alpes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setIsAdminGoogleModalOpen(true)}
              className="flex items-center gap-1 text-amber-400/80 hover:text-amber-300 transition"
              title="Accès Super-Administrateur Google"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Administration ({SUPER_ADMIN_GOOGLE_EMAIL})</span>
            </button>
            <span>•</span>
            <a 
              href="https://www.zeleph.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white transition flex items-center gap-1"
            >
              <span>Site officiel zeleph.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
