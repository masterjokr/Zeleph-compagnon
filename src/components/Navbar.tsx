import React from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { Wind, MapPin, Car, Mountain, ShieldAlert, Sparkles, Radio, CalendarDays, Users } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sosActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'sites', label: 'Sites & Décos', icon: MapPin },
    { id: 'meteo', label: 'Balises Live', icon: Wind },
    { id: 'calendrier', label: 'Calendrier Sorties', icon: CalendarDays },
    { id: 'navettes', label: 'Covoit’ Déco', icon: Car },
    { id: 'membres', label: 'Membres & Discord', icon: Users },
    { id: 'trotte', label: 'Trotte & Vol', icon: Mountain },
    { id: 'sos', label: 'Sécurité & SOS', icon: ShieldAlert, highlight: true },
    { id: 'briefing', label: 'Briefing Aéro', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveTab('sites')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-slate-900/80 border border-white/10 flex items-center justify-center shadow-lg shadow-sky-500/10 group-hover:scale-105 group-hover:border-sky-400/40 transition p-1">
              <img 
                src="https://www.zeleph.com/wp-content/uploads/2023/06/cropped-512p-1-2.png" 
                alt="Logo Club Les Z'éléphants Volants" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-light tracking-tight text-base sm:text-xl text-white group-hover:text-sky-400 transition">
                  Zéléph <span className="font-bold text-sky-400">SkyHub</span>
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wider bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20 uppercase">
                  Chambéry
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 hidden xs:block">
                Vol Libre • FFVL N° 01031
              </p>
            </div>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-3">
            {/* Live Telemetry active indicator */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Télémétrie Active</span>
            </div>

            {/* Radio quick badge (Club 146.500 & FFVL 143.9875) */}
            <div 
              className="hidden sm:flex items-center gap-2 bg-slate-900/60 border border-white/5 text-slate-300 text-xs px-3 py-1.5 rounded-xl"
              title="Fréquence Club Zéléph (146.500 MHz) & Sécurité FFVL (143.9875 MHz)"
            >
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-slate-300">Club <strong className="text-sky-400">146.500</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">FFVL <strong className="text-emerald-400">143.9875</strong></span>
              </div>
            </div>

            {/* In-app PWA install button */}
            <PWAInstallPrompt />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar border-t border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? item.highlight 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 font-semibold'
                      : 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20 font-bold'
                    : item.highlight
                    ? 'text-rose-400 hover:bg-rose-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (item.highlight ? 'text-white' : 'text-slate-950') : item.highlight ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
