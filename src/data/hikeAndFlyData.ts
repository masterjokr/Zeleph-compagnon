import { HikeAndFlyTopo } from '../types';

export const ZELEPH_TOPOS: HikeAndFlyTopo[] = [
  {
    id: 'nivolet-pragondran',
    title: 'Croix du Nivolet par Pragondran',
    summit: 'Croix du Nivolet (1547m)',
    dPlus: 1097,
    distanceKm: 6.2,
    durationAscentMin: 135,
    startPoint: 'Atterrissage de Pragondran (450m)',
    landingSpot: 'Pragondran (450m) ou Buisson-Rond',
    finessePlan: 5.1,
    difficulty: 'Sportif',
    description: "La grande classique locale des Z'éléphants Volants ! L'ascension traverse les forêts de châtaigniers, longe le Pas de l'Échelle pour déboucher sous l'immense croix illuminant la cluse de Chambéry.",
    itinerary: [
      "Départ du parking de l'atterrissage de Pragondran",
      "Sentier balisé en direction de Vérel puis du Pas de l'Échelle",
      "Passage câblé sécurisé sous les barres calcaires",
      "Sortie sur le plateau sommital et crête jusqu'à la Croix du Nivolet",
      "Décollage herbeux au pied de la Croix (face Ouest / Sud-Ouest)"
    ],
    takeoffTip: "Décollage en falaise orienté Ouest. Attendre que la brise de vallée monte et s'installe face voile. Ne jamais décoller par vent d'Est !"
  },
  {
    id: 'peney-saint-jean',
    title: "Mont Peney par Saint-Jean d'Arvey",
    summit: 'Mont Peney (1356m)',
    dPlus: 760,
    distanceKm: 4.8,
    durationAscentMin: 95,
    startPoint: "Saint-Jean d'Arvey (595m)",
    landingSpot: 'Challes-les-Eaux ou Barby',
    finessePlan: 4.8,
    difficulty: 'Moyen',
    description: "Une vue imprenable sur le Mont Granier et la chaîne de Belledonne. L'ascension sous la falaise du Peney est ombragée et sauvage.",
    itinerary: [
      "Départ du chef-lieu de Saint-Jean d'Arvey",
      "Monter par le Passage de la Dorette",
      "Rejoindre le plateau sommital par les pelouses d'altitude",
      "Décollage sur la croupe herbeuse face Sud / Sud-Ouest"
    ],
    takeoffTip: "Orientation Sud-Ouest, propice aux thermiques matinaux. Repérer l'atterrissage à Barby ou Challes avant l'ascension."
  },
  {
    id: 'galoppaz',
    title: 'Pointe de la Galoppaz',
    summit: 'La Galoppaz (1681m)',
    dPlus: 690,
    distanceKm: 5.4,
    durationAscentMin: 85,
    startPoint: 'Col des Prés (1135m)',
    landingSpot: 'Thoiry ou Saint-Jean d’Arvey',
    finessePlan: 5.5,
    difficulty: 'Moyen',
    description: "L'un des plus beaux panoramas 360° du cœur des Bauges : vue sur le lac d'Annecy au Nord, le Mont Blanc à l'Est, et la combe de Savoie au Sud.",
    itinerary: [
      "Départ du Col des Prés",
      "Suivre la piste forestière puis le sentier d'alpage menant au col de la Galoppaz",
      "Arête herbeuse finale jusqu'à la croix sommitale",
      "Décollage facile dans les pentes sommitales herbeuses (Est, Sud ou Ouest selon brise)"
    ],
    takeoffTip: "Pentes herbeuses spacieuses permettant un étalement de voile aisé. Idéal pour un bivouac ou un vol au lever du soleil."
  },
  {
    id: 'revard-mouxy',
    title: 'Mont Revard par le Sentier de la Crémaillère',
    summit: 'Belvédère du Revard (1530m)',
    dPlus: 1120,
    distanceKm: 7.5,
    durationAscentMin: 140,
    startPoint: 'Gare inférieure de Mouxy (410m)',
    landingSpot: 'Mouxy Atterro FFVL (390m)',
    finessePlan: 5.0,
    difficulty: 'Sportif',
    description: "Historique sentier de l'ancien train à crémaillère qui montait les skieurs et vacanciers au Revard dès 1892. Une montée soutenue mais très régulière.",
    itinerary: [
      "Départ de la gare désaffectée de Mouxy",
      "Tracé régulier de l'ancienne voie de chemin de fer",
      "Passage sous les viaducs et tunnels d'époque",
      "Arrivée directe sous la passerelle panoramique du Revard",
      "Décollage Belvédère face au lac du Bourget"
    ],
    takeoffTip: "Finesse 5 requise pour rejoindre directement l'atterrissage de Mouxy sans moteur ni thermique."
  }
];
