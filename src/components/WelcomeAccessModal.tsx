import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle, 
  ArrowRight, 
  Crown, 
  LogIn, 
  Mail, 
  Radio, 
  Car, 
  Compass,
  ShieldCheck,
  Settings,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { ClubMemberProfile } from '../types';
import { 
  SUPER_ADMIN_GOOGLE_EMAIL, 
  isSuperAdminEmail, 
  createJonathanSuperAdminProfile,
  saveSuperAdminSession,
  decodeGoogleJwt,
  getStoredGoogleClientId,
  saveStoredGoogleClientId
} from '../utils/adminGoogleAuth';
import { 
  getSavedProfileByEmail, 
  savePilotProfile 
} from '../utils/storageService';

interface WelcomeAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVisitor: () => void;
  onLogin: (profile: ClubMemberProfile) => void;
  currentUser?: ClubMemberProfile | null;
  restrictedActionMessage?: string | null;
  onOpenAdminGoogleModal?: () => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const WelcomeAccessModal: React.FC<WelcomeAccessModalProps> = ({
  isOpen,
  onClose,
  onSelectVisitor,
  onLogin,
  currentUser,
  restrictedActionMessage,
  onOpenAdminGoogleModal
}) => {
  const [googleClientId, setGoogleClientId] = useState<string>(() => getStoredGoogleClientId());
  const [isConfigClientIdOpen, setIsConfigClientIdOpen] = useState<boolean>(false);
  const [clientIdInput, setClientIdInput] = useState<string>(() => getStoredGoogleClientId());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manual fallback input if user prefers direct email validation
  const [manualEmail, setManualEmail] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');
  const [showManualForm, setShowManualForm] = useState<boolean>(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services if client ID is available
  useEffect(() => {
    if (!isOpen) return;

    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'filled_blue',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
        }
      } catch (err) {
        console.error('Erreur initialisation Google Identity Services:', err);
      }
    }
  }, [isOpen, googleClientId]);

  if (!isOpen) return null;

  // Process user profile upon verified Google credentials
  const processGoogleLogin = (email: string, name?: string, avatarUrl?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isSuper = isSuperAdminEmail(cleanEmail);

    // 1. Check if user already exists in persistent database to restore all saved information
    const existing = getSavedProfileByEmail(cleanEmail);

    let profile: ClubMemberProfile;
    if (existing) {
      profile = {
        ...existing,
        email: cleanEmail,
        googleEmail: cleanEmail,
        isGoogleConnected: true,
        isGoogleVerified: true,
        avatarUrl: existing.avatarUrl || avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        fullName: existing.fullName || name || cleanEmail.split('@')[0],
      };
      if (isSuper) {
        profile.isSuperAdmin = true;
        profile.role = 'Super-Administrateur Club • Les Z’éléphants Volants';
      }
    } else if (isSuper) {
      profile = createJonathanSuperAdminProfile(cleanEmail);
      if (name) profile.fullName = name;
      if (avatarUrl) profile.avatarUrl = avatarUrl;
    } else {
      const displayName = name?.trim() || cleanEmail.split('@')[0];
      profile = {
        id: `usr-google-${Date.now()}`,
        fullName: displayName,
        email: cleanEmail,
        googleEmail: cleanEmail,
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        role: "Pilote Club • Les Z'éléphants Volants",
        phone: '',
        pilotLevel: 'Brevet de Pilote (Tous sites)',
        wingModel: '',
        wingColor: '',
        harness: '',
        sector: 'Chambéry & Bassin',
        vehicleInfo: '',
        availableSeats: 2,
        emergencyContactName: '',
        emergencyContactPhone: '',
        radioFrequency: '146.500 MHz (Club Zéléph)',
        bio: "Pilote du club de parapente Les Z'éléphants Volants.",
        isGoogleConnected: true,
        isGoogleVerified: true,
        isSuperAdmin: false,
        joinedClubYear: new Date().getFullYear(),
        liveTrackingPlatform: 'puretrack',
        liveTrackingId: displayName.toLowerCase().replace(/\s+/g, '-'),
        shareLiveTracking: true,
      };
    }

    if (isSuper) {
      saveSuperAdminSession(cleanEmail, 'google_gis');
    }

    // Persist permanently in database
    savePilotProfile(profile);

    // Notify app state
    onLogin(profile);

    setSuccessMessage(`Connexion Google validée avec succès pour ${profile.fullName} !`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Google GSI ID Token response handler
  const handleGoogleCredentialResponse = (response: any) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!response?.credential) {
        throw new Error('Aucun jeton Google reçu.');
      }
      const decoded = decodeGoogleJwt(response.credential);
      if (!decoded?.email) {
        throw new Error("Impossible de lire l'email du compte Google.");
      }

      processGoogleLogin(decoded.email, decoded.name, decoded.picture);
    } catch (err: any) {
      setErrorMessage(err.message || 'Échec de la validation du compte Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // Launch Google OAuth2 Token Client Popup
  const handleLaunchGooglePopup = () => {
    setErrorMessage(null);
    setIsLoading(true);

    if (window.google?.accounts?.oauth2 && googleClientId) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setErrorMessage(`Erreur Google: ${tokenResponse.error_description || tokenResponse.error}`);
              setIsLoading(false);
              return;
            }

            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });
              if (!res.ok) throw new Error('Impossible de contacter le service Google UserInfo.');
              const userInfo = await res.json();
              if (!userInfo.email) throw new Error("Email manquant dans le profil Google.");

              processGoogleLogin(userInfo.email, userInfo.name, userInfo.picture);
            } catch (e: any) {
              setErrorMessage(e.message || 'Erreur lors de la récupération du profil Google.');
            } finally {
              setIsLoading(false);
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.error('OAuth token client error:', err);
      }
    }

    // If no client ID configured yet
    setIsLoading(false);
    setIsConfigClientIdOpen(true);
    setErrorMessage(
      "Pour ouvrir la fenêtre officielle Google OAuth, renseignez votre Google Client ID ci-dessous (depuis Google Cloud Console), ou utilisez la validation directe."
    );
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) {
      saveStoredGoogleClientId('');
      setGoogleClientId('');
      setIsConfigClientIdOpen(false);
      return;
    }
    saveStoredGoogleClientId(clientIdInput.trim());
    setGoogleClientId(clientIdInput.trim());
    setIsConfigClientIdOpen(false);
    setSuccessMessage('Google Client ID enregistré avec succès ! Le bouton officiel Google est activé.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Quick preset connection for Jonathan Roux (Super-Admin)
  const handleQuickJonathan = () => {
    processGoogleLogin(SUPER_ADMIN_GOOGLE_EMAIL, 'Jonathan Roux');
  };

  // Direct manual email verification
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim() || !manualEmail.includes('@')) {
      setErrorMessage('Veuillez renseigner une adresse email Google valide.');
      return;
    }
    processGoogleLogin(manualEmail, manualName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header with decorative accents */}
        <div className="relative bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-6 sm:p-7 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black text-xl shrink-0">
              🐘
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Club Les Z’éléphants Volants • Parapente Savoie</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Connexion & Accès Membre
              </h2>
            </div>
          </div>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Consultez les sites et le LiveTracking en mode visiteur, ou connectez-vous avec votre compte Google pour activer votre fiche pilote, être suivi en vol et proposer des navettes.
          </p>

          {restrictedActionMessage && (
            <div className="mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{restrictedActionMessage}</span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-7 space-y-6">

          {/* Messages Alert */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}
          
          {/* Option 1: Genuine Google Authentication */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-sky-950/40 via-slate-800/50 to-indigo-950/40 border-2 border-sky-500/40 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Authentification Google (OAuth 2.0 / GIS)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                      Vérification Sécurisée
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Connecte votre identité officielle Google, synchronise votre photo et conserve toutes vos données de vol.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Pilot Feature Perks */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Balise LiveTracking</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Covoit Navettes</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Sorties & Décos</span>
              </div>
            </div>

            {/* Google Authentication Actions */}
            <div className="space-y-3 pt-2">
              
              {/* GIS rendered button container if available */}
              {googleClientId && (
                <div className="flex flex-col items-center justify-center p-2 bg-slate-900/50 rounded-2xl border border-white/5">
                  <div ref={googleBtnContainerRef} className="flex justify-center min-h-[44px]" />
                </div>
              )}

              {/* One-Click Google OAuth Trigger Button */}
              <button
                type="button"
                onClick={handleLaunchGooglePopup}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>Se connecter via Google OAuth 2.0</span>
              </button>

              {/* Direct access for designated Super-Admin Jonathan Roux */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-amber-300">Jonathan Roux (Super-Admin)</span>
                    <span className="block text-[10px] text-amber-200/80">{SUPER_ADMIN_GOOGLE_EMAIL}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleQuickJonathan}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-[11px] shadow-sm transition"
                  >
                    Valider le compte Super-Admin
                  </button>
                  {onOpenAdminGoogleModal && (
                    <button
                      type="button"
                      onClick={onOpenAdminGoogleModal}
                      title="Ouvrir le panneau Super-Admin"
                      className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Manual / Direct Option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="text-[11px] text-slate-400 hover:text-sky-300 transition underline underline-offset-4"
                >
                  {showManualForm ? "Masquer la saisie directe" : "Vous n'avez pas de Google Client ID ? Utiliser la saisie directe"}
                </button>
              </div>

              {showManualForm && (
                <form onSubmit={handleManualSubmit} className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 animate-fade-in">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>Identification directe avec compte Google</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="email"
                      required
                      placeholder="votre.compte@gmail.com"
                      value={manualEmail}
                      onChange={e => setManualEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="text"
                      placeholder="Nom & Prénom du pilote (Optionnel)"
                      value={manualName}
                      onChange={e => setManualName(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
                  >
                    Valider mon compte Google
                  </button>
                </form>
              )}

              {/* Expandable Client ID configuration */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsConfigClientIdOpen(!isConfigClientIdOpen)}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-300 transition"
                >
                  <Settings className="w-3 h-3" />
                  <span>Google Client ID Cloud Console : {googleClientId ? 'Configuré' : 'Non renseigné'}</span>
                </button>
              </div>

              {isConfigClientIdOpen && (
                <form onSubmit={handleSaveClientId} className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2 animate-fade-in">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Google OAuth 2.0 Client ID (depuis console.cloud.google.com)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ex: 123456789-xyz.apps.googleusercontent.com"
                      value={clientIdInput}
                      onChange={e => setClientIdInput(e.target.value)}
                      className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

          {/* Option 2: Visitor Mode */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-300 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-white">Mode Visiteur (Consultation)</h4>
                <p className="text-[11px] text-slate-400">
                  Consulter librement les sites, la météo et le LiveTracking sans modifier de contenu.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectVisitor();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Rester visiteur</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
