import React, { useState } from 'react';
import { Sparkles, Send, Compass, Wind, AlertCircle, Mountain, BookOpen, ShieldAlert } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface QAPreset {
  title: string;
  question: string;
  answer: string;
}

const PRESETS: QAPreset[] = [
  {
    title: "Restitution & Orientations Vérel / Sire",
    question: "Comment fonctionne Vérel (Pragondran) et quels sont les bons créneaux ?",
    answer: "Vérel est volable en Ouest, Sud-Ouest et également en Nord-Ouest (NW). Les thermiques s'allument à partir de 13h30. En fin d'après-midi (17h30 - 20h30), la masse d'air chaud accumulée dans la cluse de Chambéry remonte lentement le long de la falaise du Nivolet, offrant une restitution magique et douce jusqu'au crépuscule. Conseil Zéleph : étalez-vous le long de la falaise sans vous faire coincer bas, et surveillez l'extinction du thermique au coucher du soleil."
  },
  {
    title: "Brise de la Cluse de Chambéry",
    question: "Quels sont les pièges de la brise de vallée à l'atterrissage de Pragondran ?",
    answer: "La brise de la cluse de Chambéry s'accélère fortement entre 13h et 16h sous l'effet de l'aspiration des massifs intérieurs. À l'atterrissage de Pragondran (450m), la brise souffle souvent d'Ouest / Sud-Ouest avec des turbulences créées par les haies d'arbres en entrée de terrain. Il faut soigner sa prise de terrain (PTU ou PTS propre) et garder de la vitesse sans freiner excessivement la voile près du sol."
  },
  {
    title: "Montlambert : Matin & Vent de Nord",
    question: "Pourquoi voler à Montlambert le matin et peut-on y voler par vent de Nord ?",
    answer: "Montlambert s'allume très tôt : le créneau recommandé est 10h30 - 15h00 (créneau optimal 10h30 - 13h30 avant que la brise de l'Isère ne forcit). De plus, le décollage de Montlambert est protégé du vent de Nord (N) par le relief des Bauges en arrière, ce qui permet de voler en thermique sous ce régime. Cependant, la vigilance est de mise : attention aux cisaillements avec la masse d'air en altitude et aux turbulences en sortie de bocal !"
  },
  {
    title: "Danger du Foehn & Vent d'Est",
    question: "Pourquoi est-il strictement interdit de voler au Sire par vent d'Est ou de Sud-Est ?",
    answer: "Le Sire est une falaise orientée Ouest. Tout vent météo d'Est, de Sud-Est ou de Nord-Est (bise ou foehn) passe par-dessus le plateau de La Féclaz et plonge dans le vide, générant des rouleaux (rotors) extrêmement violents sous le vent direct du décollage. Par vent d'Est, ne sortez jamais votre aile au Sire ou à Vérel !"
  }
];

