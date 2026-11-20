import { getStoredData, setStoredData } from '../../utils/storage';

export interface RouteStop {
  id: string;
  name: string;
  type: 'start' | 'stop' | 'destination';
  lat?: number;
  lng?: number;
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  action: 'straight' | 'left' | 'right' | 'uturn' | 'arrive';
}

export interface RoadTripPlan {
  id: string;
  title: string;
  name?: string;
  origin: string;
  destination: string;
  stops: string[];
  totalDistanceKm: number;
  totalDurationHours: number;
  fuelEstimateInr: number;
  tollEstimateInr: number;
  suggestedHalts: { name: string; highlight: string; kmFromStart: number }[];
  steps: RouteStep[];
  createdAt: string;
}

const STORAGE_KEY = 'road_trips';

const PRESET_TRIPS: RoadTripPlan[] = [
  {
    id: 'delhi-manali-leh',
    title: 'Manali to Leh Highway Epic Trans-Himalayan Expedition',
    origin: 'New Delhi',
    destination: 'Leh (Ladakh)',
    stops: ['Chandigarh', 'Manali', 'Jispa', 'Sarchu'],
    totalDistanceKm: 1010,
    totalDurationHours: 26,
    fuelEstimateInr: 10500,
    tollEstimateInr: 1250,
    suggestedHalts: [
      { name: 'Murthal Haveli', highlight: 'Famous hot stuffed tandoori paranthas & white butter', kmFromStart: 50 },
      { name: 'Atal Tunnel North Portal', highlight: 'Engineering marvel bypassing Rohtang Pass', kmFromStart: 575 },
      { name: 'Deepak Tal (Jispa)', highlight: 'Crystal clear high mountain lake mirror reflection', kmFromStart: 640 },
      { name: 'Tanglang La Pass', highlight: 'Second highest motorable mountain pass at 17,480 ft', kmFromStart: 935 }
    ],
    steps: [
      { instruction: 'Head north on NH44 from Connaught Place toward Karnal/Ambala', distance: '240 km', duration: '4h 15m', action: 'straight' },
      { instruction: 'Take the exit toward Kiratpur Sahib onto NH205 expressway', distance: '85 km', duration: '1h 30m', action: 'right' },
      { instruction: 'Ascend Himalayan foothills via Bilaspur and Mandi on NH3', distance: '160 km', duration: '4h 45m', action: 'straight' },
      { instruction: 'Cross Atal Tunnel and enter the rugged Lahaul Valley', distance: '45 km', duration: '1h 10m', action: 'straight' },
      { instruction: 'Traverse Gata Loops (21 hairpin curves) toward Nakee La pass', distance: '75 km', duration: '2h 50m', action: 'left' },
      { instruction: 'Arrive in Leh Valley with view of Shanti Stupa', distance: '120 km', duration: '3h 30m', action: 'arrive' }
    ],
    createdAt: '2024-05-10'
  },
  {
    id: 'mumbai-goa-coastal',
    name: 'Mumbai to Goa Scenic Coastal Highway Road Trip',
    title: 'Mumbai to Goa Coastal NH66 Konkan Drive',
    origin: 'Mumbai',
    destination: 'Panaji (Goa)',
    stops: ['Kolad', 'Chiplun', 'Ratnagiri', 'Malvan'],
    totalDistanceKm: 585,
    totalDurationHours: 11,
    fuelEstimateInr: 6200,
    tollEstimateInr: 680,
    suggestedHalts: [
      { name: 'Chiplun Vashishti Viewpoint', highlight: 'Panoramic river valley and Konkan Alphonso stalls', kmFromStart: 250 },
      { name: 'Ratnagiri Thiba Palace', highlight: 'Historical exile home of Burmese king with sea views', kmFromStart: 340 },
      { name: 'Malvan Beach & Tarkarli', highlight: 'Fresh Malvani seafood and scuba coral waters', kmFromStart: 490 }
    ],
    steps: [
      { instruction: 'Exit Mumbai via Atal Setu (MTHL) toward Chirle and Pen', distance: '45 km', duration: '40m', action: 'straight' },
      { instruction: 'Merge onto NH66 four-lane Konkan coastal highway', distance: '180 km', duration: '3h 15m', action: 'straight' },
      { instruction: 'Descend through scenic Kashedi Ghat mountain bends', distance: '35 km', duration: '50m', action: 'right' },
      { instruction: 'Continue south past Sawantwadi wooden toy district', distance: '220 km', duration: '4h 10m', action: 'straight' },
      { instruction: 'Cross Goa border checkpost at Pernem and enter Panaji', distance: '55 km', duration: '1h 05m', action: 'arrive' }
    ],
    createdAt: '2024-06-18'
  }
];

