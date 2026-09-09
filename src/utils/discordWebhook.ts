import { ShuttleRide, ClubOuting } from '../types';
import { publishRideToBot, publishOutingToBot } from './botSyncService';

export interface DiscordIntegrationConfig {
  shuttleWebhookUrl: string;
  outingWebhookUrl: string;
  botApiUrl?: string; // URL Render publique du Bot (ex: https://bot-zelephants.onrender.com)
  autoSyncShuttles: boolean;
  autoSyncOutings: boolean;
  serverName?: string;
  lastTestStatus?: 'success' | 'error' | null;
  lastTestMessage?: string;
  lastTestedAt?: string;
}

const STORAGE_KEY = 'zeleph_discord_integration_v1';

export const DEFAULT_DISCORD_CONFIG: DiscordIntegrationConfig = {
  shuttleWebhookUrl: '',
  outingWebhookUrl: '',
  botApiUrl: '',
  autoSyncShuttles: true,
  autoSyncOutings: true,
  serverName: 'Discord Les Z’éléphants Volants',
  lastTestStatus: null,
  lastTestMessage: '',
  lastTestedAt: undefined,
};

export function getStoredDiscordConfig(): DiscordIntegrationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DISCORD_CONFIG;
    return { ...DEFAULT_DISCORD_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Erreur lecture configuration Discord:', e);
    return DEFAULT_DISCORD_CONFIG;
  }
}

export function saveStoredDiscordConfig(config: DiscordIntegrationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Erreur sauvegarde configuration Discord:', e);
  }
}

/**
 * URL de base de l'application (dynamique selon le déploiement ou preview)
 */