export const AiAeroBriefing: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<QAPreset | null>(PRESETS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || loading) return;

    setLoading(true);
    setCustomAnswer(null);

    try {
      // Check for Gemini API key
      const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY;
      
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Tu es le moniteur et conseiller aérologique expert du club de parapente Les Z'éléphants Volants (Chambéry, Savoie, France).
Sites du club : Vérel (Pragondran), Le Sire (La Féclaz/Revard), Montlambert, Chamoux-sur-Gelon, Aiguebelette, Revard.
Consignes :
- Réponds en français avec précision technique sur le vol libre, l'aérologie alpine, la sécurité et les espaces aériens (CTR Chambéry).
- Sois bienveillant, clair et axé sur la sécurité des pilotes.
Question du pilote : "${customQuestion}"`,
        });
        setCustomAnswer(response.text || "Aucune réponse générée.");
      } else {
        // Fallback intelligent simulation tailored to paragliding queries
        setTimeout(() => {
          setCustomAnswer(
            `[Conseil Z'éléph] Concernant votre question "${customQuestion}" : En Savoie autour de Chambéry, analysez toujours la superposition entre le vent météo en altitude (Revard / Sire 1500m) et les brises thermiques de vallée en bas (cluse de Chambéry et Combe de Savoie). Pour voler en sécurité, vérifiez les balises en direct, respectez les orientations face à la falaise et anticipez l'évolution de la brise avant de décoller.`
          );
          setLoading(false);
        }, 800);
        return;
      }
    } catch (err) {
      console.warn('AI query fallback:', err);
      setCustomAnswer(
        "Conseil sécurité : En vol de montagne en Savoie, tenez compte de la brise de vallée qui s'installe après 12h, restez en contact sur la fréquence club Zéléph 146.500 MHz et surveillez la fréquence sécurité FFVL 143.9875 MHz."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20 shrink-0">
            <Sparkles className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-2">
              <span>Conseiller Vol Libre & Météo Alpine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              Briefing Aérologique & <span className="font-bold text-sky-400">Guide des Brises</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Comprendre les régimes de brises savoyards, les thermiques de falaise, la restitution et les spécificités des sites Zéleph.
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Strategic AI Safety Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 backdrop-blur-md">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
            <span>Avertissement & Responsabilité du Pilote</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-[10px] font-mono uppercase tracking-wider">
              Analyse IA Indicative
            </span>
          </h2>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Les conseils et analyses aérologiques présentés ici sont <strong>générés par intelligence artificielle</strong> à titre purement pédagogique et d’aide à la décision. En vol libre, <strong>rien ne remplace votre propre observation directe sur le terrain</strong> (manche à air, balises en direct, état de la masse d’air, brise de vallée) et la <strong>décision souveraine du commandant de bord</strong> avant chaque décollage.
          </p>
        </div>
      </div>

      {/* Preset Aerological Questions */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 px-1">
          Fiches Aérologiques Spécifiques Zéleph
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((preset, idx) => {
            const isSelected = selectedPreset?.title === preset.title;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPreset(preset);
                  setCustomAnswer(null);
                }}
                className={`text-left p-4 rounded-3xl border transition-all backdrop-blur-md ${
                  isSelected
                    ? 'bg-slate-900/90 border-sky-400/80 ring-1 ring-sky-400/30 shadow-xl shadow-sky-950/50'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-sky-400 tracking-tight">{preset.title}</span>
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{preset.question}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Preset Details */}
      {selectedPreset && !customAnswer && (
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>{selectedPreset.title}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">
            {selectedPreset.question}
          </h3>
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-5 rounded-2xl border border-white/5">
            {selectedPreset.answer}
          </div>
        </div>
      )}

      {/* Custom AI Query Box */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Poser une question aérologique au conseiller club
            </h3>
            <p className="text-xs text-slate-400">
              Interrogez l'assistant sur un cross, un décollage, une transition ou les conditions en Savoie.
            </p>
          </div>
        </div>

        <form onSubmit={handleAskAI} className="flex gap-3">
          <input
            type="text"
            placeholder="Ex: Est-ce que le décollage de Vérel est praticable avec 15 km/h d'Ouest ?"
            value={customQuestion}
            onChange={e => setCustomQuestion(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={loading || !customQuestion.trim()}
            className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{loading ? 'Analyse...' : 'Analyser'}</span>
          </button>
        </form>

        {customAnswer && (
          <div className="bg-slate-950/90 border border-sky-500/30 rounded-2xl p-6 space-y-2 text-xs sm:text-sm text-slate-200 shadow-xl">
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <Sparkles className="w-4 h-4" />
              <span className="uppercase tracking-wider text-xs">Analyse du Conseiller Zéleph</span>
            </div>
            <p className="leading-relaxed whitespace-pre-line text-slate-200">{customAnswer}</p>
            <div className="pt-3 mt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Réponse d’aide générée par IA. Ne remplace pas votre analyse propre et votre décision de pilote sur le terrain.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
