import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface DiscordUserResponse {
  id: string;
  username: string;
  global_name?: string | null;
  discriminator: string;
  avatar?: string | null;
  email?: string | null;
}

export const OAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const [pilotName, setPilotName] = useState('');
  const [pilotAvatar, setPilotAvatar] = useState('');

  useEffect(() => {
    async function handleAuth() {
      try {
        // Parse hash (Implicit Grant) and search params
        const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
        const search = window.location.search.startsWith('?') ? window.location.search.substring(1) : window.location.search;
        
        const params = new URLSearchParams(hash || search);
        
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          if (error === 'access_denied') {
            throw new Error('Autorisation refusée sur Discord. Vous pouvez retenter quand vous le souhaitez.');
          }
          throw new Error(errorDescription || `Erreur Discord: ${error}`);
        }

        const accessToken = params.get('access_token');
        if (!accessToken) {
          // If no token, check if code was passed instead
          const code = params.get('code');
          if (code) {
            throw new Error('Ce flux utilise un code d\'autorisation au lieu d\'un jeton direct (Implicit Grant). Veuillez vérifier la configuration de l\'application Discord.');
          }
          throw new Error('Aucun jeton d\'accès reçu depuis Discord.');
        }

        // Fetch official Discord user profile
        const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error(`Impossible de récupérer le profil Discord (${userResponse.status}: ${userResponse.statusText})`);
        }

        const userData: DiscordUserResponse = await userResponse.json();

        // Calculate avatar URL
        let avatarUrl = '';
        if (userData.avatar) {
          const isAnimated = userData.avatar.startsWith('a_');
          avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.${isAnimated ? 'gif' : 'png'}?size=256`;
        } else {
          // Default avatar calculation
          const defaultAvatarIndex = userData.discriminator && userData.discriminator !== '0'
            ? parseInt(userData.discriminator) % 5
            : (Number(BigInt(userData.id) >> 22n) % 6);
          avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
        }

        // Try to fetch user's guilds to verify membership in Zéléph server
        let guilds: any[] = [];
        let isZelephMember = false;
        try {
          const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (guildsRes.ok) {
            guilds = await guildsRes.json();
            isZelephMember = guilds.some((g: any) => 
              g.id === '933405606113591347' ||
              g.name?.toLowerCase().includes('zeleph') || 
              g.name?.toLowerCase().includes("z'éléphant") ||
              g.name?.toLowerCase().includes("z’éléphant") ||
              g.name?.toLowerCase().includes('elephant')
            );
          }
        } catch {
          // guilds scope optional
        }

        const displayName = userData.global_name || userData.username;
        setPilotName(displayName);
        setPilotAvatar(avatarUrl);
        setStatus('success');

        const payload = {
          type: 'DISCORD_OAUTH_SUCCESS',
          token: accessToken,
          user: {
            id: userData.id,
            username: userData.username,
            globalName: displayName,
            discriminator: userData.discriminator !== '0' ? userData.discriminator : undefined,
            avatarUrl,
            email: userData.email,
            isZelephMember,
          },
        };

        // Notify parent window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(payload, '*');
          // Auto close after brief delay
          setTimeout(() => {
            try {
              window.close();
            } catch {
              // ignore
            }
          }, 1200);
        } else {
          // Store fallback in localStorage
          localStorage.setItem('zeleph_pending_discord_oauth', JSON.stringify(payload));
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }
      } catch (err: any) {
        console.error('Erreur retour Discord OAuth:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Une erreur est survenue lors de la synchronisation Discord.');
      }
    }

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-[#5865F2]">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#5865F2]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="p-3.5 rounded-2xl bg-[#5865F2] text-white shadow-xl shadow-[#5865F2]/30 animate-pulse">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
        </div>

        {status === 'processing' && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Synchronisation Discord en cours...
            </h2>
            <p className="text-xs text-slate-400">
              Vérification de vos identifiants et récupération de votre avatar et pseudo officiel.
            </p>
            <div className="flex justify-center pt-2">
              <div className="w-8 h-8 border-3 border-[#5865F2]/20 border-t-[#5865F2] rounded-full animate-spin" />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-fade-in">
            {pilotAvatar && (
              <div className="flex justify-center">
                <img
                  src={pilotAvatar}
                  alt={pilotName}
                  className="w-20 h-20 rounded-2xl border-2 border-emerald-400 shadow-xl object-cover"
                />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Connexion réussie !</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Bienvenue, {pilotName} !
              </h2>
              <p className="text-xs text-slate-400">
                Votre profil et vos rôles Discord sont synchronisés avec l'Espace Membres des Zéléph.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  try {
                    window.close();
                  } catch {
                    window.location.href = '/';
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs transition"
              >
                Fermer cette fenêtre
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-center text-rose-400">
              <XCircle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">
                Échec de la connexion Discord
              </h2>
              <p className="text-xs text-rose-300/90 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs transition"
              >
                Réessayer
              </button>
              <button
                onClick={() => {
                  try {
                    window.close();
                  } catch {
                    window.location.href = '/';
                  }
                }}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
