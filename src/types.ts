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
}

export type PilotLevel = 
  | 'Pioupiou / Débutant' 
  | 'Brevet Initial (Autonome sur site calme)' 
  | 'Brevet de Pilote (Tous sites)' 
  | 'Brevet Pilote Confirmé (BPC / Cross)' 
  | 'Biplaceur Fédéral' 
  | 'Moniteur Fédéral';

export interface ClubMemberProfile {
  id: string;
  discordId?: string;
  discordUsername: string;
  discordDiscriminator?: string;
  discordAvatarUrl: string;
  discordRole: string; // e.g. "Adhérent Zéleph 2026", "Pilote Cross", "Bureau", "Moniteur"
  fullName: string;
  phone: string;
  email: string;
  pilotLevel: PilotLevel;
  wingModel: string; // e.g. "Ozone Alpina 4"
  wingColor: string; // e.g. "Bleu / Jaune / Blanc"
  harness: string; // e.g. "Kavik cocon / Supair Strike"
  sector: string; // e.g. "Chambéry Centre", "Saint-Alban-Leysse", "Barberaz", "Aix-les-Bains"
  vehicleInfo: string; // e.g. "Berlingo 4 places + grand coffre"
  availableSeats: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  radioFrequency: string; // default "146.500 MHz"
  bio?: string;
  isDiscordConnected: boolean;
  isSuperAdmin?: boolean;
  joinedClubYear: number;
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
}
