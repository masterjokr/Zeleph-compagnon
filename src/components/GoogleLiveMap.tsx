// Source: Google Maps Platform Code Assist
import React, { useState, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow, 
  MapControl, 
  ControlPosition 
} from '@vis.gl/react-google-maps';
import { 
  Radio, 
  Navigation, 
  Mountain, 
  ShieldAlert, 
  Phone, 
  ExternalLink, 
  Key, 
  Check, 
  Sparkles,
  Layers,
  Compass,
  Wind,
  MapPin
} from 'lucide-react';
import { LivePilotTrack, ParaglidingSite } from '../types';
import { getGoogleMapsApiKey, saveGoogleMapsApiKey, getStoredParaglidingSites } from '../utils/storageService';

interface GoogleLiveMapProps {
  tracks: LivePilotTrack[];
  selectedPilot: LivePilotTrack | null;
  onSelectPilot: (pilot: LivePilotTrack | null) => void;
  showAirspaces: boolean;
  showSites: boolean;
}

export const GoogleLiveMap: React.FC<GoogleLiveMapProps> = ({
  tracks,
  selectedPilot,
  onSelectPilot,
  showAirspaces,
  showSites
}) => {
  const [apiKey, setApiKey] = useState<string>(() => getGoogleMapsApiKey());
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [mapType, setMapType] = useState<'terrain' | 'satellite' | 'roadmap'>('terrain');

  // Synchronized paragliding sites with live overrides
  const [sites, setSites] = useState<ParaglidingSite[]>(() => getStoredParaglidingSites());
  const [selectedSiteMarker, setSelectedSiteMarker] = useState<{ site: ParaglidingSite; type: 'takeoff' | 'landing' } | null>(null);

  useEffect(() => {
    const handleSyncSites = () => {
      setSites(getStoredParaglidingSites());
    };
    window.addEventListener('zeleph_sites_updated', handleSyncSites);
    window.addEventListener('storage', handleSyncSites);
    return () => {
      window.removeEventListener('zeleph_sites_updated', handleSyncSites);
      window.removeEventListener('storage', handleSyncSites);
    };
  }, []);

  // Center of Chambery / Lac du Bourget / Bauges paragliding area
  const chamberyCenter = { lat: 45.612, lng: 5.955 };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempKeyInput.trim()) {
      saveGoogleMapsApiKey(tempKeyInput.trim());
      setApiKey(tempKeyInput.trim());
    }
    setIsKeyModalOpen(false);
  };

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950 flex flex-col">
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg text-xs text-white">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">Google Maps LiveTracking</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">• Savoie & Bauges</span>
          <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold text-[10px]">
            {tracks.length} en vol
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Map Style Selector */}
          <div className="flex items-center bg-slate-950/85 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg text-xs">
            <button
              type="button"
              onClick={() => setMapType('terrain')}
              className={`px-2.5 py-1 rounded-xl font-medium transition ${
                mapType === 'terrain' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Relief
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-xl font-medium transition ${
                mapType === 'satellite' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-xl font-medium transition ${
                mapType === 'roadmap' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Plan
            </button>
          </div>

          {/* Key Management button */}
          <button
            type="button"
            onClick={() => {
              setTempKeyInput(apiKey);
              setIsKeyModalOpen(true);
            }}
            className="p-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 hover:border-sky-500/50 text-slate-300 hover:text-sky-300 transition shadow-lg"
            title="Clé API Google Maps Platform (Maps Demo Key)"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Map View using official @vis.gl/react-google-maps */}
      <div className="w-full h-full relative z-10">
        <APIProvider apiKey={apiKey || ''}>
          <Map
            id="zeleph-live-google-map"
            mapId="DEMO_MAP_ID"
            defaultCenter={chamberyCenter}
            defaultZoom={11}
            mapTypeId={mapType}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {/* Paragliding Sites Markers: Décollages et Atterrissages synchronisés */}
            {showSites && sites.map(site => (
              <React.Fragment key={`site-group-${site.id}`}>
                {/* Décollage Marker */}
                <AdvancedMarker
                  key={`site-deco-${site.id}`}
                  position={{ lat: site.lat, lng: site.lng }}
                  title={`Décollage ${site.name} (${site.takeoffAlt}m)`}
                  onClick={() => setSelectedSiteMarker({ site, type: 'takeoff' })}
                >
                  <div className="flex flex-col items-center group cursor-pointer select-none">
                    <div className="px-2 py-0.5 rounded-md bg-slate-950/90 text-white border border-sky-400/50 text-[10px] font-bold shadow-md whitespace-nowrap mb-0.5 group-hover:scale-110 transition-transform">
                      Déco {site.name.split(' - ')[0]} ({site.takeoffAlt}m)
                    </div>
                    <div className="w-6 h-6 rounded-full bg-sky-500 border-2 border-white text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                      <Mountain className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </AdvancedMarker>

                {/* Atterrissage Marker */}
                {site.landingLat && site.landingLng && (
                  <AdvancedMarker
                    key={`site-atterro-${site.id}`}
                    position={{ lat: site.landingLat, lng: site.landingLng }}
                    title={`Atterrissage ${site.name} (${site.landingAlt}m)`}
                    onClick={() => setSelectedSiteMarker({ site, type: 'landing' })}
                  >
                    <div className="flex flex-col items-center group cursor-pointer select-none">
                      <div className="px-2 py-0.5 rounded-md bg-slate-950/90 text-emerald-300 border border-emerald-400/50 text-[9px] font-bold shadow-md whitespace-nowrap mb-0.5 group-hover:scale-110 transition-transform">
                        Atterro {site.name.split(' - ')[0]} ({site.landingAlt}m)
                      </div>
                      <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                        <Wind className="w-3 h-3" />
                      </div>
                    </div>
                  </AdvancedMarker>
                )}
              </React.Fragment>
            ))}

            {/* Active Flying Pilots Advanced Markers */}
            {tracks.map(pilot => {
              const isSelected = selectedPilot?.pilotId === pilot.pilotId;
              const isClimbing = (pilot.vario ?? 0) > 0.5;
              const isSinking = (pilot.vario ?? 0) < -0.5;

              return (
                <AdvancedMarker
                  key={`pilot-${pilot.pilotId}`}
                  position={{ lat: pilot.lat, lng: pilot.lng }}
                  onClick={() => onSelectPilot(pilot)}
                  title={`${pilot.pilotName} • ${pilot.altitude}m`}
                >
                  <div className={`relative flex flex-col items-center cursor-pointer select-none transition-transform ${isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'}`}>
                    {/* Pilot Callout Tag */}
                    <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-lg whitespace-nowrap mb-1 flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                        : 'bg-slate-950/90 text-white border-white/20'
                    }`}>
                      <span>{pilot.pilotName.split(' ')[0]}</span>
                      <span className="font-mono text-[9px] text-sky-300">{pilot.altitude}m</span>
                      <span className={`text-[9px] font-mono font-bold ${
                        isClimbing ? 'text-emerald-400' : isSinking ? 'text-rose-400' : 'text-slate-300'
                      }`}>
                        {pilot.vario && pilot.vario > 0 ? `+${pilot.vario}` : pilot.vario}
                      </span>
                    </div>

                    {/* Glider Marker with Heading Arrow */}
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-2xl transition ${
                        isClimbing
                          ? 'bg-emerald-500 text-slate-950 border-white shadow-emerald-500/50 animate-pulse'
                          : isSinking
                          ? 'bg-rose-500 text-white border-white shadow-rose-500/50'
                          : 'bg-sky-500 text-slate-950 border-white shadow-sky-500/50'
                      }`}>
                        <div 
                          style={{ transform: `rotate(${pilot.headingDeg ?? 0}deg)` }}
                          className="transition-transform duration-500"
                        >
                          <Navigation className="w-4 h-4 fill-current" />
                        </div>
                      </div>

                      {/* Miniature Pilot Avatar */}
                      <img 
                        src={pilot.avatarUrl} 
                        alt={pilot.pilotName} 
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Selected Pilot Info Window Popup */}
            {selectedPilot && (
              <InfoWindow
                position={{ lat: selectedPilot.lat, lng: selectedPilot.lng }}
                onCloseClick={() => onSelectPilot(null)}
              >
                <div className="p-1 max-w-[260px] text-slate-900 font-sans">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                    <img 
                      src={selectedPilot.avatarUrl} 
                      alt={selectedPilot.pilotName} 
                      className="w-10 h-10 rounded-xl object-cover border border-slate-300 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {selectedPilot.pilotName}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {selectedPilot.wingModel}
                      </p>
                    </div>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 py-2 text-xs">
                    <div className="bg-slate-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Altitude</span>
                      <span className="font-mono font-bold text-sky-700 text-sm">{selectedPilot.altitude} m</span>
                    </div>
                    <div className="bg-slate-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Vario</span>
                      <span className={`font-mono font-bold text-sm ${
                        (selectedPilot.vario ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {(selectedPilot.vario ?? 0) > 0 ? `+${selectedPilot.vario}` : selectedPilot.vario} m/s
                      </span>
                    </div>
                    <div className="bg-slate-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Vitesse sol</span>
                      <span className="font-mono font-bold text-slate-800">{selectedPilot.groundSpeed} km/h</span>
                    </div>
                    <div className="bg-slate-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Balise</span>
                      <span className="font-mono font-bold text-indigo-700 uppercase text-[11px]">{selectedPilot.platform}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-200">
                    <span>Secteur : <strong>{selectedPilot.siteNear}</strong></span>
                    {selectedPilot.phone && (
                      <a 
                        href={`tel:${selectedPilot.phone}`}
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Appeler</span>
                      </a>
                    )}
                  </div>

                  {selectedPilot.platform === 'puretrack' && selectedPilot.platformId && (
                    <a
                      href={`https://puretrack.io/${selectedPilot.platformId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block w-full py-1 px-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold text-center transition"
                    >
                      Ouvrir PureTrack ({selectedPilot.platformId}) ↗
                    </a>
                  )}
                </div>
              </InfoWindow>
            )}

            {/* Paragliding Site Takeoff/Landing InfoWindow */}
            {selectedSiteMarker && (
              <InfoWindow
                position={{
                  lat: selectedSiteMarker.type === 'takeoff' ? selectedSiteMarker.site.lat : selectedSiteMarker.site.landingLat,
                  lng: selectedSiteMarker.type === 'takeoff' ? selectedSiteMarker.site.lng : selectedSiteMarker.site.landingLng
                }}
                onCloseClick={() => setSelectedSiteMarker(null)}
              >
                <div className="p-1 max-w-xs text-slate-900 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">
                        {selectedSiteMarker.type === 'takeoff' ? '⛰️ Décollage FFVL' : '🎯 Atterrissage'}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {selectedSiteMarker.site.name}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-slate-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Altitude Déco</span>
                      <span className="font-mono font-bold text-sky-800">{selectedSiteMarker.site.takeoffAlt} m</span>
                    </div>
                    <div className="bg-slate-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Altitude Atterro</span>
                      <span className="font-mono font-bold text-emerald-800">{selectedSiteMarker.site.landingAlt} m</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Coordonnées GPS :</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedSiteMarker.type === 'takeoff'
                          ? `${selectedSiteMarker.site.lat.toFixed(5)}°N, ${selectedSiteMarker.site.lng.toFixed(5)}°E`
                          : `${selectedSiteMarker.site.landingLat.toFixed(5)}°N, ${selectedSiteMarker.site.landingLng.toFixed(5)}°E`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Orientations :</span>
                      <span className="font-bold text-slate-800">{selectedSiteMarker.site.orientations.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dénivelé / Finesse :</span>
                      <span className="font-bold text-slate-800">{selectedSiteMarker.site.elevationDiff}m (finesse {selectedSiteMarker.site.finesseRequired}:1)</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 italic">
                    Coordonnées synchronisées en direct avec les fiches de sites du club.
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Notice overlay if running without configured custom key */}
      {!apiKey && (
        <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
          <div className="bg-slate-950/90 backdrop-blur-md border border-sky-500/30 p-3 rounded-2xl shadow-2xl pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <strong className="text-white block">Google Maps Platform activé</strong>
                <span className="text-[11px] text-slate-400">
                  Visualisez les positions réelles en direct. Vous pouvez aussi renseigner une Maps Demo Key gratuite pour un affichage plein écran personnalisé.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTempKeyInput(apiKey);
                setIsKeyModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 transition"
            >
              Configurer la clé Maps
            </button>
          </div>
        </div>
      )}

      {/* Google Maps API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base text-white">Clé Google Maps Platform</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pour profiter de Google Maps Platform avec vos propres quotas et cartes personnalisées, renseignez votre clé API ou obtenez une <strong>Maps Demo Key</strong> gratuite sans carte bancaire :
            </p>

            <a
              href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs text-sky-300 hover:bg-sky-500/20 transition"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Obtenir une Maps Demo Key Google gratuite</span>
                  <span className="text-[11px] text-slate-400">1 clic avec n'importe quel compte Google personnel</span>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-400">Ouvrir →</span>
            </a>

            <form onSubmit={handleSaveKey} className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Clé API Google Maps (VITE_GOOGLE_MAPS_API_KEY)
                </label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={tempKeyInput}
                  onChange={e => setTempKeyInput(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    saveGoogleMapsApiKey('');
                    setApiKey('');
                    setIsKeyModalOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Effacer
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
