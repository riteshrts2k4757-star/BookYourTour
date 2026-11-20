export interface TrainClass {
  type: string;
  name: string;
  fare: number;
  available: number;
  status: 'AVAILABLE' | 'RAC' | 'WL';
}

export interface TrainStationStop {
  station: string;
  code: string;
  arrival: string;
  departure: string;
  day: number;
  distance: string;
}

export interface Train {
  id: string;
  name: string;
  number: string;
  from: { station: string; code: string };
  to: { station: string; code: string };
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runningDays: string[];
  classes: TrainClass[];
  stops: TrainStationStop[];
  distance: string;
  pantry: boolean;
}

export const trains: Train[] = [
  {
    id: 'tr-22436',
    name: 'Vande Bharat Express',
    number: '22436',
    from: { station: 'New Delhi', code: 'NDLS' },
    to: { station: 'Varanasi Junction', code: 'BSB' },
    departureTime: '06:00',
    arrivalTime: '14:00',
    duration: '8h 00m',
    runningDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    classes: [
      { type: 'CC', name: 'AC Chair Car', fare: 1750, available: 42, status: 'AVAILABLE' },
      { type: 'EC', name: 'Exec Chair Car', fare: 3300, available: 14, status: 'AVAILABLE' }
    ],
    stops: [
      { station: 'New Delhi', code: 'NDLS', arrival: 'Start', departure: '06:00', day: 1, distance: '0 km' },
      { station: 'Kanpur Central', code: 'CNB', arrival: '10:08', departure: '10:10', day: 1, distance: '440 km' },
      { station: 'Prayagraj Jn', code: 'PRYJ', arrival: '12:08', departure: '12:10', day: 1, distance: '635 km' },
      { station: 'Varanasi Jn', code: 'BSB', arrival: '14:00', departure: 'End', day: 1, distance: '759 km' }
    ],
    distance: '759 km',
    pantry: true
  },
  {
    id: 'tr-12952',
    name: 'Mumbai Rajdhani Express',
    number: '12952',
    from: { station: 'New Delhi', code: 'NDLS' },
    to: { station: 'Mumbai Central', code: 'MMCT' },
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: [
      { type: '3A', name: 'AC 3 Tier', fare: 2450, available: 18, status: 'AVAILABLE' },
      { type: '2A', name: 'AC 2 Tier', fare: 3620, available: 8, status: 'AVAILABLE' },
      { type: '1A', name: 'AC First Class', fare: 5280, available: 3, status: 'AVAILABLE' }
    ],
    stops: [
      { station: 'New Delhi', code: 'NDLS', arrival: 'Start', departure: '16:55', day: 1, distance: '0 km' },
      { station: 'Kota Jn', code: 'KOTA', arrival: '21:30', departure: '21:40', day: 1, distance: '465 km' },
      { station: 'Vadodara Jn', code: 'BRC', arrival: '03:40', departure: '03:50', day: 2, distance: '992 km' },
      { station: 'Surat', code: 'ST', arrival: '05:13', departure: '05:18', day: 2, distance: '1122 km' },
      { station: 'Mumbai Central', code: 'MMCT', arrival: '08:35', departure: 'End', day: 2, distance: '1384 km' }
    ],
    distance: '1384 km',
    pantry: true
  },
  {
    id: 'tr-12002',
    name: 'Bhopal Shatabdi Express',
    number: '12002',
    from: { station: 'New Delhi', code: 'NDLS' },
    to: { station: 'Agra Cantt', code: 'AGC' },
    departureTime: '06:00',
    arrivalTime: '07:50',
    duration: '1h 50m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: [
      { type: 'CC', name: 'AC Chair Car', fare: 755, available: 65, status: 'AVAILABLE' },
      { type: 'EC', name: 'Exec Chair Car', fare: 1495, available: 16, status: 'AVAILABLE' }
    ],
    stops: [
      { station: 'New Delhi', code: 'NDLS', arrival: 'Start', departure: '06:00', day: 1, distance: '0 km' },
      { station: 'Mathura Jn', code: 'MTJ', arrival: '07:19', departure: '07:20', day: 1, distance: '141 km' },
      { station: 'Agra Cantt', code: 'AGC', arrival: '07:50', departure: '07:55', day: 1, distance: '195 km' }
    ],
    distance: '195 km',
    pantry: true
  },
  {
    id: 'tr-20608',
    name: 'Mysuru - Chennai Vande Bharat',
    number: '20608',
    from: { station: 'KSR Bengaluru', code: 'SBC' },
    to: { station: 'MGR Chennai Central', code: 'MAS' },
    departureTime: '14:50',
    arrivalTime: '19:20',
    duration: '4h 30m',
    runningDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: [
      { type: 'CC', name: 'AC Chair Car', fare: 995, available: 32, status: 'AVAILABLE' },
      { type: 'EC', name: 'Exec Chair Car', fare: 1885, available: 9, status: 'AVAILABLE' }
    ],
    stops: [
      { station: 'KSR Bengaluru', code: 'SBC', arrival: 'Start', departure: '14:50', day: 1, distance: '0 km' },
      { station: 'Katpadi Jn', code: 'KPD', arrival: '17:33', departure: '17:35', day: 1, distance: '228 km' },
      { station: 'MGR Chennai Central', code: 'MAS', arrival: '19:20', departure: 'End', day: 1, distance: '358 km' }
    ],
    distance: '358 km',
    pantry: true
  },
  {
    id: 'tr-12051',
    name: 'Jan Shatabdi Express',
    number: '12051',
    from: { station: 'CSMT Mumbai', code: 'CSMT' },
    to: { station: 'Madgaon (Goa)', code: 'MAO' },
    departureTime: '05:10',
    arrivalTime: '14:10',
    duration: '9h 00m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: [
      { type: '2S', name: 'Second Seating', fare: 320, available: 85, status: 'AVAILABLE' },
      { type: 'CC', name: 'AC Chair Car', fare: 1105, available: 22, status: 'AVAILABLE' },
      { type: 'EV', name: 'Vistadome AC', fare: 2490, available: 6, status: 'AVAILABLE' }
    ],
    stops: [
      { station: 'CSMT Mumbai', code: 'CSMT', arrival: 'Start', departure: '05:10', day: 1, distance: '0 km' },
      { station: 'Thane', code: 'TNA', arrival: '05:48', departure: '05:50', day: 1, distance: '34 km' },
      { station: 'Panvel', code: 'PNVL', arrival: '06:23', departure: '06:25', day: 1, distance: '69 km' },
      { station: 'Ratnagiri', code: 'RN', arrival: '10:40', departure: '10:45', day: 1, distance: '350 km' },
      { station: 'Madgaon', code: 'MAO', arrival: '14:10', departure: 'End', day: 1, distance: '581 km' }
    ],
    distance: '581 km',
    pantry: true
  }
];

export const railwayStations = [
  { name: 'New Delhi', code: 'NDLS' },
  { name: 'Mumbai Central', code: 'MMCT' },
  { name: 'CSMT Mumbai', code: 'CSMT' },
  { name: 'Varanasi Jn', code: 'BSB' },
  { name: 'Agra Cantt', code: 'AGC' },
  { name: 'KSR Bengaluru', code: 'SBC' },
  { name: 'MGR Chennai Central', code: 'MAS' },
  { name: 'Madgaon (Goa)', code: 'MAO' },
  { name: 'Jaipur Jn', code: 'JP' },
  { name: 'Howrah Jn (Kolkata)', code: 'HWH' }
];

