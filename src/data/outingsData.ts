import { ClubOuting } from '../types';

// Helper to generate dates relative to current date
const today = new Date();
const formatDate = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_OUTINGS: ClubOuting[] = [
  {
    id: 'outing-1',
    title: 'Cross Matinal : Le premier thermique de Montlambert',
    type: 'cross_inter',
    typeLabel: 'Cross Intermédiaire',
    date: formatDate(1), // Tomorrow
    time: '10:00',
    siteId: 'montlambert',
    siteName: 'Montlambert (Combe de Savoie)',
    meetingPoint: 'Atterrissage officiel de Saint-Jean-de-la-Porte',
    organizerId: 'usr-zeleph-me',
    organizerName: 'Jonathan Roux',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    organizerPhone: '06 45 12 78 90',
    organizerRole: 'Pilote Cross (Organisateur)',
    conditionsRequired: {
      minPilotLevel: 'Brevet de Pilote (autonomie complète)',
      gearRequired: ['Radio 146.500 MHz chargée', 'Parachute de secours révisé', 'Vario / GPS avec balises'],
      aerologyNotice: 'Décollage dès 10h30 avant l’arrivée de la brise de Combe. Objectif aller-retour Chamoux ou transition Arclusaz.'
    },
    maxParticipants: 8,
    participants: [
      {
        id: 'usr-julien',
        name: 'Julien Blanc',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        discordRole: 'Responsable Navettes',
        phone: '06 12 34 56 78',
        wing: 'Advance Iota DLS',
        level: 'Brevet de Pilote',
        status: 'confirmed',
        joinedAt: '2026-09-05T14:30:00Z'
      },
      {
        id: 'usr-romain',
        name: 'Romain Petit',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        discordRole: 'Trotte & Vol',
        phone: '06 33 22 11 00',
        wing: 'Gin Camino',
        level: 'BPC',
        status: 'confirmed',
        joinedAt: '2026-09-05T16:00:00Z'
      }
    ],
    status: 'confirmed',
    statusNote: 'Météo favorable, vent faible de NW en altitude, plafonds prévus à 2200m.',
    description: 'Rendez-vous à 10h00 à l’atterro de Saint-Jean pour monter en 1 seule voiture à Montlambert. On décolle vers 10h45 pour exploiter le premier cycle thermique plein Sud !',
    createdAt: new Date().toISOString()
  },
  {
    id: 'outing-2',
    title: 'Sortie Pioupiou & Progression au grand atterro de Chamoux',
    type: 'pioupiou',
    typeLabel: 'Sortie Pioupiou / Débutant',
    date: formatDate(2), // in 2 days
    time: '16:30',
    siteId: 'chamoux',
    siteName: 'Chamoux-sur-Gelon',
    meetingPoint: 'Grand atterrissage avec rubalise et tapis de pliage',
    organizerId: 'usr-sophie',
    organizerName: 'Sophie Mercier',
    organizerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    organizerPhone: '06 88 77 66 55',
    organizerRole: 'Monitrice Fédérale (Encadrante)',
    conditionsRequired: {
      minPilotLevel: 'Brevet Initial ou sortie d’école (validation gonflage)',
      gearRequired: ['Radio 146.500 MHz + oreillette', 'Casque FFVL', 'Voile EN-A ou B sage'],
      aerologyNotice: 'Conditions très calmes de fin d’après-midi, brise laminaire faiblissante.'
    },
    maxParticipants: 6,
    participants: [
      {
        id: 'usr-claire',
        name: 'Claire Vignaud',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
        discordRole: 'Pilote Pioupiou',
        phone: '06 71 82 93 04',
        wing: 'BGD Echo 2',
        level: 'Brevet Initial',
        status: 'confirmed',
        joinedAt: '2026-09-05T18:10:00Z'
      }
    ],
    status: 'confirmed',
    statusNote: 'Briefing terrain à 16h30, reconnaissance de l’approche en PTU et aide au gonflage face voile.',
    description: 'Une après-midi conviviale dédiée aux jeunes pilotes du club Zéléph ! Vols calmes, travail des approches, conseils personnalisés à la radio et débriefing autour d’un verre.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'outing-3',
    title: 'Trotte & Vol : Ascension de la Croix du Nivolet par le Pas de l’Échelle',
    type: 'marche_vol',
    typeLabel: 'Sortie Marche & Vol',
    date: formatDate(4),
    time: '08:30',
    siteId: 'verel',
    siteName: 'Croix du Nivolet & Vérel',
    meetingPoint: 'Parking sous Pragondran (Le Verney)',
    organizerId: 'usr-romain',
    organizerName: 'Romain Petit',
    organizerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    organizerPhone: '06 33 22 11 00',
    organizerRole: 'Référent Trotte & Vol Zéléph',
    conditionsRequired: {
      minPilotLevel: 'Bonne condition physique (+930m D+)',
      gearRequired: ['Voile montagne / light de préférence', 'Bonnes chaussures de trail / rando', 'Bâtons', 'Radio'],
      aerologyNotice: 'Décollage herbeux sous la Croix ou repli au décollage de Vérel si le vent de crête est trop fort.'
    },
    maxParticipants: 10,
    participants: [
      {
        id: 'usr-zeleph-me',
        name: 'Jonathan Roux',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        discordRole: 'Pilote Cross',
        phone: '06 45 12 78 90',
        wing: 'Ozone Alpina 4',
        level: 'BPC',
        status: 'confirmed',
        joinedAt: '2026-09-06T08:00:00Z'
      }
    ],
    status: 'confirmed',
    statusNote: 'Montée tranquille en groupe (environ 2h15 de marche).',
    description: 'La grande classique savoyarde ! On monte ensemble par les sous-bois puis le Pas de l’Échelle. Casse-croûte sous la Croix avant de s’envoler au-dessus de Chambéry pour poser à Pragondran.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'outing-4',
    title: 'Restitution Magique du Soir au Sire & Nivolet',
    type: 'soaring',
    typeLabel: 'Soaring du Soir & Restit',
    date: formatDate(5),
    time: '17:15',
    siteId: 'le-sire',
    siteName: 'Le Sire - La Féclaz',
    meetingPoint: 'Parking du Sire (chalet d’alpage)',
    organizerId: 'usr-julien',
    organizerName: 'Julien Blanc',
    organizerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    organizerPhone: '06 12 34 56 78',
    organizerRole: 'Pilote Club',
    conditionsRequired: {
      minPilotLevel: 'Autonome au décollage falaise & maîtrise du soaring de crête',
      gearRequired: ['Radio 146.500 MHz', 'Veste coupe-vent', 'Éclairage d’atterro en cas de vol tardif'],
      aerologyNotice: 'Restitution laminaire le long des falaises Ouest. Surveiller l’extinction du thermique au crépuscule.'
    },
    maxParticipants: 12,
    participants: [],
    status: 'weather_pending',
    statusNote: 'Point météo à confirmer 24h avant selon la nébulosité sur la cluse.',
    description: 'Une session coucher de soleil comme on les aime aux Zéléph : décollage du Sire, balade le long des crêtes face au Lac du Bourget et atterrissage doux à Pragondran.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'outing-5',
    title: 'Cross Expert : Tour des Bauges & Traversée du Lac d’Annecy',
    type: 'cross_expert',
    typeLabel: 'Cross Expert',
    date: formatDate(7),
    time: '11:00',
    siteId: 'le-sire',
    siteName: 'Le Sire - La Féclaz',
    meetingPoint: 'Décollage du Sire',
    organizerId: 'usr-zeleph-me',
    organizerName: 'Jonathan Roux',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    organizerPhone: '06 45 12 78 90',
    organizerRole: 'Pilote Cross (Organisateur)',
    conditionsRequired: {
      minPilotLevel: 'Brevet Pilote Confirmé (BPC) + Expérience vol de distance',
      gearRequired: ['Live tracking / Livetrack24 ou XC Contest', 'Radio club 146.500', 'Secours & coupe-suspentes'],
      aerologyNotice: 'Plafonds requis au-dessus de 2500m. Transition vers le Roc des Bœufs et les Dents de Lanfon.'
    },
    maxParticipants: 5,
    participants: [],
    status: 'weather_pending',
    statusNote: 'Nécessite de bonnes conditions convectives et un vent météo inférieur à 15 km/h.',
    description: 'Tentative de grand tour des Bauges au départ du Sire : Sire -> Trélod -> Roc des Bœufs -> Doussard ou retour Chambéry en triangle FAI.',
    createdAt: new Date().toISOString()
  }
];
