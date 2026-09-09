import { ShuttleRide, ClubOuting } from '../types';
import { getStoredDiscordConfig } from './discordWebhook';

const SHUTTLE_STORAGE_KEY = 'zeleph_shuttle_rides_v1';
const OUTINGS_STORAGE_KEY = 'zeleph_club_outings_v1';

export interface BotSyncResponse {
  status: string;
  covoits: ShuttleRide[];
  sorties: ClubOuting[];
  timestamp?: string;
  message?: string;
}

/**
 * Normalise l'URL Render en supprimant les espaces et slashes finaux
 */
export function normalizeBotUrl(url?: string): string {
  if (!url) return '';
  let clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  return clean.replace(/\/+$/, '');
}

/**
 * Récupère les données en direct depuis le Bot Render
 */
export async function fetchLiveDiscordSync(customUrl?: string): Promise<{
  success: boolean;
  covoitsCount: number;
  sortiesCount: number;
  message: string;
}> {
  const config = getStoredDiscordConfig();
  const rawUrl = customUrl || config.botApiUrl;
  const baseUrl = normalizeBotUrl(rawUrl);

  if (!baseUrl) {
    return {
      success: false,
      covoitsCount: 0,
      sortiesCount: 0,
      message: "L'adresse du Bot Render n'est pas encore renseignée."
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/sync`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // timeout après 15s (temps nécessaire au réveil Render en mode gratuit)
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      throw new Error(`Le bot a répondu avec le statut HTTP ${res.status}`);
    }

    const rawText = await res.text();
    let data: BotSyncResponse;
    try {
      data = JSON.parse(rawText);
    } catch {
      return {
        success: false,
        covoitsCount: 0,
        sortiesCount: 0,
        message: "⚠️ Le Bot Render est bien en ligne, mais il tourne encore avec l'ancienne version de bot.js (qui n'a pas encore l'API /api/sync). Veuillez mettre à jour bot.js sur votre dépôt GitHub / Render pour activer la remontée automatique vers le site."
      };
    }

    const discordCovoits = Array.isArray(data.covoits) ? data.covoits : [];
    const discordSorties = Array.isArray(data.sorties) ? data.sorties : [];

    let mergedCovoitsCount = 0;
    let mergedSortiesCount = 0;

    // 1. Fusion des Covoiturages dans localStorage
    if (discordCovoits.length > 0) {
      try {
        const rawLocal = localStorage.getItem(SHUTTLE_STORAGE_KEY);
        const localList: ShuttleRide[] = rawLocal ? JSON.parse(rawLocal) : [];

        // Dictionnaire par ID pour mettre à jour ou ajouter
        const map = new Map<string, ShuttleRide>();
        localList.forEach(r => map.set(r.id, r));

        discordCovoits.forEach(dc => {
          if (dc && dc.id) {
            map.set(dc.id, dc);
            mergedCovoitsCount++;
          }
        });

        const updated = Array.from(map.values());
        localStorage.setItem(SHUTTLE_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('zeleph_rides_updated', { detail: updated }));
      } catch (err) {
        console.error('Erreur fusion covoits:', err);
      }
    }

    // 2. Fusion des Sorties dans localStorage
    if (discordSorties.length > 0) {
      try {
        const rawLocal = localStorage.getItem(OUTINGS_STORAGE_KEY);
        const localList: ClubOuting[] = rawLocal ? JSON.parse(rawLocal) : [];

        const map = new Map<string, ClubOuting>();
        localList.forEach(o => map.set(o.id, o));

        discordSorties.forEach(ds => {
          if (ds && ds.id) {
            map.set(ds.id, ds);
            mergedSortiesCount++;
          }
        });

        const updated = Array.from(map.values());
        localStorage.setItem(OUTINGS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('zeleph_outings_updated', { detail: updated }));
      } catch (err) {
        console.error('Erreur fusion sorties:', err);
      }
    }

    return {
      success: true,
      covoitsCount: discordCovoits.length,
      sortiesCount: discordSorties.length,
      message: `Synchronisation réussie ! (${discordCovoits.length} covoiturage(s), ${discordSorties.length} sortie(s))`
    };
  } catch (error: any) {
    console.error('Erreur synchronisation avec le Bot Render:', error);
    return {
      success: false,
      covoitsCount: 0,
      sortiesCount: 0,
      message: error?.message || 'Impossible de contacter le Bot Render.'
    };
  }
}

/**
 * Lance le cycle de synchronisation automatique toutes les N millisecondes
 */
export function initDiscordBotAutoSync(intervalMs = 15000): () => void {
  // Sync initiale
  fetchLiveDiscordSync().catch(() => {});

  const intervalId = setInterval(() => {
    fetchLiveDiscordSync().catch(() => {});
  }, intervalMs);

  return () => clearInterval(intervalId);
}

/**
 * Publie ou met à jour une Navette / Covoiturage directement via le Bot Discord
 * (avec VRAIS BOUTONS NATIFS Discord [Je monte] et [Se désister])
 */
export async function publishRideToBot(
  ride: ShuttleRide,
  customUrl?: string
): Promise<{ ok: boolean; messageId?: string; channelId?: string; isPatched?: boolean; error?: string }> {
  const config = getStoredDiscordConfig();
  const rawUrl = customUrl || config.botApiUrl;
  const baseUrl = normalizeBotUrl(rawUrl);

  if (!baseUrl) {
    return { ok: false, error: "L'adresse du Bot Render n'est pas configurée." };
  }

  try {
    const res = await fetch(`${baseUrl}/api/post-covoit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ ride }),
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { ok: false, error: `Erreur HTTP Bot ${res.status}: ${errText}` };
    }

    const data = await res.json();
    return {
      ok: Boolean(data.ok),
      messageId: data.messageId,
      channelId: data.channelId,
      isPatched: Boolean(data.isPatched),
      error: data.error
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Impossible de contacter le Bot Render." };
  }
}

/**
 * Publie ou met à jour une Sortie Club directement via le Bot Discord
 * (avec VRAIS BOUTONS NATIFS Discord [Je participe !] et [Se désister])
 */
export async function publishOutingToBot(
  outing: ClubOuting,
  customUrl?: string
): Promise<{ ok: boolean; messageId?: string; channelId?: string; isPatched?: boolean; error?: string }> {
  const config = getStoredDiscordConfig();
  const rawUrl = customUrl || config.botApiUrl;
  const baseUrl = normalizeBotUrl(rawUrl);

  if (!baseUrl) {
    return { ok: false, error: "L'adresse du Bot Render n'est pas configurée." };
  }

  try {
    const res = await fetch(`${baseUrl}/api/post-sortie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ outing }),
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { ok: false, error: `Erreur HTTP Bot ${res.status}: ${errText}` };
    }

    const data = await res.json();
    return {
      ok: Boolean(data.ok),
      messageId: data.messageId,
      channelId: data.channelId,
      isPatched: Boolean(data.isPatched),
      error: data.error
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Impossible de contacter le Bot Render." };
  }
}
