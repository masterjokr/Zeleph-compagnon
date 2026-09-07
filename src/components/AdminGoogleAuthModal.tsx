import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ExternalLink,
  Crown,
  LogOut,
  Mail,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  SUPER_ADMIN_GOOGLE_EMAIL, 
  isSuperAdminEmail, 
  decodeGoogleJwt, 
  getStoredGoogleClientId, 
  saveStoredGoogleClientId, 
  saveSuperAdminSession, 
  clearSuperAdminSession, 
  verifyMasterPasscode, 
  createJonathanSuperAdminProfile,
  DEFAULT_ADMIN_PASSPHRASE
} from '../utils/adminGoogleAuth';
import { ClubMemberProfile } from '../types';

interface AdminGoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ClubMemberProfile | null;
  onLoginAsSuperAdmin: (profile: ClubMemberProfile) => void;
  onLogoutSuperAdmin: () => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AdminGoogleAuthModal: React.FC<AdminGoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginAsSuperAdmin,
  onLogoutSuperAdmin,
}) => {
  const [authMethod, setAuthMethod] = useState<'google' | 'passcode'>('google');
  const [googleClientId, setGoogleClientId] = useState<string>(() => getStoredGoogleClientId());
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const isAlreadySuperAdmin = Boolean(currentUser?.isSuperAdmin);

  // Initialize Google Identity Services if available and client_id provided
  useEffect(() => {
    if (!isOpen || isAlreadySuperAdmin) return;

    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 280,
          });
        }
      } catch (err) {
        console.error('Google GSI initialization error:', err);
      }
    }
  }, [isOpen, googleClientId, isAlreadySuperAdmin]);

  if (!isOpen) return null;

  // Handle Google JWT Token response from GSI
  const handleGoogleCredentialResponse = (response: any) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!response || !response.credential) {
        throw new Error('Réponse Google invalide ou annulée.');
      }

      const decoded = decodeGoogleJwt(response.credential);
      if (!decoded || !decoded.email) {
        throw new Error('Impossible de lire l\'adresse email du compte Google.');
      }

      const email = decoded.email.trim().toLowerCase();

      if (!isSuperAdminEmail(email)) {
        throw new Error(
          `Accès Super-Administrateur refusé : Le compte Google « ${email} » n'est pas autorisé. Seul l'administrateur désigné (${SUPER_ADMIN_GOOGLE_EMAIL}) peut déverrouiller cette rubrique.`
        );
      }

      // Validated!
      saveSuperAdminSession(email, 'google_gis');
      const profile = createJonathanSuperAdminProfile(email);
      onLoginAsSuperAdmin(profile);
      setSuccessMessage(`Authentification Google réussie (${email}) ! Privilèges Super-Administrateur activés.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la validation Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // Launch Google OAuth2 Token client or popup
  const handleLaunchGooglePopup = () => {
    setErrorMessage(null);
    setIsLoading(true);

    // If Google OAuth2 token client is available
    if (window.google?.accounts?.oauth2 && googleClientId) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
          hint: SUPER_ADMIN_GOOGLE_EMAIL,
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
              if (!res.ok) throw new Error('Impossible de récupérer le profil Google.');
              const userInfo = await res.json();
              const email = (userInfo.email || '').trim().toLowerCase();

              if (!isSuperAdminEmail(email)) {
                throw new Error(
                  `Accès Super-Admin refusé : Le compte « ${email} » n'est pas autorisé. Seul ${SUPER_ADMIN_GOOGLE_EMAIL} est habilité.`
                );
              }

              saveSuperAdminSession(email, 'google_oauth');
              const profile = createJonathanSuperAdminProfile(email);
              onLoginAsSuperAdmin(profile);
              setSuccessMessage(`Compte Google validé (${email}) ! Droits d'administration activés.`);
              setTimeout(() => {
                onClose();
              }, 1500);
            } catch (err: any) {
              setErrorMessage(err.message || 'Erreur de vérification Google.');
            } finally {
              setIsLoading(false);
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Fallback: If no custom Client ID is configured yet, guide to passcode or configure ID
    setShowClientIdConfig(true);
    setIsLoading(false);
    setErrorMessage(
      `Pour activer la connexion Google en 1 clic sur votre domaine, renseignez votre Google Client ID ci-dessous, ou utilisez directement votre Code Administrateur personnel.`
    );
  };

  // Passcode verification for emergency / offline admin access
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!passcodeInput.trim()) {
      setErrorMessage('Veuillez saisir votre code d\'accès administrateur.');
      return;
    }

    if (!verifyMasterPasscode(passcodeInput.trim())) {
      setErrorMessage('Code administrateur incorrect. Vérifiez vos identifiants.');
      return;
    }

    saveSuperAdminSession(SUPER_ADMIN_GOOGLE_EMAIL, 'master_passcode');
    const profile = createJonathanSuperAdminProfile(SUPER_ADMIN_GOOGLE_EMAIL);
    onLoginAsSuperAdmin(profile);
    setSuccessMessage(`Identité confirmée : Jonathan ROUX (${SUPER_ADMIN_GOOGLE_EMAIL}). Privilèges Super-Administrateur activés.`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSaveClientId = () => {
    saveStoredGoogleClientId(googleClientId);
    setShowClientIdConfig(false);
    setSuccessMessage('Client ID Google enregistré.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header with Google & Admin Styling */}
        <div className="relative bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/50 p-6 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                <span>Sécurité & Modération Club</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                Espace Super-Administrateur
              </h3>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            Accès strictement restreint au gestionnaire officiel du club. L'accès est verrouillé au compte Google :
          </p>

          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-xs font-mono text-amber-200">
            <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold">{SUPER_ADMIN_GOOGLE_EMAIL}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Status banner if already logged in as Super-Admin */}
          {isAlreadySuperAdmin && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <strong className="text-xs font-bold block">Mode Super-Administrateur Actif</strong>
                  <span className="text-[11px] text-emerald-200/80">
                    Connecté : Jonathan Roux ({SUPER_ADMIN_GOOGLE_EMAIL})
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vous disposez de tous les droits de modération : suppression et masquage des topos, purge de l'annuaire et édition des fiches de site.
              </p>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    clearSuperAdminSession();
                    onLogoutSuperAdmin();
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Quitter le mode Administrateur</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {!isAlreadySuperAdmin && (
            <>
              {/* Method Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('google');
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    authMethod === 'google'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Compte Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('passcode');
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    authMethod === 'passcode'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Code Sécurité</span>
                </button>
              </div>

              {/* TAB 1: Google Account Authentication */}
              {authMethod === 'google' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Connectez-vous avec votre adresse Google pour certifier votre identité :
                    </p>

                    <div className="flex flex-col items-center justify-center gap-3 pt-1">
                      {/* Container for GSI button if initialized */}
                      <div ref={googleBtnContainerRef} className="min-h-[44px] flex items-center justify-center" />

                      {/* Launch Popup button */}
                      <button
                        type="button"
                        onClick={handleLaunchGooglePopup}
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-[0.98]"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>{isLoading ? 'Vérification en cours...' : 'Se connecter avec Google'}</span>
                      </button>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Vérification d'email : <strong>{SUPER_ADMIN_GOOGLE_EMAIL}</strong></span>
                      <button
                        type="button"
                        onClick={() => setShowClientIdConfig(!showClientIdConfig)}
                        className="text-indigo-400 hover:underline"
                      >
                        {showClientIdConfig ? 'Masquer config Client ID' : 'Google Client ID'}
                      </button>
                    </div>
                  </div>

                  {/* Optional Google Client ID input */}
                  {showClientIdConfig && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2 animate-fade-in text-xs">
                      <label className="block text-slate-300 font-semibold">
                        Google Cloud OAuth Client ID (Optionnel)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={googleClientId}
                          onChange={(e) => setGoogleClientId(e.target.value)}
                          placeholder="Ex: 1234567890-xxx.apps.googleusercontent.com"
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleSaveClientId}
                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                        >
                          Enregistrer
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Créé dans <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Google Cloud Console</a> avec l'origine autorisée <code className="text-sky-300 font-mono">{window.location.origin}</code>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Emergency Passcode Verification */}
              {authMethod === 'passcode' && (
                <form onSubmit={handlePasscodeSubmit} className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/20 space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                      <KeyRound className="w-4 h-4" />
                      <span>Code de secours personnel (Jonathan ROUX)</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Saisissez votre code secret d'administrateur pour certifier votre identité instantanément, même sans configuration Google Cloud préalable :
                    </p>

                    <div>
                      <input
                        type="password"
                        value={passcodeInput}
                        onChange={(e) => setPasscodeInput(e.target.value)}
                        placeholder="Code administrateur secret"
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Code par défaut : <code className="text-amber-300 font-mono font-bold">{DEFAULT_ADMIN_PASSPHRASE}</code></span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Déverrouiller les droits Super-Administrateur</span>
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-6 py-4 bg-slate-950 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Seul l'email <strong>{SUPER_ADMIN_GOOGLE_EMAIL}</strong> est habilité.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-300 hover:text-white font-semibold"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
