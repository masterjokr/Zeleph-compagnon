import React, { useState } from 'react';
import { 
  X, Check, AlertCircle, Send, ExternalLink, RefreshCw, 
  Car, Calendar, Sparkles, Copy, MessageSquare, ArrowRight, ShieldCheck,
  Users, Layers, Terminal, CheckCircle2, ChevronRight, Download, FolderArchive
} from 'lucide-react';
import { 
  getStoredDiscordConfig, 
  saveStoredDiscordConfig, 
  testDiscordWebhook,
  sendShuttleToDiscord,
  syncShuttleWithDiscord,
  DiscordIntegrationConfig 
} from '../utils/discordWebhook';
import { generateBotZip } from '../utils/botZipGenerator';
import { fetchLiveDiscordSync, publishRideToBot, publishOutingToBot } from '../utils/botSyncService';
import { ShuttleRide, ClubOuting } from '../types';

interface DiscordIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateIncomingShuttle?: (shuttle: ShuttleRide) => void;
  onSimulateIncomingOuting?: (outing: ClubOuting) => void;
}

export const DiscordIntegrationModal: React.FC<DiscordIntegrationModalProps> = ({
  isOpen,
  onClose,
  onSimulateIncomingShuttle,
  onSimulateIncomingOuting
}) => {
  const [config, setConfig] = useState<DiscordIntegrationConfig>(getStoredDiscordConfig);
  const [activeTab, setActiveTab] = useState<'guide' | 'settings' | 'sync' | 'reverse' | 'bot'>('sync');
  const [testingShuttle, setTestingShuttle] = useState(false);
  const [testingOuting, setTestingOuting] = useState(false);
  const [testingBotUrl, setTestingBotUrl] = useState(false);
  const [testingLiveSync, setTestingLiveSync] = useState(false);
  const [testingBotOuting, setTestingBotOuting] = useState(false);
  const [testingBotRide, setTestingBotRide] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [botTokenInput, setBotTokenInput] = useState<string>('');
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBotZip = async () => {
    try {
      setDownloadingZip(true);
      const blob = await generateBotZip(botTokenInput);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bot-zelephants-discord.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setTestResult({
        type: 'success',
        message: '📦 Fichier bot-zelephants-discord.zip téléchargé sur votre ordinateur !'
      });
      setTimeout(() => setTestResult(null), 5000);
    } catch (err: any) {
      setTestResult({
        type: 'error',
        message: `Erreur lors de la création du ZIP : ${err?.message || 'Erreur inconnue'}`
      });
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleSave = () => {
    saveStoredDiscordConfig(config);
    setTestResult({
      type: 'success',
      message: 'Configuration Discord enregistrée avec succès !'
    });
    setTimeout(() => setTestResult(null), 3500);
  };

  const handleTestShuttle = async () => {
    if (!config.shuttleWebhookUrl) {
      setTestResult({
        type: 'error',
        message: "Veuillez d'abord coller l'URL de Webhook pour le salon Covoiturages."
      });
      return;
    }

    setTestingShuttle(true);
    setTestResult(null);

    const result = await testDiscordWebhook(config.shuttleWebhookUrl, 'covoiturage');
    setTestingShuttle(false);

    if (result.ok) {
      const updated = {
        ...config,
        lastTestStatus: 'success' as const,
        lastTestMessage: 'Test Covoiturage envoyé avec succès sur Discord.',
        lastTestedAt: new Date().toLocaleTimeString('fr-FR')
      };
      setConfig(updated);
      saveStoredDiscordConfig(updated);
      setTestResult({
        type: 'success',
        message: '🎉 Message de test envoyé avec succès sur votre salon Discord ! Regardez votre Discord !'
      });
    } else {
      setTestResult({
        type: 'error',
        message: result.error || 'Erreur lors de l\'envoi vers Discord.'
      });
    }
  };

  const handleTestOuting = async () => {
    const url = config.outingWebhookUrl || config.shuttleWebhookUrl;
    if (!url) {
      setTestResult({
        type: 'error',
        message: "Veuillez d'abord coller une URL de Webhook."
      });
      return;
    }

    setTestingOuting(true);
    setTestResult(null);

    const result = await testDiscordWebhook(url, 'sorties-club');
    setTestingOuting(false);

    if (result.ok) {
      const updated = {
        ...config,
        lastTestStatus: 'success' as const,
        lastTestMessage: 'Test Sorties envoyé avec succès sur Discord.',
        lastTestedAt: new Date().toLocaleTimeString('fr-FR')
      };
      setConfig(updated);
      saveStoredDiscordConfig(updated);
      setTestResult({
        type: 'success',
        message: '🎉 Message de test envoyé avec succès sur votre salon Discord !'
      });
    } else {
      setTestResult({
        type: 'error',
        message: result.error || 'Erreur lors de l\'envoi vers Discord.'
      });
    }
  };

  const handleTestBotConnection = async (urlToTest?: string) => {
    const targetUrl = urlToTest || config.botApiUrl;
    if (!targetUrl) {
      setTestResult({
        type: 'error',
        message: "Veuillez d'abord coller l'URL de votre Bot Render (ex: https://votre-bot.onrender.com)."
      });
      return;
    }

    setTestingBotUrl(true);
    setTestResult(null);
    try {
      const res = await fetchLiveDiscordSync(targetUrl);
      if (res.success) {
        setTestResult({
          type: 'success',
          message: `🎉 Connexion établie avec votre Bot Render ! (${res.covoitsCount} covoiturage(s) et ${res.sortiesCount} sortie(s) récupérés depuis Discord).`
        });
        const updated = {
          ...config,
          botApiUrl: targetUrl.trim(),
          lastTestedAt: new Date().toLocaleTimeString('fr-FR')
        };
        setConfig(updated);
        saveStoredDiscordConfig(updated);
      } else {
        setTestResult({
          type: 'error',
          message: res.message || 'Impossible de contacter le Bot Render.'
        });
      }
    } catch (err: any) {
      setTestResult({
        type: 'error',
        message: `Erreur : ${err?.message || 'Impossible de contacter le Bot'}`
      });
    } finally {
      setTestingBotUrl(false);
    }
  };

  // Test live in-place update (PATCH existing Discord message without duplicate)
  const handleTestLiveSync = async () => {
    const url = config.shuttleWebhookUrl || config.outingWebhookUrl;
    if (!url) {
      setTestResult({
        type: 'error',
        message: "Veuillez d'abord coller l'URL de Webhook dans l'onglet 2 (Paramètres)."
      });
      return;
    }

    setTestingLiveSync(true);
    setTestResult(null);

    // Step 1: Create a test ride with 3 seats available and 1 passenger
    const testRide: ShuttleRide = {
      id: `test-live-${Date.now()}`,
      driverName: "Jonathan ROUX (Test Club)",
      driverPhone: "06 12 34 56 78",
      departurePlace: "Atterrissage Verel",
      destinationSiteId: "verel",
      destinationSiteName: "Verel - Pragondran",
      departureTime: "14:30",
      availableSeats: 3,
      totalSeats: 4,
      passengers: ["Lucas B. (Inscrit #1)"],
      wingTypes: "Solo & Biplace",
      comment: "🧪 Test live : Regardez ce message Discord, il va se mettre à jour tout seul dans 3 secondes !",
      createdAt: new Date().toISOString()
    };

    const firstRes = await sendShuttleToDiscord(testRide);
    if (!firstRes.ok || !firstRes.messageId) {
      setTestingLiveSync(false);
      setTestResult({
        type: 'error',
        message: `Erreur lors de l'envoi initial : ${firstRes.error || 'Vérifiez le Webhook'}`
      });
      return;
    }

    setTestResult({
      type: 'success',
      message: '✅ Étape 1/2 : Message créé sur votre Discord ! Regardez votre salon : mise à jour automatique sans doublon dans 3 secondes...'
    });

    // Step 2: After 3 seconds, simulate a new passenger joining and PATCH the exact same message
    setTimeout(async () => {
      const updatedRide: ShuttleRide = {
        ...testRide,
        availableSeats: 2,
        passengers: ["Lucas B. (Inscrit #1)", "Sophie M. (Nouvellement inscrite !)"],
        discordMessageId: firstRes.messageId,
        discordWebhookUrl: firstRes.webhookUrlUsed
      };

      const patchRes = await syncShuttleWithDiscord(updatedRide);
      setTestingLiveSync(false);

      if (patchRes.ok && patchRes.isPatched) {
        setTestResult({
          type: 'success',
          message: '🎉 SUCCÈS TOTAL ! Regardez votre Discord : le même message a été mis à jour EN DIRECT (sans doublon) ! La jauge indique 2 places restantes et Sophie M. est apparue dans la liste des inscrits.'
        });
      } else {
        setTestResult({
          type: 'error',
          message: `Échec de la mise à jour PATCH : ${patchRes.error || 'Erreur inconnue'}`
        });
      }
    }, 3000);
  };

  // Test envoi Sortie Club avec vrais boutons Discord natifs (via Bot Render)
  const handleTestBotOutingWithButtons = async () => {
    if (!config.botApiUrl) {
      setTestResult({
        type: 'error',
        message: "Veuillez d'abord renseigner l'URL de votre Bot Render (ex: https://votre-bot.onrender.com)."
      });
      return;
    }

    setTestingBotOuting(true);
    setTestResult(null);

    const testOuting: ClubOuting = {
      id: `test-btn-out-${Date.now()}`,
      title: "Sortie Test avec VRAIS Boutons Discord",
      type: 'cross_debutant',
      typeLabel: 'Thermique & Vol Libre',
      date: new Date().toISOString().split('T')[0],
      time: "14:30",
      siteId: "le-sire",
      siteName: "Le Sire - Grand Revard",
      meetingPoint: "Atterrissage de Verel",
      organizerId: "admin-bot-test",
      organizerName: "Admin Club Z'éléphants",
      organizerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      organizerPhone: "06 12 34 56 78",
      organizerRole: "Responsable Sorties",
      conditionsRequired: {
        minPilotLevel: 'Pilote autonome (Brevet Initial)',
        gearRequired: ['Parapente révisé', 'Radio VHF 146.500', 'Casque']
      },
      maxParticipants: 8,
      participants: [
        {
          id: "admin-bot-test",
          name: "Admin Club Z'éléphants",
          status: "confirmed",
          joinedAt: new Date().toISOString()
        }
      ],
      status: 'confirmed',
      description: "🧪 Test des VRAIS boutons d'inscription Discord : Cliquez directement sur [🪂 Je participe !] ou [❌ Se désister] ci-dessous sans ouvrir le site web !",
      createdAt: new Date().toISOString()
    };

    try {
      const res = await publishOutingToBot(testOuting);
      if (res.ok) {
        setTestResult({
          type: 'success',
          message: "🎉 SUCCÈS ! Sortie envoyée avec VRAIS BOUTONS Discord ! Allez dans votre salon #sorties-club : cliquez sur [🪂 Je participe !], votre pseudo s'inscrira directement dans Discord !"
        });
      } else {
        setTestResult({
          type: 'error',
          message: `Échec d'envoi au Bot : ${res.error || 'Vérifiez que le Bot Render est actif et que son adresse est correcte.'}`
        });
      }
    } catch (e: any) {
      setTestResult({
        type: 'error',
        message: `Erreur : ${e?.message || 'Impossible de joindre le Bot Render.'}`
      });
    } finally {
      setTestingBotOuting(false);
    }
  };

  // Test envoi Covoiturage avec vrais boutons Discord natifs (via Bot Render)
  const handleTestBotRideWithButtons = async () => {
    if (!config.botApiUrl) {
      setTestResult({
        type: 'error',
        message: "Veuillez d'abord renseigner l'URL de votre Bot Render (ex: https://votre-bot.onrender.com)."
      });
      return;
    }

    setTestingBotRide(true);
    setTestResult(null);

    const testRide: ShuttleRide = {
      id: `test-btn-ride-${Date.now()}`,
      driverName: "Thomas M. (Chauffeur Navette)",
      driverPhone: "06 12 34 56 78",
      departurePlace: "Atterrissage Verel",
      destinationSiteId: "le-sire",
      destinationSiteName: "Le Sire - Déco Ouest",
      departureTime: "15:00",
      availableSeats: 3,
      totalSeats: 4,
      passengers: [],
      wingTypes: "Solo & Biplace",
      comment: "🧪 Test des VRAIS boutons Discord : Cliquez sur [🚗 Je monte] ci-dessous sans ouvrir le site web !",
      createdAt: new Date().toISOString()
    };

    try {
      const res = await publishRideToBot(testRide);
      if (res.ok) {
        setTestResult({
          type: 'success',
          message: "🎉 SUCCÈS ! Covoiturage envoyé avec VRAIS BOUTONS Discord ! Allez dans votre salon covoit : cliquez sur [🚗 Je monte], la jauge passera à 2 places et votre pseudo apparaîtra directement !"
        });
      } else {
        setTestResult({
          type: 'error',
          message: `Échec d'envoi au Bot : ${res.error || 'Vérifiez que le Bot Render est actif.'}`
        });
      }
    } catch (e: any) {
      setTestResult({
        type: 'error',
        message: `Erreur : ${e?.message || 'Impossible de joindre le Bot Render.'}`
      });
    } finally {
      setTestingBotRide(false);
    }
  };

  const handleTriggerSimulatedShuttle = () => {
    if (!onSimulateIncomingShuttle) return;

    const mockShuttle: ShuttleRide = {
      id: `discord-${Date.now()}`,
      driverName: "Alexandre V. (via Discord)",
      driverPhone: "06 12 34 56 78",
      departurePlace: "Chambéry Centre (Gare SNCF)",
      destinationSiteId: "le-sire",
      destinationSiteName: "Le Sire - Grand Revard",
      departureTime: "14:15",
      availableSeats: 3,
      totalSeats: 4,
      wingTypes: "Solo & Sacs compacts",
      passengers: ["Lucas B."],
      comment: "📢 Posté depuis Discord #covoiturage : Monte pour le thermique de 15h, retour posé Verel.",
      createdAt: new Date().toISOString()
    };

    onSimulateIncomingShuttle(mockShuttle);
    setTestResult({
      type: 'success',
      message: '🚗 Covoiturage reçu de Discord simulé avec succès ! Ouvrez l\'onglet Covoiturages pour le voir.'
    });
  };

  const handleTriggerSimulatedOuting = () => {
    if (!onSimulateIncomingOuting) return;

    const today = new Date();
    today.setDate(today.getDate() + 2);
    const dateStr = today.toISOString().split('T')[0];

    const mockOuting: ClubOuting = {
      id: `discord-out-${Date.now()}`,
      title: "Sortie Thermique & Rando-Vol Revard",
      type: 'marche_vol',
      typeLabel: 'Rando-Vol',
      date: dateStr,
      time: "10:30",
      siteId: "le-sire",
      siteName: "Le Sire - Grand Revard",
      meetingPoint: "Parking de l'atterro de Verel",
      organizerId: "discord-user-1",
      organizerName: "Sophie M. (via Discord)",
      organizerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      organizerPhone: "06 98 76 54 32",
      organizerRole: "Membre Discord • Club Z'éléphants",
      conditionsRequired: {
        minPilotLevel: 'Pilote autonome (Brevet Initial)',
        gearRequired: ['Parapente révisé', 'Casque', 'Radio 146.500 MHz']
      },
      maxParticipants: 8,
      participants: [
        {
          id: "discord-user-1",
          name: "Sophie M.",
          status: "confirmed",
          joinedAt: new Date().toISOString()
        }
      ],
      status: 'confirmed',
      statusNote: 'Synchronisé depuis Discord #sorties-club',
      description: "Montée à pied depuis Verel puis vol thermique en face Ouest des Bauges. Rejoignez-nous !",
      createdAt: new Date().toISOString()
    };

    onSimulateIncomingOuting(mockOuting);
    setTestResult({
      type: 'success',
      message: '📅 Sortie reçue de Discord simulée avec succès ! Ouvrez le Calendrier pour la consulter.'
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const isConfigured = Boolean(config.shuttleWebhookUrl || config.outingWebhookUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2] shrink-0 shadow-lg shadow-[#5865F2]/10">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Passerelle Discord Club</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isConfigured 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {isConfigured ? 'Connecté' : 'À configurer'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Synchronisation automatique Covoiturages & Sorties Club</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1.5 p-2.5 bg-slate-950/40 border-b border-white/5 px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1. Guide
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            2. Webhooks & Envoi
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            3. Inscriptions & Synchro (Sans doublon)
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'reverse'
                ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            4. Sens Discord ➡️ App
          </button>
          <button
            onClick={() => setActiveTab('bot')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'bot'
                ? 'bg-[#5865F2] text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            5. Bot Node.js (Optionnel)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs sm:text-sm">

          {/* Feedback banner */}
          {testResult && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 border animate-fade-in ${
              testResult.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.type === 'success' ? (
                <Check className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div className="flex-1 font-medium leading-relaxed">
                {testResult.message}
              </div>
            </div>
          )}

          {/* TAB 1: GUIDE ETAPE PAR ETAPE */}
          {activeTab === 'guide' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-mono">i</span>
                  Comment tester sur votre serveur Discord perso en 2 minutes ?
                </h3>
                <p className="text-slate-400 leading-relaxed text-xs">
                  Discord fournit nativement des <strong>Webhooks</strong> très puissants. Cela ne nécessite aucun code sur Discord : il suffit de copier une URL fournie par Discord et de la coller dans l'onglet suivant.
                </p>
              </div>

              {/* Steps timeline */}
              <div className="space-y-4">
                
                {/* Step 1 */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                    1
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-bold text-white text-xs sm:text-sm">Ouvrez votre Discord sur PC ou mobile</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Allez sur votre serveur Discord personnel. Si vous le souhaitez, créez un salon textuel dédié, par exemple <strong>#covoiturage</strong> ou <strong>#sorties-club</strong> (ou utilisez un salon existant).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                    2
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-bold text-white text-xs sm:text-sm">Créez le Webhook Discord</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Faites un <strong>clic droit sur votre salon</strong> (ou cliquez sur la roue crantée ⚙️ à côté du nom du salon) ➡️ <strong>« Modifier le salon »</strong> ➡️ <strong>« Intégrations »</strong> ➡️ <strong>« Webhooks »</strong> ➡️ Cliquez sur <strong>« Nouveau Webhook »</strong>.
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>💡 <em>Astuce : Vous pouvez lui donner le nom « Z’éléphants Bot » et changer sa photo.</em></span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                    3
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-bold text-white text-xs sm:text-sm">Copiez l'URL du Webhook</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Cliquez sur le bouton bleu <strong>« Copier l'URL du Webhook »</strong> dans Discord. L'URL commence par <code className="text-sky-300 font-mono text-[11px]">https://discord.com/api/webhooks/...</code>
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                    4
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-bold text-white text-xs sm:text-sm">Collez l'URL & Testez l'envoi en direct</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Passez à l'onglet <strong>« 2. Paramètres & Envoi »</strong>, collez l'URL, et cliquez sur <strong>« Envoyer un test »</strong>. Vous verrez instantanément apparaître un bel encadré parapente dans votre salon Discord !
                    </p>
                  </div>
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-sky-500/20 hover:opacity-95 transition flex items-center gap-2"
                >
                  Configurer & Tester mon Webhook
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONFIGURATION & ENVOI (APP -> DISCORD) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                
                {/* Shuttle Webhook Field */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-sky-400" />
                      URL Webhook Discord - Salon Covoiturages / Navettes
                    </span>
                    {config.shuttleWebhookUrl && (
                      <span className="text-[10px] text-emerald-400 font-normal flex items-center gap-1">
                        <Check className="w-3 h-3" /> Configuré
                      </span>
                    )}
                  </label>
                  <input
                    type="url"
                    placeholder="https://discord.com/api/webhooks/123456789/abcdefgh..."
                    value={config.shuttleWebhookUrl}
                    onChange={(e) => setConfig({ ...config, shuttleWebhookUrl: e.target.value.trim() })}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Ce webhook recevra les annonces de départs de navettes et places dispo.</span>
                    <button
                      onClick={handleTestShuttle}
                      disabled={testingShuttle || !config.shuttleWebhookUrl}
                      className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testingShuttle ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Tester ce salon
                    </button>
                  </div>
                </div>

                {/* Outing Webhook Field */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      URL Webhook Discord - Salon Sorties Club & Événements
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Optionnel si identique au covoiturage)
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="Laissez vide pour utiliser la même URL que le covoiturage, ou collez un 2ème salon"
                    value={config.outingWebhookUrl}
                    onChange={(e) => setConfig({ ...config, outingWebhookUrl: e.target.value.trim() })}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Ce webhook recevra les sorties club planifiées au calendrier.</span>
                    <button
                      onClick={handleTestOuting}
                      disabled={testingOuting || (!config.outingWebhookUrl && !config.shuttleWebhookUrl)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testingOuting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Tester ce salon
                    </button>
                  </div>
                </div>

                {/* Render Bot Web Service URL - Double sens & Vrais boutons Discord natifs */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-950 border border-purple-500/40 space-y-3.5 pt-4 shadow-xl shadow-purple-950/20">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-white">
                      <Terminal className="w-4 h-4 text-purple-400" />
                      URL Bot Render (Publie avec VRAIS boutons natifs [Je participe !] / [Je monte])
                    </label>
                    {config.botApiUrl ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Check className="w-3 h-3" /> Bot Connecté
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        ⚠️ Recommandé pour les anciens
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-slate-300 space-y-1.5">
                    <div className="font-bold text-purple-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Pourquoi les boutons interactifs ne fonctionnaient pas avec le Webhook ?
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Discord <strong>interdit</strong> d'ajouter de vrais boutons cliquables aux Webhooks standards. C'est pour cela qu'il y avait seulement un lien vers le site. 
                      En renseignant l'adresse de votre <strong>Bot Render</strong> ci-dessous, le site fait publier les sorties et covoiturages directement par le robot : <strong>les anciens peuvent alors s'inscrire d'un clic direct dans Discord sans jamais ouvrir le site web !</strong>
                    </p>
                  </div>

                  <input
                    type="url"
                    placeholder="https://bot-zelephants.onrender.com"
                    value={config.botApiUrl || ''}
                    onChange={(e) => setConfig({ ...config, botApiUrl: e.target.value.trim() })}
                    className="w-full bg-slate-950 border border-purple-500/30 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                  />

                  {/* Actions & Tests direct Discord buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleTestBotConnection()}
                      disabled={testingBotUrl || !config.botApiUrl}
                      className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingBotUrl ? 'animate-spin' : ''}`} />
                      {testingBotUrl ? 'Vérification...' : '1. Tester la connexion'}
                    </button>

                    <button
                      onClick={handleTestBotOutingWithButtons}
                      disabled={testingBotOuting || !config.botApiUrl}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {testingBotOuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                      2. Tester Sortie avec Boutons [Je participe]
                    </button>

                    <button
                      onClick={handleTestBotRideWithButtons}
                      disabled={testingBotRide || !config.botApiUrl}
                      className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {testingBotRide ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Car className="w-3.5 h-3.5" />}
                      3. Tester Covoit avec Boutons [Je monte]
                    </button>
                  </div>
                </div>

                {/* Automation Toggles */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3 pt-4">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Synchronisation Automatique</div>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-300">Publier automatiquement les nouveaux covoiturages sur Discord dès création</span>
                    <input
                      type="checkbox"
                      checked={config.autoSyncShuttles}
                      onChange={(e) => setConfig({ ...config, autoSyncShuttles: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-0 focus:outline-none"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-300">Publier automatiquement les nouvelles sorties club sur Discord dès création</span>
                    <input
                      type="checkbox"
                      checked={config.autoSyncOutings}
                      onChange={(e) => setConfig({ ...config, autoSyncOutings: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-0 focus:outline-none"
                    />
                  </label>
                </div>

                {/* Save button */}
                <div className="flex items-center justify-between pt-2">
                  {config.lastTestedAt ? (
                    <span className="text-[11px] text-slate-400">
                      Dernier test réussi : <strong>{config.lastTestedAt}</strong>
                    </span>
                  ) : <span />}

                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-2xl bg-sky-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Enregistrer la configuration
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: INSCRIPTIONS & SYNCHRO (SANS DOUBLON) */}
          {activeTab === 'sync' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header banner */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Inscriptions, places limitées & Zéro doublon
                </h3>
                <p className="text-slate-400 leading-relaxed text-xs">
                  Voici exactement comment l'application et votre Discord restent parfaitement synchronisés de manière complémentaire et sans polluer vos salons.
                </p>
              </div>

              {/* 3 Core Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[11px]">1</span>
                    Places limitées visibles
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Sur Discord, chaque covoiturage et sortie affiche une jauge visuelle claire avec le nombre de places totales et disponibles (ex : <span className="text-sky-300 font-mono">3/4 places</span>).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-mono text-[11px]">2</span>
                    Liste des membres inscrits
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Les noms des membres inscrits apparaissent en clair dans le message Discord ainsi que sur l'application. Tout le monde voit qui monte avec qui en un coup d'œil.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono text-[11px]">3</span>
                    Mise à jour sans doublon
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Quand quelqu'un s'inscrit ou se désiste, l'application utilise l'API <strong>PATCH</strong> de Discord : le <strong>même message existant est actualisé sur place</strong> sans jamais en reposter un nouveau.
                  </p>
                </div>
              </div>

              {/* Live Demonstration Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Démonstration en direct sur votre serveur Discord
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live PATCH
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  Cliquez sur le bouton ci-dessous : un covoiturage sera créé sur votre Discord, puis <strong>3 secondes plus tard</strong>, le message sera <strong>automatiquement actualisé sur place</strong> avec une inscription supplémentaire pour vous prouver qu'il n'y a aucun doublon.
                </p>

                <div className="pt-1">
                  <button
                    onClick={handleTestLiveSync}
                    disabled={testingLiveSync}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                  >
                    {testingLiveSync ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Test en cours... Regardez votre Discord !</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Tester la mise à jour en direct (sans doublon)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Deep-link explanation */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-sky-400" />
                  Comment les membres s'inscrivent depuis Discord ?
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Chaque message envoyé sur Discord contient un bouton direct <strong>« ✋ S'inscrire / Gérer »</strong>. 
                  En cliquant sur ce lien depuis Discord (sur PC ou mobile), le membre arrive directement sur la fiche du covoiturage ou de la sortie sans avoir à la chercher. Il clique sur « Rejoindre », et le message Discord se met à jour immédiatement pour tous les autres membres.
                </p>
              </div>

            </div>
          )}

          {/* TAB 4: SENS INVERSE (DISCORD -> APP) */}
          {activeTab === 'reverse' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  Sens inverse : De Discord vers le Site Web
                </h3>
                <p className="text-slate-400 leading-relaxed text-xs">
                  Quand un pilote crée un covoiturage ou une sortie directement sur Discord (via <code className="text-sky-300 font-mono">/covoit</code> ou <code className="text-emerald-300 font-mono">/sortie</code>), comment l'application web le récupère-t-elle ?
                </p>
              </div>

              {/* LIVE RENDER BOT CONNECTION CARD */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40 space-y-4 shadow-xl shadow-purple-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                    <Terminal className="w-5 h-5 text-purple-400" />
                    Liaison en direct avec votre Bot Render
                  </div>
                  {config.botApiUrl ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connecté
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      ⚠️ URL à renseigner
                    </span>
                  )}
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  Collez ci-dessous l'URL publique de votre Web Service sur <a href="https://render.com" target="_blank" rel="noreferrer" className="text-purple-300 underline font-semibold">Render.com</a> (ex : <code className="text-purple-300 font-mono">https://votre-bot.onrender.com</code>). C'est grâce à cette adresse que le site interroge votre bot pour rapatrier les événements.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://bot-zelephants.onrender.com"
                    value={config.botApiUrl || ''}
                    onChange={(e) => setConfig({ ...config, botApiUrl: e.target.value.trim() })}
                    className="flex-1 bg-slate-950 border border-purple-500/40 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono shadow-inner"
                  />
                  <button
                    onClick={() => handleTestBotConnection()}
                    disabled={testingBotUrl || !config.botApiUrl}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${testingBotUrl ? 'animate-spin' : ''}`} />
                    <span>{testingBotUrl ? 'Connexion en cours...' : 'Tester & Synchroniser'}</span>
                  </button>
                </div>
              </div>

              {/* DIAGNOSTIC / POURQUOI ÇA NE REMONTE PAS */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <AlertCircle className="w-4 h-4 text-sky-400" />
                  Pourquoi les événements créés sur Discord n'étaient pas encore visibles sur le site ?
                </div>
                
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                    <div className="font-bold text-sky-300 flex items-center gap-1.5">
                      <span>1️⃣</span> L'adresse Render n'était pas enregistrée dans le site web
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Render génère une adresse unique pour chaque robot (comme <code className="text-slate-300">https://votre-bot.onrender.com</code>). Tant que cette adresse n'est pas renseignée dans le champ violet ci-dessus, le site web ne sait pas où aller chercher les données.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <span>2️⃣</span> Le fichier bot.js sur Render doit avoir la dernière version (/api/sync)
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Si vous avez déployé le robot lors de la première étape, il répondait aux commandes Discord mais ne stockait pas encore les événements dans le cache HTTP. 
                      Vérifiez que votre fichier <code className="text-emerald-300 font-mono">bot.js</code> sur GitHub / Render contient bien la route <code className="text-emerald-300 font-mono">/api/sync</code> (disponible dans le ZIP tout prêt de l'onglet 5).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                    <div className="font-bold text-purple-300 flex items-center gap-1.5">
                      <span>3️⃣</span> Mise en veille gratuite de Render (30 secondes au premier réveil)
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Sur l'offre gratuite de Render, le conteneur s'endort après 15 minutes sans requête. Le premier clic sur « Synchro Bot » peut prendre 15 à 30 secondes pour le réveiller. Une fois réveillé, il répond instantanément !
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Simulator to test right now */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950/90 to-slate-900/90 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Simulateur en direct : Testez la réception dès maintenant !
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Cliquez sur un bouton ci-dessous pour injecter un événement comme s'il venait d'être envoyé depuis votre Discord :
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleTriggerSimulatedShuttle}
                    className="flex-1 px-4 py-3 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/40 text-xs font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Car className="w-4 h-4 text-sky-400" />
                    Simuler un covoit reçu de Discord
                  </button>

                  <button
                    onClick={handleTriggerSimulatedOuting}
                    className="flex-1 px-4 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Simuler une sortie reçue de Discord
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: DISCORD BOT SCRIPT (NATIVE BOT OPTION) */}
          {activeTab === 'bot' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Clarification Box: Why /covoit isn't visible yet */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Pourquoi la commande /covoit ou /sortie n'apparaît pas encore dans votre Discord ?
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  L'URL que vous avez configurée dans l'onglet 2 est un <strong>Webhook Discord</strong>. 
                  Un Webhook est comme un <em>mégaphone à sens unique</em> : il peut poster de superbes messages depuis l'application, mais il <strong>ne peut pas</strong> enregistrer de commandes tapées au clavier (<code className="text-amber-300">/</code>), ni écouter les discussions.
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Pour que vos membres puissent taper <strong>/covoit</strong> ou simplement <strong>!covoit</strong>, et cliquer sur de <strong>vrais boutons cliquables [🚗 Je monte]</strong> directement dans Discord, il faut installer ce <strong>Bot Discord</strong> officiel.
                </p>
              </div>

              {/* Transition for senior/reluctant members */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  Idéal pour les anciens : Zéro effort d'adaptation !
                </h3>
                <p className="text-slate-400 leading-relaxed text-xs">
                  Les pilotes n'ont même pas besoin d'ouvrir l'application ni leur navigateur :
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
                  <li>Ils tapent simplement <code className="text-sky-300 bg-white/5 px-1.5 py-0.5 rounded">!covoit Verel 14h 3 places</code> dans le salon.</li>
                  <li>Le Bot affiche immédiatement un message avec <strong>deux gros boutons cliquables</strong> : <span className="text-emerald-400 font-bold">[🚗 Je monte]</span> et <span className="text-slate-400 font-bold">[❌ Annuler]</span>.</li>
                  <li>Le membre clique sur <strong>[Je monte]</strong> : son pseudo apparaît instantanément dans la liste et le nombre de places diminue en direct !</li>
                </ul>
              </div>

              {/* 3 Step Tutorial */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  Guide d'installation pas-à-pas (5 minutes chrono)
                </h4>

                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center font-mono font-bold text-[11px]">1</span>
                    Créer le Bot sur le portail Développeur Discord (Gratuit)
                  </div>
                  <ol className="text-xs text-slate-300 space-y-1 pl-6 list-decimal leading-relaxed">
                    <li>Rendez-vous sur <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-sky-400 underline hover:text-sky-300">discord.com/developers/applications</a> (connectez-vous avec votre compte Discord).</li>
                    <li>Cliquez sur <strong>« New Application »</strong> en haut à droite, nommez-la <em>« Z'éléph Parapente »</em> puis validez.</li>
                    <li>Dans le menu de gauche, cliquez sur <strong>« Bot »</strong> (icône de petit robot) :
                      <ul className="list-disc pl-4 mt-0.5 space-y-1 text-slate-400">
                        <li>Cliquez sur <strong>« Reset Token »</strong> et copiez la clé secrète (ce sera votre <code className="text-sky-300">DISCORD_BOT_TOKEN</code>).</li>
                        <li>Descendez au milieu de cette même page jusqu'à la section <strong>« Privileged Gateway Intents »</strong> (ou en français : <em>« Intentions de passerelle privilégiées »</em>).</li>
                        <li>Activez les 2 interrupteurs à bascule (qui passent en bleu/vert) :
                          <div className="mt-1 space-y-1 pl-2 font-mono text-[11px] text-slate-300">
                            <div>🔘 <strong>SERVER MEMBERS INTENT</strong> <em>(Intention relative aux membres du serveur)</em></div>
                            <div>🔘 <strong>MESSAGE CONTENT INTENT</strong> <em>(Intention relative au contenu des messages)</em></div>
                          </div>
                        </li>
                        <li>Un bandeau vert/bleu apparaît en bas : cliquez sur <strong>« Save Changes »</strong> (ou <em>« Enregistrer les modifications »</em>).</li>
                      </ul>
                    </li>
                    <li>Dans le menu de gauche, allez dans <strong>« OAuth2 » ➡️ « URL Generator »</strong> :
                      <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-slate-400">
                        <li>Sous <em>Scopes</em>, cochez : <code className="text-sky-300">bot</code> et <code className="text-sky-300">applications.commands</code>.</li>
                        <li>Sous <em>Bot Permissions</em>, cochez : <code className="text-sky-300">Send Messages</code>, <code className="text-sky-300">Embed Links</code>, <code className="text-sky-300">Manage Messages</code>, <code className="text-sky-300">Read Message History</code>.</li>
                        <li>Copiez l'URL tout en bas, ouvrez-la dans un nouvel onglet, sélectionnez le serveur Discord de votre club et cliquez sur <strong>Autoriser</strong> ! Le bot est maintenant dans votre serveur.</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                {/* Step 2: Download Ready-to-use ZIP */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                      <FolderArchive className="w-5 h-5 text-emerald-400" />
                      Où sont les fichiers ? Téléchargez-les tout prêts en 1 clic !
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Archive .ZIP
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    Vous n'avez aucun fichier à chercher ou à créer à la main sur votre ordinateur. 
                    Cliquez sur le bouton ci-dessous pour télécharger le dossier complet <strong>bot-zelephants-discord.zip</strong> contenant le script, la configuration et un lanceur automatique pour Windows.
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Collez ici votre Token Discord (facultatif mais pratique : il sera déjà écrit dans votre fichier) :
                    </label>
                    <input
                      type="password"
                      placeholder="Ex: MTE5MDk4NzY1NDMyMTA5ODc2NQ..."
                      value={botTokenInput}
                      onChange={(e) => setBotTokenInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <button
                      onClick={handleDownloadBotZip}
                      disabled={downloadingZip}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                    >
                      {downloadingZip ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Génération du ZIP en cours...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Télécharger le Bot prêt à l'emploi (bot-zelephants-discord.zip)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Step 3: How to run it */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center font-mono font-bold text-[11px]">3</span>
                    Où héberger le Bot ? (Render 24h/24 vs sur votre PC)
                  </div>

                  {/* RENDER GUIDE (RECOMMENDED) */}
                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-purple-300 text-xs flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Option 1 (Idéale) : Héberger 24h/24 Gratuit sur Render.com (Aucun PC à laisser allumé)
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-200 border border-purple-500/30 font-semibold">
                        Recommandé
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Sur <a href="https://render.com" target="_blank" rel="noreferrer" className="text-purple-300 underline font-semibold">Render.com</a>, le Bot tournera jour et nuit dans le Cloud sans avoir besoin de laisser votre ordinateur sous tension.
                    </p>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-white/5 space-y-2 text-[11px] text-slate-300">
                      <div className="font-semibold text-white">Guide pas-à-pas pour Render (3 minutes) :</div>
                      <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
                        <li>
                          <strong>Téléchargez le ZIP ci-dessus</strong> (avec votre Token collé dedans ou à renseigner sur Render) et extrayez-le.
                        </li>
                        <li>
                          Créez un compte gratuit sur <strong><a href="https://github.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">GitHub.com</a></strong>, créez un nouveau dépôt privé ou public nommé <code className="text-sky-300 font-mono">bot-zelephants</code>, puis cliquez sur <em>« Uploading an existing file »</em> pour y glisser les fichiers : <code className="text-purple-300 font-mono">bot.js</code>, <code className="text-purple-300 font-mono">package.json</code> et <code className="text-purple-300 font-mono">render.yaml</code>.
                        </li>
                        <li>
                          Rendez-vous sur <strong><a href="https://render.com" target="_blank" rel="noreferrer" className="text-purple-300 underline">Render.com</a></strong> et connectez-vous avec votre compte GitHub.
                        </li>
                        <li>
                          Cliquez sur le bouton bleu <strong>« New + » ➡️ « Web Service »</strong> (gratuit).
                        </li>
                        <li>
                          Sélectionnez votre dépôt <code className="text-sky-300 font-mono">bot-zelephants</code>.
                        </li>
                        <li>
                          Dans <strong>Environment Variables</strong>, ajoutez :
                          <div className="mt-1 font-mono text-[10px] bg-slate-900 px-2 py-1 rounded text-purple-300 border border-white/10">
                            Key: DISCORD_BOT_TOKEN &nbsp;|&nbsp; Value: [votre_token_secret_discord]
                          </div>
                        </li>
                        <li>
                          Cliquez sur <strong>« Create Web Service »</strong> : Render installe les dépendances et démarre le Bot en 30 secondes. Vous verrez le message vert <span className="text-emerald-400 font-bold">« ✅ Bot Z'éléphants connecté »</span> dans les logs !
                        </li>
                        <li className="text-purple-300 font-medium">
                          <strong>Dernière étape (Remontée Discord ➡️ Site) :</strong> Copiez l'URL de votre Web Service sur Render (située tout en haut sous le titre, ex: <code className="text-purple-200 font-mono">https://bot-zelephants.onrender.com</code>) et collez-la dans l'onglet <strong>« 4. Sens Discord ➡️ Site »</strong> ou <strong>« 2. Webhooks »</strong> de cette fenêtre. Vos événements Discord remonteront alors en direct sur le site !
                        </li>
                      </ol>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Le fichier <code>bot.js</code> intègre déjà le serveur HTTP de santé nécessaire pour que Render maintienne le bot en ligne gratuitement !</span>
                    </div>
                  </div>

                  {/* OPTION GLITCH / RAILWAY (NO GITHUB) */}
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 space-y-2">
                    <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Alternative Cloud sans compte GitHub : Glitch.com (Encore plus direct)
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Si vous ne souhaitez pas créer de compte GitHub : rendez-vous sur <a href="https://glitch.com" target="_blank" rel="noreferrer" className="text-amber-300 underline font-semibold">glitch.com</a>, cliquez sur <em>« New Project » ➡️ « hello-node »</em>. Collez simplement le contenu de <code className="text-amber-200">bot.js</code> dans le fichier <code className="text-amber-200">server.js</code> et votre token dans le fichier <code className="text-amber-200">.env</code>. Le bot démarre aussitôt dans le cloud !
                    </p>
                  </div>

                  {/* LOCAL TESTING */}
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 space-y-1.5">
                    <div className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      Option Test Local (Sur votre PC) :
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Double-cliquer sur <code className="text-sky-300">LANCER_LE_BOT_WINDOWS.bat</code> dans le dossier ZIP extrait sur votre PC. Pratique pour tester tout de suite avant de le mettre sur Render.
                    </p>
                  </div>
                </div>

                {/* Direct Code Inspection (For advanced users) */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-lg bg-slate-700 text-white flex items-center justify-center font-mono font-bold text-[11px]">4</span>
                    Code source des fichiers inclus dans le ZIP (pour vérification)
                  </div>

                  {/* bot.js */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-emerald-400 font-bold">bot.js (Script complet avec boutons & commandes)</span>
                      <button
                        onClick={() => copyToClipboard(`// ============================================================
// BOT DISCORD OFFICIEL - LES Z'ÉLÉPHANTS PARAPENTE
// Commandes /covoit, !covoit, boutons [Je monte] & [Se désister]
// ============================================================
require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Enregistrement automatique des Slash Commands /covoit et /sortie
const commands = [
  new SlashCommandBuilder()
    .setName('covoit')
    .setDescription('Organiser une navette / covoiturage pour un site')
    .addStringOption(opt => opt.setName('destination').setDescription('Site de vol (ex: Verel, Sire, Chamoux)').setRequired(true))
    .addStringOption(opt => opt.setName('heure').setDescription('Heure de départ (ex: 14h00)').setRequired(true))
    .addIntegerOption(opt => opt.setName('places').setDescription('Nombre de places disponibles dans la voiture').setRequired(true))
    .addStringOption(opt => opt.setName('rdv').setDescription('Lieu de rendez-vous (ex: Atterrissage Verel)').setRequired(false)),
  new SlashCommandBuilder()
    .setName('sortie')
    .setDescription('Proposer une sortie club / cross / rando-vol')
    .addStringOption(opt => opt.setName('titre').setDescription('Nom de la sortie').setRequired(true))
    .addStringOption(opt => opt.setName('date').setDescription('Date et heure (ex: Samedi 14 Juin 09h00)').setRequired(true))
    .addIntegerOption(opt => opt.setName('max').setDescription('Nombre maximum de pilotes').setRequired(false))
];

client.once('ready', async () => {
  console.log(\`✅ Bot Z'éléphants connecté en tant que \${client.user.tag} !\`);
  
  // Déploiement des commandes slash auprès de Discord
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
  try {
    console.log('🔄 Enregistrement des commandes /covoit et /sortie...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('🚀 Commandes slash enregistrées avec succès !');
  } catch (error) {
    console.error('Erreur enregistrement commandes:', error);
  }
});

// Helper pour fabriquer l'Embed visuel avec jauge et liste des passagers
function buildRideEmbed(driverName, destination, time, rdv, totalSeats, passengers) {
  const remaining = totalSeats - passengers.length;
  const isFull = remaining <= 0;
  
  // Jauge visuelle (ex: 🟩🟩🟩⬜)
  const bar = '🟩'.repeat(passengers.length) + '⬜'.repeat(Math.max(0, remaining));
  
  const embed = new EmbedBuilder()
    .setColor(isFull ? 0xEF4444 : 0x0EA5E9)
    .setTitle(\`🚗 Navette \${destination} • Départ \${time}\`)
    .setDescription(\`Organisée par **\${driverName}**\\n📍 Rendez-vous : **\${rdv || 'À définir'}**\`)
    .addFields(
      { 
        name: \`Places : \${passengers.length}/\${totalSeats} (\${isFull ? '🔴 COMPLET' : \`\${remaining} libre(s)\`})\`, 
        value: bar 
      },
      { 
        name: '👥 Passagers inscrits', 
        value: passengers.length > 0 ? passengers.map((p, i) => \`\${i + 1}. \${p}\`).join('\\n') : '*Aucun inscrit pour le moment — Soyez le premier !*' 
      }
    )
    .setFooter({ text: "Club Parapente Les Z'éléphants • Cliquez ci-dessous pour monter !" })
    .setTimestamp();

  // Boutons natifs Discord
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ride_join')
      .setLabel(isFull ? 'Complet' : '🚗 Je monte (+1 place)')
      .setStyle(isFull ? ButtonStyle.Secondary : ButtonStyle.Success)
      .setDisabled(isFull),
    new ButtonBuilder()
      .setCustomId('ride_leave')
      .setLabel('❌ Se désister')
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

// 1. Gestion des Slash Commands (/covoit)
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'covoit') {
      const dest = interaction.options.getString('destination');
      const time = interaction.options.getString('heure');
      const places = interaction.options.getInteger('places');
      const rdv = interaction.options.getString('rdv') || 'Atterrissage Verel';

      const payload = buildRideEmbed(interaction.user.displayName || interaction.user.username, dest, time, rdv, places, []);
      await interaction.reply(payload);
    }
    return;
  }

  // 2. Gestion des clics sur les boutons [Je monte] et [Se désister]
  if (interaction.isButton()) {
    const message = interaction.message;
    const oldEmbed = message.embeds[0];
    if (!oldEmbed) return;

    // Récupération des données depuis l'embed existant
    const titleMatch = oldEmbed.title.match(/Navette (.*) • Départ (.*)/);
    const destination = titleMatch ? titleMatch[1] : 'Vol';
    const time = titleMatch ? titleMatch[2] : 'Aujourd\\'hui';
    
    // Passagers existants
    const passengersField = oldEmbed.fields.find(f => f.name.includes('Passagers'));
    let passengers = [];
    if (passengersField && !passengersField.value.includes('*Aucun')) {
      passengers = passengersField.value.split('\\n').map(l => l.replace(/^\\d+\\.\\s*/, '').trim());
    }

    // Nombre total de places
    const placesField = oldEmbed.fields.find(f => f.name.includes('Places'));
    let totalSeats = 4;
    if (placesField) {
      const match = placesField.name.match(/\\/(\\d+)/);
      if (match) totalSeats = parseInt(match[1], 10);
    }

    const userName = interaction.user.displayName || interaction.user.username;

    if (interaction.customId === 'ride_join') {
      if (passengers.includes(userName)) {
        return interaction.reply({ content: '⚠️ Tu es déjà inscrit dans cette navette !', ephemeral: true });
      }
      if (passengers.length >= totalSeats) {
        return interaction.reply({ content: '🔴 Navette déjà complète !', ephemeral: true });
      }
      passengers.push(userName);
      
      const updated = buildRideEmbed('Le Chauffeur', destination, time, 'Voir description', totalSeats, passengers);
      await interaction.update(updated);
      await interaction.followUp({ content: \`🎉 Super \${userName}, ta place est réservée !\`, ephemeral: true });
    }

    if (interaction.customId === 'ride_leave') {
      if (!passengers.includes(userName)) {
        return interaction.reply({ content: "Tu n'étais pas inscrit dans cette navette.", ephemeral: true });
      }
      passengers = passengers.filter(p => p !== userName);
      
      const updated = buildRideEmbed('Le Chauffeur', destination, time, 'Voir description', totalSeats, passengers);
      await interaction.update(updated);
      await interaction.followUp({ content: \`Désistement pris en compte pour \${userName}.\`, ephemeral: true });
    }
  }
});

// 3. Raccourci texte pour les anciens : !covoit <site> <heure> <places>
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const content = message.content.trim();

  if (content.startsWith('!covoit')) {
    const parts = content.split(' ').slice(1);
    const dest = parts[0] || 'Verel';
    const time = parts[1] || '14h00';
    const places = parseInt(parts[2], 10) || 3;

    const payload = buildRideEmbed(message.author.displayName || message.author.username, dest, time, 'Au rendez-vous habituel', places, []);
    await message.channel.send(payload);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);`, 'botcode')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium flex items-center gap-1.5 text-xs transition border border-emerald-500/30"
                      >
                        {copiedUrl === 'botcode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl === 'botcode' ? 'Copié !' : 'Copier bot.js'}</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-2xl bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-60 leading-relaxed">
{`// ============================================================
// BOT DISCORD OFFICIEL - LES Z'ÉLÉPHANTS PARAPENTE
// Commandes /covoit, !covoit, boutons [Je monte] & [Se désister]
// ============================================================
require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Enregistrement des commandes /covoit et /sortie
const commands = [
  new SlashCommandBuilder()
    .setName('covoit')
    .setDescription('Organiser une navette / covoiturage pour un site')
    .addStringOption(opt => opt.setName('destination').setDescription('Site de vol (ex: Verel, Sire, Chamoux)').setRequired(true))
    .addStringOption(opt => opt.setName('heure').setDescription('Heure de départ (ex: 14h00)').setRequired(true))
    .addIntegerOption(opt => opt.setName('places').setDescription('Nombre de places disponibles').setRequired(true))
    .addStringOption(opt => opt.setName('rdv').setDescription('Lieu de rendez-vous').setRequired(false)),
  new SlashCommandBuilder()
    .setName('sortie')
    .setDescription('Proposer une sortie club / cross')
    .addStringOption(opt => opt.setName('titre').setDescription('Titre').setRequired(true))
    .addStringOption(opt => opt.setName('date').setDescription('Date et heure').setRequired(true))
];

client.once('ready', async () => {
  console.log(\`✅ Bot connecté en tant que \${client.user.tag}\`);
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
  console.log('🚀 Commandes /covoit et /sortie enregistrées !');
});

// Écoute des boutons [Je monte] et [Se désister]
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'covoit') {
      const dest = interaction.options.getString('destination');
      const time = interaction.options.getString('heure');
      const places = interaction.options.getInteger('places');
      // Publie l'embed avec les boutons cliquables
    }
  }
  if (interaction.isButton()) {
    // Met à jour la liste des inscrits en direct sans doublon !
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);`}
                    </pre>
                  </div>

                  {/* package.json */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300 font-bold">package.json</span>
                      <button
                        onClick={() => copyToClipboard(`{
  "name": "bot-zelephants-parapente",
  "version": "1.0.0",
  "description": "Bot Discord Covoiturage & Sorties pour le club Parapente Z'éléphants",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js"
  },
  "dependencies": {
    "discord.js": "^14.17.3",
    "dotenv": "^16.4.7"
  }
}`, 'pkgcode')}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium flex items-center gap-1.5 text-xs transition"
                      >
                        {copiedUrl === 'pkgcode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl === 'pkgcode' ? 'Copié !' : 'Copier package.json'}</span>
                      </button>
                    </div>

                    <pre className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`{
  "name": "bot-zelephants-parapente",
  "version": "1.0.0",
  "main": "bot.js",
  "dependencies": {
    "discord.js": "^14.17.3",
    "dotenv": "^16.4.7"
  }
}`}
                    </pre>
                  </div>

                  {/* .env */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-amber-300 font-bold">.env</span>
                      <button
                        onClick={() => copyToClipboard(`DISCORD_BOT_TOKEN=collez_ici_votre_token_secret_discord`, 'envcode')}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium flex items-center gap-1.5 text-xs transition"
                      >
                        {copiedUrl === 'envcode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl === 'envcode' ? 'Copié !' : 'Copier .env'}</span>
                      </button>
                    </div>

                    <pre className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`DISCORD_BOT_TOKEN=collez_ici_le_token_du_bot`}
                    </pre>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Chiffrement HTTPS • Discord Webhook API v10</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
