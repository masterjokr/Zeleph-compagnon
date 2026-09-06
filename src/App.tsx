import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SiteGuide } from './components/SiteGuide';
import { WeatherRadar } from './components/WeatherRadar';
import { ShuttleBoard } from './components/ShuttleBoard';
import { TrotteEtVol } from './components/TrotteEtVol';
import { SafetySOS } from './components/SafetySOS';
import { AiAeroBriefing } from './components/AiAeroBriefing';
import { MembersSpace } from './components/MembersSpace';
import { ClubOutingsCalendar } from './components/ClubOutingsCalendar';
import { OfflineBadge } from './components/OfflineBadge';
import { FlyableSitesModal } from './components/FlyableSitesModal';
import { fetchLiveBeacons } from './services/weatherService';
import { LiveBeaconData } from './types';
import { Radio, ExternalLink, Globe, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('sites');
  const [beacons, setBeacons] = useState<LiveBeaconData[]>([]);
  const [loadingBeacons, setLoadingBeacons] = useState<boolean>(true);
  const [showFlyableModal, setShowFlyableModal] = useState<boolean>(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('verel');
  const [weatherFilter, setWeatherFilter] = useState<'all' | 'optimal' | 'flyable'>('all');
  const [filterSiteGuideFlyable, setFilterSiteGuideFlyable] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const loadWeather = async () => {
    setLoadingBeacons(true);
    try {
      const data = await fetchLiveBeacons();
      setBeacons(data);
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoadingBeacons(false);
    }
  };

  useEffect(() => {
    loadWeather();
    // Poll weather every 10 minutes
    const interval = setInterval(loadWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectSiteFromBeacon = (siteId: string) => {
    setSelectedSiteId(siteId);
    setFilterSiteGuideFlyable(false);
    setActiveTab('sites');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const flyableCount = beacons.filter(b => b.status === 'optimal' || b.status === 'moderate').length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Immersive Ambient Glows */}
      <div 
        className="fixed inset-0 opacity-25 pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 20% 15%, #38bdf8 0%, transparent 45%), radial-gradient(circle at 80% 85%, #6366f1 0%, transparent 45%)',
          filter: 'blur(90px)' 
        }} 
      />
      {/* Subtle Dot Grid */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* PWA Offline indicator */}
      <OfflineBadge />

      {/* Main App Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Cockpit HUD Sub-Header */}
      <div className="relative z-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-300">
                Live Cockpit • Savoie & Bauges
              </span>
            </div>

            {/* Clickable Flyable Sites Indicator */}
            <div className="mt-1">
              {flyableCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowFlyableModal(true)}
                  className="group inline-flex flex-wrap items-center gap-2 text-left transition cursor-pointer"
                  title="Cliquer pour voir la liste détaillée des sites volables aujourd'hui"
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 group-hover:bg-emerald-500/25 group-hover:border-emerald-500/50 transition shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <strong className="text-emerald-300 font-bold text-xs group-hover:text-emerald-200">
                      {flyableCount} site{flyableCount > 1 ? 's' : ''} volable{flyableCount > 1 ? 's' : ''} aujourd'hui
                    </strong>
                    <span className="text-[10px] text-emerald-400/90 font-mono font-bold underline underline-offset-2 ml-1 group-hover:translate-x-0.5 transition-transform">
                      Voir les sites →
                    </span>
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 hidden xs:inline">
                    • Brise de cluse surveillée
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFlyableModal(true)}
                  className="group inline-flex items-center gap-2 text-left transition cursor-pointer text-slate-400 hover:text-slate-300"
                  title="Cliquer pour vérifier le bulletin des sites"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400/80"></span>
                  <span className="text-xs">Surveillance continue des balises et décollages savoyards</span>
                  <span className="text-[10px] text-sky-400 underline underline-offset-2 font-mono">
                    Statut sites →
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:text-right">
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-sky-400 tracking-tight">
                {currentTime}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                Heure locale • UTC+2
              </div>
            </div>

            <div className="hidden md:block w-[1px] h-8 bg-white/10" />

            {/* Radio Frequencies HUD (Club 146.500 & FFVL 143.9875) */}
            <div className="hidden md:flex items-center gap-4 text-right">
              <div>
                <div className="text-xs font-mono text-sky-400 font-bold">
                  146.500 MHz
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Club Zéléph
                </div>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  143.9875 MHz
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  FFVL Sécurité
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {activeTab === 'sites' && (
          <SiteGuide 
            beacons={beacons} 
            onSelectBeaconTab={() => {
              setWeatherFilter('all');
              setActiveTab('meteo');
            }}
            selectedSiteId={selectedSiteId}
            onSelectSite={(id) => setSelectedSiteId(id)}
            initialFilterFlyable={filterSiteGuideFlyable}
          />
        )}

        {activeTab === 'meteo' && (
          <WeatherRadar
            beacons={beacons}
            loading={loadingBeacons}
            onRefresh={loadWeather}
            onSelectSite={handleSelectSiteFromBeacon}
            initialFilterStatus={weatherFilter}
          />
        )}

        {activeTab === 'calendrier' && (
          <ClubOutingsCalendar 
            onNavigateToSite={(siteId) => {
              setSelectedSiteId(siteId);
              setActiveTab('sites');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'navettes' && (
          <ShuttleBoard />
        )}

        {activeTab === 'membres' && (
          <MembersSpace 
            onNavigateToShuttles={() => {
              setActiveTab('navettes');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToOutings={() => {
              setActiveTab('calendrier');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'trotte' && (
          <TrotteEtVol />
        )}

        {activeTab === 'sos' && (
          <SafetySOS />
        )}

        {activeTab === 'briefing' && (
          <AiAeroBriefing />
        )}
      </main>

      {/* Interactive Flyable Sites Modal */}
      <FlyableSitesModal
        isOpen={showFlyableModal}
        onClose={() => setShowFlyableModal(false)}
        beacons={beacons}
        onSelectSite={(siteId) => {
          setSelectedSiteId(siteId);
          setFilterSiteGuideFlyable(false);
          setActiveTab('sites');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenWeatherRadar={(filter = 'flyable') => {
          setWeatherFilter(filter);
          setActiveTab('meteo');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSiteGuideFlyable={() => {
          setFilterSiteGuideFlyable(true);
          setActiveTab('sites');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 mt-12 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900/80 border border-white/10 flex items-center justify-center shadow-md shadow-sky-500/10 p-1">
              <img 
                src="https://www.zeleph.com/wp-content/uploads/2023/06/cropped-512p-1-2.png" 
                alt="Logo Zéleph" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-bold text-slate-200">
                Club Les Z'éléphants Volants (Les Z'éléph)
              </p>
              <p className="text-[11px] text-slate-400">
                Club FFVL N° 01031 • Chambéry, Savoie, Auvergne-Rhône-Alpes
              </p>
            </div>
          </div>

          {/* Quick links & Frequencies */}
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <a
              href="https://www.zeleph.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-400 flex items-center gap-1 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Site officiel zeleph.com</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>

            <span className="text-slate-800 hidden sm:inline">•</span>

            <div className="flex items-center gap-2 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span>Club : <strong className="font-mono text-sky-400">146.500 MHz</strong></span>
              <span className="text-slate-600">•</span>
              <span>FFVL Sécu : <strong className="font-mono text-emerald-400">143.9875 MHz</strong></span>
            </div>

            <span className="text-slate-800 hidden sm:inline">•</span>

            <span className="text-emerald-400 font-mono text-[11px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              PWA Installable
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