export const roadTripService = {
  async getSavedTrips(): Promise<RoadTripPlan[]> {
    return getStoredData<RoadTripPlan[]>(STORAGE_KEY, PRESET_TRIPS);
  },

  async calculateTrip(params: {
    origin: string;
    destination: string;
    stops: string[];
    fuelPricePerLitre?: number;
    mileageKmPerLitre?: number;
  }): Promise<RoadTripPlan> {
    const fuelPrice = params.fuelPricePerLitre || 102;
    const mileage = params.mileageKmPerLitre || 14;

    // Estimate realistic distance based on stops and strings
    const baseKm = Math.max(120, (params.origin.length + params.destination.length) * 18);
    const stopBonus = params.stops.length * 90;
    const totalKm = baseKm + stopBonus;
    const totalHours = Math.round((totalKm / 48) * 10) / 10;
    const fuelCost = Math.round((totalKm / mileage) * fuelPrice);
    const tollCost = Math.round(totalKm * 1.15);

    const plan: RoadTripPlan = {
      id: `trip-${Date.now()}`,
      title: `${params.origin} to ${params.destination} Custom Journey`,
      origin: params.origin,
      destination: params.destination,
      stops: params.stops,
      totalDistanceKm: totalKm,
      totalDurationHours: totalHours,
      fuelEstimateInr: fuelCost,
      tollEstimateInr: tollCost,
      suggestedHalts: [
        { name: `${params.origin} Gateway Highway Oasis`, highlight: 'Clean restrooms, fuel & food court', kmFromStart: Math.round(totalKm * 0.25) },
        { name: 'Midway Scenic Vantage', highlight: 'Local cuisine, artisan stalls & tea break', kmFromStart: Math.round(totalKm * 0.55) },
        { name: `${params.destination} Entry Pass Overlook`, highlight: 'Photo point & arrival briefing', kmFromStart: Math.round(totalKm * 0.88) }
      ],
      steps: [
        { instruction: `Start from ${params.origin} towards main arterial ring expressway`, distance: `${Math.round(totalKm * 0.15)} km`, duration: `${Math.round(totalHours * 0.15 * 60)}m`, action: 'straight' },
        ...params.stops.map((stop, i) => ({
          instruction: `Follow connecting highway to waypoint: ${stop}`,
          distance: `${Math.round(totalKm * 0.2)} km`,
          duration: `${Math.round(totalHours * 0.2 * 60)}m`,
          action: (i % 2 === 0 ? 'left' : 'right') as RouteStep['action']
        })),
        { instruction: `Merge onto destination approach road for ${params.destination}`, distance: `${Math.round(totalKm * 0.25)} km`, duration: `${Math.round(totalHours * 0.25 * 60)}m`, action: 'straight' },
        { instruction: `Arrive at center of ${params.destination}. Welcome!`, distance: '0 km', duration: '0m', action: 'arrive' }
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };

    return plan;
  },

  async saveTrip(trip: RoadTripPlan): Promise<void> {
    const list = await this.getSavedTrips();
    const updated = [trip, ...list.filter((t) => t.id !== trip.id)];
    setStoredData(STORAGE_KEY, updated);
  }
};

