import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center justify-between gap-3 bg-amber-600/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl shadow-amber-950/40 border border-amber-400/40 text-xs sm:text-sm animate-bounce-subtle"
    >
      <div className="flex items-center gap-2.5">
        <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
        <div>
          <span className="font-bold">Mode Montagne Hors-ligne :</span> fiches sites & topos restent disponibles.
        </div>
      </div>
      <span className="text-[10px] bg-amber-900/60 px-2 py-0.5 rounded-full uppercase font-mono">PWA</span>
    </div>
  );
};
