export type AppTheme = 'dark' | 'light';

export type WindDirection = 
  | 'N' | 'NNE' | 'NE' | 'ENE' 
  | 'E' | 'ESE' | 'SE' | 'SSE' 
  | 'S' | 'SSW' | 'SW' | 'WSW' 
  | 'W' | 'WNW' | 'NW' | 'NNW';

export interface ParaglidingSite {
  id: string;
  name: string;
  subTitle: string;
  massif: 'Bauges' | 'Chartreuse' | 'Avant-Pays Savoyard' | 'Combe de Savoie';
  takeoffAlt: number; // in meters
  landingAlt: number; // in meters
  elevationDiff: number; // in meters
  finesseRequired: number; // finesse nécessaire (L/D)
  orientations: WindDirection[];
  idealWindMin: number; // km/h
  idealWindMax: number; // km/h
  maxSafeGust: number; // km/h
  lat: number;
  lng: number;
  landingLat: number;
  landingLng: number;
  level: 'Tous pilotes' | 'Pilote autonome' | 'Pilote confirmé';
  types: ('Thermique' | 'Soaring' | 'Restitution' | 'Cross' | 'Rando-Vol' | 'École' | 'Bocal')[];
  description: string;
  aerologyTips: string;
  hazards: string[];
  airspaceWarning?: string;
  webcamUrl?: string;
  ffvlBeaconId?: string;
  accessInfo: string;
  recommendedHours: string; // e.g. "13h30 - 20h30"
  bestTimeSlots: {
    period: string;
    hours: string;
    description: string;
    isOptimal?: boolean;
  }[];
  lastUpdatedDate?: string;
  updatedBy?: string;
}

export interface LiveBeaconData {
  siteId: string;
  siteName: string;
  temperature: number;
  windSpeed: number; // km/h
  windGusts: number; // km/h
  windDirectionDeg: number;
  windDirectionText: WindDirection;
  relativeHumidity: number;
  pressure: number;
  cloudCover: number;
  status: 'optimal' | 'moderate' | 'unfavorable';
  statusReason: string;
  lastUpdated: string;
}

export interface ShuttleRide {
  id: string;
  driverName: string;
  driverPhone?: string;
  departurePlace: string;
  destinationSiteId: string;
  destinationSiteName: string;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  wingTypes: string; // e.g. "Solo & Tandem bienvenus"
  passengers: string[];
  comment?: string;
  createdAt: string;
  discordMessageId?: string;
  discordChannelId?: string;
  discordWebhookUrl?: string;
  discordLastSyncedAt?: string;
}

export interface HikeAndFlyTopo {
  id: string;
  title: string;
  summit: string;
  dPlus: number; // m
  distanceKm: number;
  durationAscentMin: number;
  startPoint: string;
  landingSpot: string;
  finessePlan: number;
  difficulty: 'Facile' | 'Moyen' | 'Sportif' | 'Alpin';
  description: string;
  itinerary: string[];
  takeoffTip: string;
  authorName?: string;
  authorId?: string;
  authorRole?: string;
  createdAt?: string;
  isCommunity?: boolean;
  orientation?: string;
  recommendedSeason?: string;
}

export type PilotLevel = 
  | 'Pioupiou / Débutant' 
  | 'Brevet Initial (Autonome sur site calme)' 
  | 'Brevet de Pilote (Tous sites)' 
  | 'Brevet Pilote Confirmé (BPC / Cross)' 
  | 'Biplaceur Fédéral' 
  | 'Moniteur Fédéral';

export type LiveTrackingPlatform = 
  | 'ogn' 
  | 'puretrack' 
  | 'flymaster' 
  | 'syride' 
  | 'livetrack24' 
  | 'garmin' 
  | 'autre';

export interface ClubMemberProfile {
  id: string;
  fullName: string;
  email: string;
  googleEmail?: string;
  avatarUrl?: string;
  role?: string; // e.g. "Super-Administrateur Club • Les Z’éléphants Volants", "Monitrice Fédérale & Bureau", "Adhérent Zéléph 2026"
  phone: string;
  pilotLevel: PilotLevel;
  wingModel: string; // e.g. "Ozone Alpina 4"
  wingColor: string; // e.g. "Bleu / Jaune / Blanc"
  harness: string; // e.g. "Supair Strike 2"
  sector: string; // e.g. "Chambéry Centre", "Saint-Alban-Leysse", "Barberaz", "Aix-les-Bains"
  vehicleInfo: string; // e.g. "Berlingo 4 places + grand coffre"
  availableSeats: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  radioFrequency: string; // default "146.500 MHz (Club Zéléph)"
  bio?: string;
  isSuperAdmin?: boolean;
  isExample?: boolean;
  isGoogleConnected?: boolean;
  isGoogleVerified?: boolean;
  joinedClubYear: number;

  // LiveTracking configuration
  liveTrackingPlatform?: LiveTrackingPlatform;
  liveTrackingId?: string; // e.g. OGN Callsign, PureTrack handle, Flymaster ID, Syride pilot link
  shareLiveTracking?: boolean; // Accept to be broadcast on the club general live tracking map

  // Legacy compatibility fields
  discordId?: string;
  discordUsername?: string;
  discordDiscriminator?: string;
  discordAvatarUrl?: string;
  discordRole?: string;
  isDiscordConnected?: boolean;
}

export interface LivePilotTrack {
  pilotId: string;
  pilotName: string;
  avatarUrl: string;
  googleEmail?: string;
  wingModel: string;
  wingColor: string;
  lat: number;
  lng: number;
  altitude: number; // in meters
  groundSpeed: number; // in km/h
  vario: number; // in m/s (+2.4, -0.8...)
  headingDeg: number; // heading 0-360
  lastUpdate: string; // "14:32:05" or "Il y a 1 min"
  status: 'flying' | 'climbing' | 'landed' | 'takeoff';
  siteNear: string; // e.g. "Verel - Nivolet", "Dent du Chat", "Montlambert"
  batteryLevel?: number; // 0-100%
  platform: LiveTrackingPlatform;
  platformLabel: string;
  platformId?: string;
  phone?: string;
  radioFrequency?: string;
  emergencyContact?: string;
  outingId?: string; // Optional: associated outing for future per-outing livetracking
}

export type OutingCategory = 
  | 'pioupiou'
  | 'marche_vol'
  | 'cross_debutant'
  | 'cross_inter'
  | 'cross_expert'
  | 'soaring'
  | 'securite'
  | 'autre';

export interface OutingParticipant {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  discordRole?: string;
  phone?: string;
  wing?: string;
  level?: string;
  status: 'confirmed' | 'pending';
  joinedAt: string;
}

export interface ClubOuting {
  id: string;
  title: string;
  type: OutingCategory;
  typeLabel: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  siteId?: string;
  siteName: string;
  meetingPoint: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar: string;
  organizerPhone: string;
  organizerRole: string;
  conditionsRequired: {
    minPilotLevel: string;
    gearRequired: string[];
    aerologyNotice?: string;
  };
  maxParticipants: number;
  participants: OutingParticipant[];
  status: 'confirmed' | 'weather_pending' | 'cancelled' | 'completed';
  statusNote?: string;
  description: string;
  createdAt: string;
  discordMessageId?: string;
  discordChannelId?: string;
  discordWebhookUrl?: string;
  discordLastSyncedAt?: string;
}
