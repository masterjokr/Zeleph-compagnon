import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, CheckCircle, Smartphone } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Installé (PWA)</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          id="pwa-install-button"
          onClick={install}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-lg shadow-sky-600/30 transition transform active:scale-95"
          title="Installer sur Android / PC"
        >
          <Smartphone className="w-4 h-4" />
          <span>Installer l'App</span>
        </button>
      )}

      {isIOS && (
        <button
          id="pwa-ios-install-button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl transition"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>Installer PWA</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Installer sur iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Application PWA Zéleph Vol Libre</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">1</span>
                <span>Appuyez sur le bouton <strong>Partager</strong> <Share className="inline w-3.5 h-3.5 mx-0.5 text-sky-400" /> dans Safari.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">2</span>
                <span>Faites défiler et choisissez <strong>Sur l'écran d'accueil</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-0.5 text-sky-400" />.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">3</span>
                <span>Touchez <strong>Ajouter</strong> en haut à droite.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 text-sm font-semibold rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition"
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
};