export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}${window.location.pathname}`;
  }
  return 'https://ais-pre-ucrx4pzhdmx74iblko65vw-880235871105.europe-west2.run.app';
}

/**
 * Envoie un webhook Discord formaté avec embed et wait=true pour récupérer l'ID du message
 */
async function postToDiscordWebhook(
  webhookUrl: string, 
  payload: any
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return { ok: false, error: "L'URL du Webhook Discord est invalide (doit commencer par https://discord.com/api/webhooks/)." };
  }

  // Append ?wait=true to receive message object with id
  const targetUrl = webhookUrl.includes('?') ? `${webhookUrl}&wait=true` : `${webhookUrl}?wait=true`;

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 204) {
      let messageId: string | undefined;
      try {
        const data = await res.json();
        if (data && data.id) {
          messageId = data.id;
        }
      } catch {
        // No body or 204
      }
      return { ok: true, messageId };
    } else {
      const errText = await res.text().catch(() => 'Erreur inconnue');
      return { ok: false, error: `Erreur Discord HTTP ${res.status}: ${errText}` };
    }
  } catch (err: any) {
    return { ok: false, error: err?.message || "Impossible de joindre le serveur Discord (vérifiez l'URL ou la connexion)." };
  }
}

/**
 * Met à jour un message Discord existant SANS créer de doublon (évite la redondance)
 * Utilise l'API Discord: PATCH /api/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}
 */
async function patchDiscordWebhookMessage(
  webhookUrl: string, 
  messageId: string, 
  payload: any
): Promise<{ ok: boolean; error?: string }> {
  if (!webhookUrl || !messageId) {
    return { ok: false, error: "URL de Webhook ou identifiant de message Discord manquant." };
  }

  const cleanUrl = webhookUrl.split('?')[0].replace(/\/$/, '');
  const patchUrl = `${cleanUrl}/messages/${messageId}`;

  try {
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { ok: true };
    } else {
      const errText = await res.text().catch(() => 'Erreur inconnue');
      return { ok: false, error: `Erreur Discord PATCH HTTP ${res.status}: ${errText}` };
    }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Erreur réseau lors de la mise à jour du message Discord.' };
  }
}

/**
 * Construit l'embed Discord enrichi pour une navette / covoiturage
 */
export function buildShuttleDiscordPayload(ride: ShuttleRide): any {
  const appUrl = getAppBaseUrl();
  const joinLink = `${appUrl}?join_ride=${encodeURIComponent(ride.id)}`;
  const remaining = ride.availableSeats;
  const isFull = remaining <= 0;
  const passengerCount = ride.passengers?.length || 0;

  const statusBadge = isFull 
    ? '🔴 **COMPLET** (0 place restante)' 
    : `🟢 **${remaining} place${remaining > 1 ? 's' : ''} disponible${remaining > 1 ? 's' : ''}** (sur ${ride.totalSeats} au total)`;

  const passengersList = passengerCount > 0
    ? ride.passengers.map((name, i) => `${i + 1}. **${name}**`).join('\n')
    : '_Aucun passager pour l’instant (soyez le premier !)_';

  return {
    username: "Navettes Z'éléphants Volants",
    avatar_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=128&auto=format&fit=crop&q=80",
    embeds: [
      {
        title: `🚗 Covoiturage Parapente : ${ride.destinationSiteName}`,
        description: `💬 *"${ride.comment || 'Navette rotation pour monter au décollage !'}"*\n\n👉 **[CLIQUEZ ICI POUR VOUS INSCRIRE EN 1 CLIC (WEB)](${joinLink})**`,
        color: isFull ? 0xef4444 : 0x0284c7, // Red if full, sky blue if seats available
        fields: [
          {
            name: "💺 Places disponibles",
            value: `${statusBadge}\n📊 **${passengerCount}** réservée(s) / **${ride.totalSeats}** max`,
            inline: true,
          },
          {
            name: `👥 Inscrits (${passengerCount}/${ride.totalSeats})`,
            value: passengersList,
            inline: true,
          },
          {
            name: "📍 Lieu de rendez-vous",
            value: `**${ride.departurePlace || 'À convenir'}**`,
            inline: true,
          },
          {
            name: "🕒 Heure de départ",
            value: `**${ride.departureTime || 'À convenir'}**`,
            inline: true,
          },
          {
            name: "👤 Conducteur",
            value: `**${ride.driverName}**${ride.driverPhone ? ` (📞 ${ride.driverPhone})` : ''}`,
            inline: true,
          },
          {
            name: "🪂 Voiles & Sacs",
            value: ride.wingTypes || 'Solo / Tandem',
            inline: true,
          },
          {
            name: "⚡ Synchronisation & Inscription",
            value: `[👉 Réserver ma place sur le site web](${joinLink})\n*Mise à jour en direct : dès qu'un membre s'inscrit sur le site, ce message s'actualise automatiquement !*`,
            inline: false,
          }
        ],
        footer: {
          text: `Zéléph SkyHub • Covoiturages synchronisés • Réf: ${ride.id}`,
          icon_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=64&auto=format&fit=crop&q=80"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };
}

/**
 * Construit l'embed Discord enrichi pour une sortie club
 */
