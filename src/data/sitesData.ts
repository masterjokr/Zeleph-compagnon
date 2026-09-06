import { ParaglidingSite } from '../types';

export const ZELEPH_SITES: ParaglidingSite[] = [
  {
    id: 'verel',
    name: 'Vérel - Pragondran',
    subTitle: 'La falaise emblématique au-dessus de Chambéry',
    massif: 'Bauges',
    takeoffAlt: 880,
    landingAlt: 450,
    elevationDiff: 430,
    finesseRequired: 4.8,
    orientations: ['W', 'NW', 'WSW', 'SW'],
    idealWindMin: 8,
    idealWindMax: 22,
    maxSafeGust: 28,
    lat: 45.5901,
    lng: 5.9542,
    landingLat: 45.5862,
    landingLng: 5.9415,
    level: 'Pilote autonome',
    types: ['Thermique', 'Soaring', 'Restitution', 'Bocal'],
    description: "Le site historique des Z'éléphants Volants ! Une vue plongeante sur l'agglomération de Chambéry, la cluse et la chaîne de l'Épine. Idéal pour les thermiques de début d'après-midi et la fameuse restitution en fin de journée.",
    aerologyTips: "La brise de vallée de Chambéry remonte d'Ouest à Sud-Ouest, et le site est également parfaitement volable en Nord-Ouest (NW). En milieu d'après-midi la brise peut être soutenue à l'atterro de Pragondran. En soirée, la brise s'adoucit et crée une restitution remarquable et douce sur toute la falaise du Nivolet.",
    hazards: [
      'Décollage falaise court et engagé (sans possibilité de repose immédiate)',
      'Volable en Ouest, Sud-Ouest et Nord-Ouest (NW). En revanche, sous le vent strict par composante Nord pur ou Est / Nord-Est (ne jamais décoller par vent météo de N/NE fort !)',
      'Atterrissage de Pragondran entouré d’arbres et lignes électriques à proximité',
      'Attention à la CTR de Chambéry Aix-les-Bains : respect strict des zones de vol autorisées'
    ],
    airspaceWarning: 'CTR Chambéry Aix-les-Bains (LFLB) active en classe D. Respecter le protocole FFVL / DGAC Zéleph (ne pas pénétrer dans l’axe d’approche piste 18/36).',
    webcamUrl: 'https://www.solarcam.fr/verel/',
    ffvlBeaconId: 'verel',
    accessInfo: "Depuis Chambéry ou Saint-Alban-Leysse, monter vers Pragondran puis prendre la route forestière menant au parking du décollage de Vérel. 5 min de marche à pied.",
    recommendedHours: '13h30 - 20h30',
    bestTimeSlots: [
      {
        period: "Thermique d'après-midi",
        hours: "13h30 - 17h00",
        description: "Thermiques dynamiques s'appuyant sur la falaise, plafonds progressifs vers la Croix du Nivolet."
      },
      {
        period: "Restitution du soir",
        hours: "17h30 - 20h30",
        description: "La grande classique locale : restitution laminaire très douce et portante le long des falaises jusqu'au crépuscule.",
        isOptimal: true
      }
    ]
  },
  {
    id: 'le-sire',
    name: 'Le Sire - La Féclaz',
    subTitle: 'Le balcon royal au-dessus du Lac du Bourget et départs en cross',
    massif: 'Bauges',
    takeoffAlt: 1520,
    landingAlt: 450,
    elevationDiff: 1070,
    finesseRequired: 5.5,
    orientations: ['W', 'WSW', 'NW'],
    idealWindMin: 10,
    idealWindMax: 24,
    maxSafeGust: 30,
    lat: 45.6452,
    lng: 5.9868,
    landingLat: 45.5862,
    landingLng: 5.9415,
    level: 'Pilote confirmé',
    types: ['Thermique', 'Soaring', 'Restitution', 'Cross'],
    description: "Un des plus beaux sites des Alpes du Nord. Perché à 1520m sur la crête du Revard, le Sire offre un panorama grandiose sur le lac du Bourget et le Mont Blanc en arrière-plan. C'est le tremplin majeur des Z'éléph pour partir en cross vers les Bauges, le Semnoz ou le massif de la Chartreuse.",
    aerologyTips: "Fonctionne remarquablement en thermique pur l'après-midi, puis en gigantesque restitution de couche le soir. Décollages somptueux au coucher du soleil lorsque toute la falaise s'allume.",
    hazards: [
      'Rouleaux très violents en arrière du décollage si le vent bascule Est / Sud-Est (foehn)',
      'Décollage falaise abrupte nécessitant un gonflage maîtrisé',
      'Transitions vers la plaine : anticiper la descente vers Pragondran ou Mouxy si la brise de vallée forcit'
    ],
    airspaceWarning: 'Plafond aérien TMA Lyon/Chambéry : vérifiez les altitudes maximales (généralement FL115 / 3500m QNH selon les secteurs actifs).',
    webcamUrl: 'https://m.webcam-hd.com/savoie-grand-revard/le-sire',
    ffvlBeaconId: 'sire',
    accessInfo: "Depuis Chambéry ou Aix, monter à La Féclaz puis suivre la route des crêtes jusqu'au parking du Sire. 10 minutes de marche à plat sur le sentier panoramique.",
    recommendedHours: '13h30 - 20h30',
    bestTimeSlots: [
      {
        period: "Thermique & Cross",
        hours: "13h30 - 17h00",
        description: "Plafonds hauts et départs en cross vers les Bauges, le Semnoz ou la Chartreuse.",
        isOptimal: true
      },
      {
        period: "Restitution & Soaring",
        hours: "17h30 - 20h30",
        description: "Vol contemplatif au coucher du soleil face au lac du Bourget dans un air calme et porteur.",
        isOptimal: true
      }
    ]
  },
  {
    id: 'montlambert',
    name: 'Montlambert',
    subTitle: 'Le premier site allumé en Combe de Savoie le matin • Protégé en Nord',
    massif: 'Combe de Savoie',
    takeoffAlt: 1020,
    landingAlt: 320,
    elevationDiff: 700,
    finesseRequired: 4.5,
    orientations: ['S', 'SSE', 'SE', 'N'],
    idealWindMin: 6,
    idealWindMax: 20,
    maxSafeGust: 26,
    lat: 45.5681,
    lng: 6.0954,
    landingLat: 45.5583,
    landingLng: 6.0821,
    level: 'Tous pilotes',
    types: ['Thermique', 'Cross', 'Bocal'],
    description: "Le spot fétiche des crossmen savoyards dès le printemps. Exposé plein Sud / Sud-Est, les thermiques se déclenchent dès 10h-11h du matin pendant que les autres sites dorment encore. Également volable par vent de Nord car bien protégé sous le vent du relief (vigilance requise).",
    aerologyTips: "Déclenchement très précoce le matin grâce au relief calcaire bien exposé Sud/Sud-Est. Le site est également protégé du vent de Nord (N) par le relief des Bauges en arrière, permettant souvent de voler même par régime de Nord modéré. Vigilance accrue toutefois aux cisaillements en altitude et à la brise de vallée de l'Isère qui forcit après 14h.",
    hazards: [
      'Volable en régime de Nord (N) car bien abrité, mais vigilance requise : surveiller les cisaillements avec la masse d’air supérieure et les turbulences en crête',
      'Thermiques parfois puissants et étroits au printemps',
      'Brise de vallée en bas à Saint-Jean-de-la-Porte pouvant forcir à partir de 14h',
      'Zone de posé officielle bien dégagée mais attention aux lignes électriques en lisière'
    ],
    airspaceWarning: 'Proximité avec la TMA Chambéry et le couloir VFR hélicoptère / vol à voile Challes-les-Eaux.',
    webcamUrl: 'https://m.webcam-hd.com/savoie-grand-revard/belvedere',
    ffvlBeaconId: 'montlambert',
    accessInfo: "Monter par Saint-Jean-de-la-Porte vers le hameau de Montlambert. Parking aménagé, décollage à 5 min à pied par sentier balisé.",
    recommendedHours: '10h30 - 15h00',
    bestTimeSlots: [
      {
        period: "Créneau matinal fétiche",
        hours: "10h30 - 13h30",
        description: "Déclenchement très tôt plein Sud. Créneau idéal pour enrouler et s'extraire en cross avant que la brise de vallée ne s'installe.",
        isOptimal: true
      },
      {
        period: "Début d'après-midi",
        hours: "13h30 - 15h00",
        description: "Thermiques plus hachés sous l'action de la brise de Combe. Vigilance au gradient et aux rouleaux à l'atterrissage."
      }
    ]
  },
  {
    id: 'chamoux',
    name: 'Chamoux-sur-Gelon',
    subTitle: 'Le site école et thermique sécurisant des Alpes savoyardes',
    massif: 'Combe de Savoie',
    takeoffAlt: 1050,
    landingAlt: 300,
    elevationDiff: 750,
    finesseRequired: 4.2,
    orientations: ['W', 'WSW', 'SW', 'NW'],
    idealWindMin: 8,
    idealWindMax: 22,
    maxSafeGust: 28,
    lat: 45.5298,
    lng: 6.2201,
    landingLat: 45.5342,
    landingLng: 6.2085,
    level: 'Tous pilotes',
    types: ['École', 'Thermique', 'Soaring', 'Cross'],
    description: "Très apprécié pour son décollage herbeux large et son atterrissage immense en plaine. C'est un terrain de jeu exceptionnel pour la progression, les vols thermiques sereins et les transitions vers la Maurienne ou le Grand Arc.",
    aerologyTips: "Protégé du vent du Nord grâce à la crête. La brise de vallée de la Combe s'installe gentiment en face Ouest pour alimenter le décollage.",
    hazards: [
      'Gradient de vent possible à l’atterrissage en fin d’après-midi',
      'Présence de rapaces territoriaux au printemps sur les corniches'
    ],
    airspaceWarning: 'Espace aérien calme, respecter les règles de survol des zones habitées du village de Chamoux.',
    webcamUrl: 'https://m.webcam-hd.com/savoie-grand-revard/belvedere',
    ffvlBeaconId: 'chamoux',
    accessInfo: "Depuis Chamoux-sur-Gelon, suivre la D28 puis la petite route forestière jusqu'au parking du déco. Aire de pique-nique et tapis de gonflage.",
    recommendedHours: '13h00 - 19h30',
    bestTimeSlots: [
      {
        period: "Thermiques de vallée",
        hours: "13h30 - 16h30",
        description: "Thermiques réguliers et larges alimentés par la brise de la Combe de Savoie."
      },
      {
        period: "Vol calme & École",
        hours: "17h00 - 19h30",
        description: "Conditions calmes idéales pour progresser, poser au grand atterro herbeux et voler sereinement.",
        isOptimal: true
      }
    ]
  },
  {
    id: 'aiguebelette',
    name: "Aiguebelette - Le Banchet / L'Épine",
    subTitle: 'Vol majestueux au-dessus du lac couleur émeraude',
    massif: 'Avant-Pays Savoyard',
    takeoffAlt: 920,
    landingAlt: 420,
    elevationDiff: 500,
    finesseRequired: 4.6,
    orientations: ['W', 'WSW', 'SW'],
    idealWindMin: 10,
    idealWindMax: 24,
    maxSafeGust: 30,
    lat: 45.5412,
    lng: 5.7925,
    landingLat: 45.5510,
    landingLng: 5.8112,
    level: 'Tous pilotes',
    types: ['Soaring', 'Thermique', 'Restitution', 'Bocal'],
    description: "Un vol carte postale sur l'un des plus beaux lacs naturels de France. Le relief de la chaîne de l'Épine génère un dynamique doux en fin d'après-midi, avec une vue plongeante sur l'eau turquoise.",
    aerologyTips: "La brise de l'Avant-Pays savoyard s'engouffre contre la falaise. Soaring facile et laminaire quand la brise est bien calée d'Ouest.",
    hazards: [
      'Ne pas se laisser dériver derrière la crête dans le venturi ou les rouleaux de l’Épine',
      'Atterrissage du Marais ou Novalaise : repérer le vent au sol qui peut être différent du lac'
    ],
    airspaceWarning: 'Attention à la zone d’approche Ouest de l’aéroport de Chambéry en cas de dérive trop haute vers l’Est.',
    webcamUrl: 'https://www.webcam-autoroute.eu/fr/cam/123/a43-col-de-l-epine',
    ffvlBeaconId: 'aiguebelette',
    accessInfo: "Depuis Novalaise ou Nances, monter vers le col de l'Épine ou le Banchet. Sentier forestier balisé.",
    recommendedHours: '14h00 - 20h00',
    bestTimeSlots: [
      {
        period: "Thermiques sur l'Épine",
        hours: "14h00 - 16h30",
        description: "Thermiques le long de la crête forestière dominant le lac d'Aiguebelette."
      },
      {
        period: "Dynamique du soir sur le lac",
        hours: "16h30 - 20h00",
        description: "Soaring laminaire face au couchant sur l'eau émeraude du lac, douceur exceptionnelle.",
        isOptimal: true
      }
    ]
  },
  {
    id: 'belvedere-revard',
    name: 'Le Revard - Belvédère',
    subTitle: 'Le plongeon sur Aix-les-Bains et la baie de Mémard',
    massif: 'Bauges',
    takeoffAlt: 1530,
    landingAlt: 380,
    elevationDiff: 1150,
    finesseRequired: 5.2,
    orientations: ['W', 'NW', 'WSW'],
    idealWindMin: 8,
    idealWindMax: 22,
    maxSafeGust: 28,
    lat: 45.6821,
    lng: 5.9782,
    landingLat: 45.6890,
    landingLng: 5.9230,
    level: 'Pilote autonome',
    types: ['Thermique', 'Soaring', 'Cross', 'Rando-Vol'],
    description: "Départ mythique depuis la passerelle en verre du Revard. Plus de 1150 mètres de dénivelé direct jusqu'à la plaine d'Aix-les-Bains ou l'atterro de Pugny-Chatenod.",
    aerologyTips: "Très beau potentiel de dynamique et de thermique le long des falaises du Revard. Possibilité de rattraper le Sire et les crêtes des Bauges.",
    hazards: [
      'Grosse falaise en dessous, assurer un gonflage propre face voile',
      'Atterrissage de Pugny exigeant si brise forte'
    ],
    airspaceWarning: 'Proximité immédiate CTR Chambéry / Aix-les-Bains. Plafond limité en plaine.',
    webcamUrl: 'https://m.webcam-hd.com/savoie-grand-revard/belvedere',
    ffvlBeaconId: 'revard',
    accessInfo: "Accès direct en voiture jusqu'au parking du Belvédère du Revard. Décollage en contrebas du restaurant panoramique.",
    recommendedHours: '14h00 - 20h00',
    bestTimeSlots: [
      {
        period: "Thermique d'altitude",
        hours: "14h00 - 17h00",
        description: "Départ falaise à 1530m, gros potentiels de gain pour transiter vers le Sire et les crêtes des Bauges."
      },
      {
        period: "Vol du soir & Restitution",
        hours: "17h30 - 20h00",
        description: "Superbe descente de 1150m de dénivelé et dynamique apaisé le long des falaises du Revard.",
        isOptimal: true
      }
    ]
  }
];
