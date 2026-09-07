import React from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { 
  MapPin, 
  Car, 
  Mountain, 
  ShieldAlert, 
  Sparkles, 
  Radio, 
  CalendarDays, 
  Users, 
  LogOut, 
  Eye, 
  Crown,
  LogIn,
  Sun,
  Moon
} from 'lucide-react';
import { ClubMemberProfile, AppTheme } from '../types';
import { isZelephMember } from '../utils/authUtils';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sosActive?: boolean;
  currentUser?: ClubMemberProfile | null;
  onLogout?: () => void;
  onOpenWelcomeModal?: () => void;
  theme?: AppTheme;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout,
  onOpenWelcomeModal,
  theme = 'dark',
  onToggleTheme
}) => {
  const navItems = [
    { id: 'sites', label: 'Sites & Décos', icon: MapPin },
    { id: 'livetracking', label: 'LiveTracking', icon: Radio, badge: 'Direct' },
    { id: 'calendrier', label: 'Calendrier Sorties', icon: CalendarDays },
    { id: 'navettes', label: 'Covoit’ Déco', icon: Car },
    { id: 'membres', label: 'Pilotes & Club', icon: Users },
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
            {/* LiveTracking indicator */}
            <div 
              onClick={() => setActiveTab('livetracking')}
              className="hidden lg:flex items-center gap-2 bg-slate-900/60 border border-white/5 hover:border-sky-500/40 px-3 py-1.5 rounded-xl text-xs text-slate-300 cursor-pointer transition"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400">LiveTracking Actif</span>
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

            {/* User Account / Login Button / Visitor Badge */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 rounded-xl p-1 pl-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('membres')}
                  className="flex items-center gap-2 text-xs text-white group hover:text-sky-300 transition"
                  title={`Connecté en tant que ${currentUser.fullName} (${currentUser.googleEmail || currentUser.email}). Cliquer pour voir votre profil.`}
                >
                  <img
                    src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-lg object-cover border border-sky-400/30"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-semibold hidden md:inline max-w-[110px] truncate">
                    {currentUser.fullName}
                  </span>
                  {currentUser.isSuperAdmin ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5 text-amber-400" />
                      <span>Admin</span>
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/30 hidden sm:inline">
                      Pilote
                    </span>
                  )}
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Se déconnecter (repasser en mode visiteur)"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenWelcomeModal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 text-xs hover:border-slate-500 transition"
                  title="Mode Visiteur actif : vous visualisez les informations en lecture seule. Cliquer pour changer de mode."
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">Visiteur</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenWelcomeModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md shadow-sky-500/20"
                  title="Se connecter avec un compte Google pour renseigner sa fiche et participer"
                >
                  <LogIn className="w-3.5 h-3.5 text-white" />
                  <span>Connexion Google</span>
                </button>
              </div>
            )}

            {/* Theme Switcher Button (Sombre / Clair) */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer shadow-sm"
                title={theme === 'light' ? "Basculer vers le thème sombre" : "Basculer vers le thème clair"}
                aria-label="Basculer le thème"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline">Sombre</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-200 hidden sm:inline">Clair</span>
                  </>
                )}
              </button>
            )}

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
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold tracking-tight uppercase transition ${
                    isActive 
                      ? 'bg-slate-950/20 text-slate-900 border border-slate-950/20' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