export function buildOutingDiscordPayload(outing: ClubOuting): any {
  const appUrl = getAppBaseUrl();
  const joinLink = `${appUrl}?join_outing=${encodeURIComponent(outing.id)}`;
  const participantCount = outing.participants?.length || 0;
  const max = outing.maxParticipants || 8;
  const remaining = Math.max(0, max - participantCount);
  const isFull = remaining <= 0;

  const statusBadge = isFull 
    ? '🔴 **SORTIE COMPLÈTE**' 
    : `🟢 **${remaining} place${remaining > 1 ? 's' : ''} disponible${remaining > 1 ? 's' : ''}** (${participantCount}/${max} inscrits)`;

  const participantsList = participantCount > 0
    ? outing.participants.map((p, i) => `${i + 1}. **${p.name}**${p.level ? ` _(${p.level})_` : ''}`).join('\n')
    : '_Aucun participant inscrit pour l’instant_';

  return {
    username: "Sorties Z'éléphants Volants",
    avatar_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=128&auto=format&fit=crop&q=80",
    embeds: [
      {
        title: `📅 Sortie Club : ${outing.title}`,
        description: `${outing.description ? `📝 *${outing.description}*\n\n` : ''}👉 **[CLIQUEZ ICI POUR VOUS INSCRIRE À LA SORTIE (WEB)](${joinLink})**`,
        color: isFull ? 0xef4444 : 0x10b981, // Emerald green, red if full
        fields: [
          {
            name: "👥 Places & Inscriptions",
            value: `${statusBadge}\n📊 **${participantCount}** inscrit(s) / **${max}** max`,
            inline: true,
          },
          {
            name: `📋 Liste des participants (${participantCount}/${max})`,
            value: participantsList,
            inline: true,
          },
          {
            name: "⛰️ Site / Massif",
            value: `**${outing.siteName || 'Non précisé'}**`,
            inline: true,
          },
          {
            name: "📆 Date & Heure",
            value: `**${outing.date}** à **${outing.time}**`,
            inline: true,
          },
          {
            name: "📍 Point de rendez-vous",
            value: `**${outing.meetingPoint || 'Voir annonce'}**`,
            inline: true,
          },
          {
            name: "🪂 Niveau requis",
            value: outing.conditionsRequired.minPilotLevel || 'Tous niveaux',
            inline: true,
          },
          {
            name: "👤 Organisateur",
            value: `**${outing.organizerName}**${outing.organizerPhone ? ` (📞 ${outing.organizerPhone})` : ''}`,
            inline: true,
          },
          {
            name: "⚡ Synchronisation & Inscription",
            value: `[👉 S'inscrire à cette sortie sur le site web](${joinLink})\n*La liste des inscrits et le nombre de places restantes s'actualisent en direct sans doublon.*`,
            inline: false,
          }
        ],
        footer: {
          text: `Zéléph SkyHub • Calendrier Sorties Club • Réf: ${outing.id}`,
          icon_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=64&auto=format&fit=crop&q=80"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };
}

/**
 * Envoie un covoiturage vers Discord (crée le message initial)
 * - Priorité au Bot Render : publie avec les VRAIS boutons natifs Discord [Je monte] et [Se désister]
 * - Repli Webhook si le Bot Render n'est pas configuré ou injoignable
 */
export async function sendShuttleToDiscord(
  ride: ShuttleRide, 
  webhookUrlOverride?: string
): Promise<{ ok: boolean; messageId?: string; channelId?: string; webhookUrlUsed?: string; botUsed?: boolean; error?: string }> {
  const config = getStoredDiscordConfig();

  // 1. Priorité au Bot Render pour les boutons cliquables natifs Discord
  if (config.botApiUrl) {
    try {
      const botRes = await publishRideToBot(ride);
      if (botRes.ok) {
        return {
          ok: true,
          messageId: botRes.messageId,
          channelId: botRes.channelId,
          botUsed: true
        };
      }
      console.warn("Échec d'envoi navette via Bot Render, repli sur Webhook :", botRes.error);
    } catch (botErr) {
      console.warn("Exception Bot Render navette, repli sur Webhook :", botErr);
    }
  }

  // 2. Repli Webhook
  const url = webhookUrlOverride || config.shuttleWebhookUrl;
  if (!url) {
    return { ok: false, error: "Aucune adresse de Bot Render ni de Webhook Discord configurée pour les covoiturages." };
  }

  const payload = buildShuttleDiscordPayload(ride);
  const result = await postToDiscordWebhook(url, payload);

  return {
    ...result,
    webhookUrlUsed: url,
    botUsed: false
  };
}

/**
 * Synchronise une navette existante avec Discord :
 * - Si Bot Render actif : met à jour le message Discord en direct avec boutons actifs.
 * - Sinon si messageId présent : met à jour le message Webhook existant (PATCH) sans doublon.
 * - Sinon : poste un nouveau message.
 */
export async function syncShuttleWithDiscord(
  ride: ShuttleRide
): Promise<{ ok: boolean; messageId?: string; channelId?: string; isPatched?: boolean; botUsed?: boolean; error?: string }> {
  const config = getStoredDiscordConfig();

  // 1. Priorité au Bot Render
  if (config.botApiUrl) {
    try {
      const botRes = await publishRideToBot(ride);
      if (botRes.ok) {
        return {
          ok: true,
          messageId: botRes.messageId,
          channelId: botRes.channelId,
          isPatched: botRes.isPatched,
          botUsed: true
        };
      }
      console.warn("Échec synchro navette via Bot Render, repli sur Webhook :", botRes.error);
    } catch (botErr) {
      console.warn("Exception Bot Render synchro navette :", botErr);
    }
  }

  // 2. Repli Webhook
  const webhookUrl = ride.discordWebhookUrl || config.shuttleWebhookUrl;
  if (!webhookUrl) {
    return { ok: false, error: "Aucune adresse de Bot Render ni de Webhook Discord configurée." };
  }

  const payload = buildShuttleDiscordPayload(ride);

  if (ride.discordMessageId) {
    const patchRes = await patchDiscordWebhookMessage(webhookUrl, ride.discordMessageId, payload);
    if (patchRes.ok) {
      return { ok: true, messageId: ride.discordMessageId, isPatched: true, botUsed: false };
    }
    console.warn("Échec du PATCH Discord (message peut-être supprimé), envoi d'un nouveau message :", patchRes.error);
  }

  const postRes = await postToDiscordWebhook(webhookUrl, payload);
  return {
    ok: postRes.ok,
    messageId: postRes.messageId,
    isPatched: false,
    botUsed: false,
    error: postRes.error
  };
}

/**
 * Envoie une sortie club vers Discord (crée le message initial)
 * - Priorité au Bot Render : publie avec les VRAIS boutons natifs Discord [🪂 Je participe !] et [❌ Se désister]
 * - Repli Webhook si le Bot Render n'est pas configuré ou injoignable
 */
export async function sendOutingToDiscord(
  outing: ClubOuting, 
  webhookUrlOverride?: string
): Promise<{ ok: boolean; messageId?: string; channelId?: string; webhookUrlUsed?: string; botUsed?: boolean; error?: string }> {
  const config = getStoredDiscordConfig();

  // 1. Priorité au Bot Render pour les boutons cliquables natifs Discord
  if (config.botApiUrl) {
    try {
      const botRes = await publishOutingToBot(outing);
      if (botRes.ok) {
        return {
          ok: true,
          messageId: botRes.messageId,
          channelId: botRes.channelId,
          botUsed: true
        };
      }
      console.warn("Échec d'envoi sortie via Bot Render, repli sur Webhook :", botRes.error);
    } catch (botErr) {
      console.warn("Exception Bot Render sortie, repli sur Webhook :", botErr);
    }
  }

  // 2. Repli Webhook
  const url = webhookUrlOverride || config.outingWebhookUrl || config.shuttleWebhookUrl;
  if (!url) {
    return { ok: false, error: "Aucune adresse de Bot Render ni de Webhook Discord configurée pour les sorties club." };
  }

  const payload = buildOutingDiscordPayload(outing);
  const result = await postToDiscordWebhook(url, payload);

  return {
    ...result,
    webhookUrlUsed: url,
    botUsed: false
  };
}

/**
 * Synchronise une sortie club existante avec Discord (PATCH sans doublon)
 * - Si Bot Render actif : met à jour le message Discord existant avec boutons d'inscription toujours actifs
 * - Sinon : PATCH Webhook sans doublon
 */
export async function syncOutingWithDiscord(
  outing: ClubOuting
): Promise<{ ok: boolean; messageId?: string; channelId?: string; isPatched?: boolean; botUsed?: boolean; error?: string }> {
  const config = getStoredDiscordConfig();

  // 1. Priorité au Bot Render
  if (config.botApiUrl) {
    try {
      const botRes = await publishOutingToBot(outing);
      if (botRes.ok) {
        return {
          ok: true,
          messageId: botRes.messageId,
          channelId: botRes.channelId,
          isPatched: botRes.isPatched,
          botUsed: true
        };
      }
      console.warn("Échec synchro sortie via Bot Render, repli sur Webhook :", botRes.error);
    } catch (botErr) {
      console.warn("Exception Bot Render synchro sortie :", botErr);
    }
  }

  // 2. Repli Webhook
  const webhookUrl = outing.discordWebhookUrl || config.outingWebhookUrl || config.shuttleWebhookUrl;
  if (!webhookUrl) {
    return { ok: false, error: "Aucune adresse de Bot Render ni de Webhook Discord configurée." };
  }

  const payload = buildOutingDiscordPayload(outing);

  if (outing.discordMessageId) {
    const patchRes = await patchDiscordWebhookMessage(webhookUrl, outing.discordMessageId, payload);
    if (patchRes.ok) {
      return { ok: true, messageId: outing.discordMessageId, isPatched: true, botUsed: false };
    }
    console.warn("Échec du PATCH Discord sortie, envoi d'un nouveau message :", patchRes.error);
  }

  const postRes = await postToDiscordWebhook(webhookUrl, payload);
  return {
    ok: postRes.ok,
    messageId: postRes.messageId,
    isPatched: false,
    botUsed: false,
    error: postRes.error
  };
}

/**
 * Envoie un message de test vers Discord
 */
export async function testDiscordWebhook(
  webhookUrl: string, 
  channelName: string = 'Général'
): Promise<{ ok: boolean; error?: string }> {
  const appUrl = getAppBaseUrl();

  const payload = {
    username: "Z'éléphants Volants Bot",
    avatar_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=128&auto=format&fit=crop&q=80",
    embeds: [
      {
        title: "🐘 Passerelle Discord Zéléph connectée !",
        description: `La synchronisation bidirectionnelle entre votre serveur Discord et l'application **Les Z'éléphants Volants** est opérationnelle sur le salon **#${channelName}**.`,
        color: 0x0284c7, // Sky blue
        fields: [
          {
            name: "⚡ Synchronisation bidirectionnelle",
            value: "• **Places limitées** : affichage en direct du nombre de places restantes (vert/rouge)\n• **Liste des inscrits** : actualisation instantanée dès qu'un membre rejoint\n• **Pas de doublons** : les messages existants se mettent à jour automatiquement sur Discord (PATCH)",
            inline: false
          },
          {
            name: "🔗 Inscription en 1 clic",
            value: `Chaque message Discord inclut un lien direct permettant aux membres de réserver leur place depuis leur téléphone ou leur PC :\n👉 [Ouvrir l'application du Club](${appUrl})`,
            inline: false
          }
        ],
        footer: {
          text: "Club Parapente Les Z'éléphants Volants • Chambéry & Savoie",
          icon_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=64&auto=format&fit=crop&q=80"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  return postToDiscordWebhook(webhookUrl, payload);
}

/**
 * Exemple de code prêt à l'emploi pour un bot Discord (pour slash commands /covoit et boutons)
 */
export const DISCORD_BOT_SAMPLE_CODE = `// Bot Discord Zéléph - zeleph-discord-bot.js
// Pour installer : npm install discord.js
const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN; // Votre token de bot Discord
const APP_URL = "https://ais-pre-ucrx4pzhdmx74iblko65vw-880235871105.europe-west2.run.app";

client.once('ready', () => {
  console.log(\`✅ Bot Zéléph en ligne : \${client.user.tag}\`);
});

// Gestion des interactions (Boutons et Commandes)
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    // Bouton pour s'inscrire
    if (interaction.customId.startsWith('join_ride_')) {
      const rideId = interaction.customId.replace('join_ride_', '');
      await interaction.reply({
        content: \`🪂 **Réservation de place** : Cliquez sur le lien pour valider votre inscription instantanément :\\n👉 \${APP_URL}?join_ride=\${rideId}\`,
        ephemeral: true
      });
    }
  }
});

client.login(BOT_TOKEN);
`;
