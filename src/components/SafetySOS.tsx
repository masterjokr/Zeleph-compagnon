import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  MapPin, 
  PhoneCall, 
  Copy, 
  Check, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  Layers, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react';

export const SafetySOS: React.FC = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number; alt?: number | null; accuracy?: number } | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-flight check-list items
  const [checklist, setChecklist] = useState<{[key: string]: boolean}>({
    helmet: false,
    harnessLegs: false,
    rescueGrip: false,
    controlsSpeedbar: false,
    airspaceWind: false,
  });

  const getCoordinates = () => {
    if (!navigator.geolocation) {
      setErrorMsg("La géolocalisation n'est pas supportée sur cet appareil.");
      return;
    }

    setLoadingCoords(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          alt: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setLoadingCoords(false);
      },
      (err) => {
        setLoadingCoords(false);
        setErrorMsg("Impossible d'obtenir la position GPS (signal faible ou autorisation refusée).");
        console.warn(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const copyCoordinates = () => {
    if (!coords) return;
    const text = `Position Pilote Parapente Zéleph: Lat ${coords.lat.toFixed(5)}, Lng ${coords.lng.toFixed(5)}${coords.alt ? `, Alt ~${coords.alt}m` : ''} (Précision: ${coords.accuracy}m)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-6">
      {/* SOS Alert Header */}
      <div className="relative overflow-hidden bg-rose-500/10 backdrop-blur-md border border-rose-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 shrink-0">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-2">
              <span>Urgence Vol Libre Savoie • PGHM • SAMU</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              Sécurité, Secours Montagne & <span className="font-bold text-rose-400">SOS Pilote</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Coordonnées GPS instantanées pour les secours, numéros d'urgence, fréquence fédérale FFVL et check-list pré-vol.
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* GPS Rescue Locator Box */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">
                Localisation GPS Pilote pour Secours
              </h3>
              <p className="text-xs text-slate-400">
                À communiquer directement au PGHM / SAMU en cas d'accident ou d'arbrissage.
              </p>
            </div>
          </div>

          <button
            onClick={getCoordinates}
            disabled={loadingCoords}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCoords ? 'animate-spin' : ''}`} />
            <span>{coords ? 'Actualiser GPS' : 'Relever ma position GPS'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
            {errorMsg}
          </div>
        )}

        {coords ? (
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block mb-0.5">Latitude</span>
                <span className="text-lg font-bold text-sky-400 font-mono">{coords.lat.toFixed(5)}° N</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block mb-0.5">Longitude</span>
                <span className="text-lg font-bold text-sky-400 font-mono">{coords.lng.toFixed(5)}° E</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block mb-0.5">Altitude & Précision</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {coords.alt ? `~${coords.alt}m` : 'N/A'} (±{coords.accuracy}m)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                onClick={copyCoordinates}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/5 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
                <span>{copied ? 'Coordonnées copiées !' : 'Copier texte coordonnées'}</span>
              </button>

              <a
                href={`sms:?body=Secours%20Parapente%20-%20Position%20GPS:%20${coords.lat.toFixed(5)},${coords.lng.toFixed(5)}%20https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/5 transition"
              >
                <span>Envoyer par SMS</span>
              </a>

              <a
                href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30 flex items-center justify-center gap-1.5"
              >
                <span>Ouvrir Carte</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-400">
            Cliquez sur <strong className="text-sky-400">"Relever ma position GPS"</strong> pour générer vos coordonnées d'urgence exactes.
          </div>
        )}
      </div>

      {/* Emergency Call Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="tel:112"
          className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 p-5 rounded-3xl transition flex items-center gap-4 group backdrop-blur-md"
        >
          <div className="p-3.5 rounded-2xl bg-rose-500 text-slate-950 font-black text-xl font-mono">
            112
          </div>
          <div>
            <h4 className="font-bold text-white text-sm group-hover:text-rose-300 transition">
              Numéro d'Urgence Européen
            </h4>
            <p className="text-xs text-slate-400">SAMU / Pompiers (gratuit, même sans forfait)</p>
          </div>
        </a>

        <a
          href="tel:0479070110"
          className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-white/10 p-5 rounded-3xl transition flex items-center gap-4 group backdrop-blur-md"
        >
          <div className="p-3.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm group-hover:text-sky-300 transition">
              PGHM Savoie
            </h4>
            <p className="text-xs text-slate-400 font-mono">04 79 07 01 10</p>
          </div>
        </a>

        <a
          href="tel:0476222222"
          className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-white/10 p-5 rounded-3xl transition flex items-center gap-4 group backdrop-blur-md"
        >
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition leading-snug">
              Numéro d'alerte unifié des secours en montagne - Savoie du Nord
            </h4>
            <p className="text-xs text-slate-400 font-mono">04.76.22.22.22</p>
          </div>
        </a>
      </div>

      {/* Radio Frequencies Protocol (Club 146.500 & FFVL 143.9875) */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Fréquences Radio VHF Parapente
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Canaux radio utilisés par les pilotes du club Zéléph et en vol libre en France.
              </p>
            </div>
          </div>
        </div>

        {/* Dual frequency highlight cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-sky-500/30 relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                  Fréquence Club Zéléph
                </span>
                <h4 className="text-xl sm:text-2xl font-mono font-bold text-white mt-2">
                  146.500 <span className="text-xs text-sky-400 font-sans font-medium">MHz</span>
                </h4>
              </div>
              <span className="text-xs text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-xl font-medium">
                Vols & Navettes
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              Fréquence officielle du club des <strong>Z'éléphants Volants</strong> pour les échanges en vol, l'organisation des navettes et l'entraide amicale entre membres.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Fréquence Fédérale FFVL
                </span>
                <h4 className="text-xl sm:text-2xl font-mono font-bold text-white mt-2">
                  143.9875 <span className="text-xs text-emerald-400 font-sans font-medium">MHz</span>
                </h4>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl font-medium">
                Sécurité & Balises
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              Réservée exclusivement à la <strong>sécurité</strong>, aux <strong>balises météo vocales</strong> et aux <strong>appels de détresse</strong> sur tout le territoire français.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
            <strong className="text-sky-400 block mb-1 uppercase font-mono tracking-wider text-[10px]">1. Message d'Alerte</strong>
            <p className="text-slate-300 leading-relaxed">
              "MAYDAY, MAYDAY, MAYDAY" ou "URGENCE VOL LIBRE" sur 143.9875 MHz + Identification et localisation précise.
            </p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
            <strong className="text-sky-400 block mb-1 uppercase font-mono tracking-wider text-[10px]">2. Bilan & Victime</strong>
            <p className="text-slate-300 leading-relaxed">
              État de conscience, blessures apparentes, voile suspendue dans un arbre ou au sol.
            </p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
            <strong className="text-sky-400 block mb-1 uppercase font-mono tracking-wider text-[10px]">3. Silence Radio</strong>
            <p className="text-slate-300 leading-relaxed">
              Libérer impérativement la fréquence 143.9875 pour permettre aux secours et à l'hélicoptère de communiquer.
            </p>
          </div>
        </div>
      </div>

      {/* Pre-Flight 5-Point Checklist */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Check-List Pré-Décollage (5 Points Vitaux)
              </h3>
              <p className="text-xs text-slate-400">
                À répéter systématiquement avant d'étaler et de lever la voile.
              </p>
            </div>
          </div>

          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
            allChecked 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-white/5 text-slate-400 border border-white/5'
          }`}>
            {allChecked ? 'Prêt à Décoller ✓' : `${Object.values(checklist).filter(Boolean).length}/5 validés`}
          </span>
        </div>

        <div className="space-y-2.5">
          {[
            { id: 'helmet', label: '1. Casque attaché et jugulaire verrouillée' },
            { id: 'harnessLegs', label: '2. Cuissardes et ventrale clipsées (anti-oubli verrouillé)' },
            { id: 'rescueGrip', label: '3. Parachute de secours : poignée accessible & aiguille en place' },
            { id: 'controlsSpeedbar', label: '4. Commandes en mains, accélérateur connecté et élévateurs clairs' },
            { id: 'airspaceWind', label: '5. Météo face voile, cycle analysé & espace aérien dégagé' },
          ].map((item) => {
            const isDone = checklist[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer transition-all border ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-950/60 border-white/5 text-slate-300 hover:bg-white/5'
                }`}
              >
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTR Chambéry LFLB Airspace Notice */}
      <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/20 rounded-3xl p-6 sm:p-7 space-y-3 shadow-2xl">
        <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="uppercase tracking-wider">Réglementation Espace Aérien : CTR Chambéry Savoie Mont-Blanc</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Le bassin de Chambéry et le lac du Bourget sont situés sous la <strong>CTR de Chambéry (Aéroport LFLB)</strong> en classe D. 
          Un protocole d'accord spécifique existe entre les Z'éléphants Volants / FFVL et la tour de contrôle. 
          Ne pénétrez jamais dans l'axe de finale pistes 18/36 sans autorisation et respectez scrupuleusement les plafonds lors de vos départs en cross vers la cluse ou le Challes-les-Eaux vol à voile !
        </p>
      </div>
    </div>
  );
};
