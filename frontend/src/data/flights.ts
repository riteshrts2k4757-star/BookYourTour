export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo: string;
  flightNumber: string;
  from: { city: string; code: string; airport: string; terminal: string };
  to: { city: string; code: string; airport: string; terminal: string };
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopDetails?: string[];
  travelClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  price: number;
  originalPrice?: number;
  baggage: { cabin: string; checkin: string };
  refundable: boolean;
  mealsIncluded: boolean;
  seatsLeft: number;
}

export const flights: Flight[] = [
  {
    id: 'fl-6e-2041',
    airline: 'IndiGo',
    airlineCode: '6E',
    airlineLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80',
    flightNumber: '6E-2041',
    from: { city: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport', terminal: 'T3' },
    to: { city: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International', terminal: 'T2' },
    departureTime: '06:00',
    arrivalTime: '08:15',
    duration: '2h 15m',
    stops: 0,
    travelClass: 'Economy',
    price: 4899,
    originalPrice: 5999,
    baggage: { cabin: '7 kg', checkin: '15 kg' },
    refundable: false,
    mealsIncluded: false,
    seatsLeft: 9
  },
  {
    id: 'fl-ai-805',
    airline: 'Air India',
    airlineCode: 'AI',
    airlineLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'AI-805',
    from: { city: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport', terminal: 'T3' },
    to: { city: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International', terminal: 'T2' },
    departureTime: '08:30',
    arrivalTime: '10:50',
    duration: '2h 20m',
    stops: 0,
    travelClass: 'Economy',
    price: 5450,
    originalPrice: 6200,
    baggage: { cabin: '7 kg', checkin: '25 kg' },
    refundable: true,
    mealsIncluded: true,
    seatsLeft: 4
  },
  {
    id: 'fl-uk-995',
    airline: 'Vistara',
    airlineCode: 'UK',
    airlineLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'UK-995',
    from: { city: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport', terminal: 'T3' },
    to: { city: 'Bengaluru', code: 'BLR', airport: 'Kempegowda International Airport', terminal: 'T2' },
    departureTime: '09:45',
    arrivalTime: '12:35',
    duration: '2h 50m',
    stops: 0,
    travelClass: 'Economy',
    price: 6100,
    originalPrice: 7200,
    baggage: { cabin: '7 kg', checkin: '20 kg' },
    refundable: true,
    mealsIncluded: true,
    seatsLeft: 6
  },
  {
    id: 'fl-qp-1304',
    airline: 'Akasa Air',
    airlineCode: 'QP',
    airlineLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'QP-1304',
    from: { city: 'Bengaluru', code: 'BLR', airport: 'Kempegowda International Airport', terminal: 'T1' },
    to: { city: 'Goa (Mopa)', code: 'GOX', airport: 'Manohar International Airport', terminal: 'T1' },
    departureTime: '11:15',
    arrivalTime: '12:30',
    duration: '1h 15m',
    stops: 0,
    travelClass: 'Economy',
    price: 3200,
    originalPrice: 4100,
    baggage: { cabin: '7 kg', checkin: '15 kg' },
    refundable: false,
    mealsIncluded: false,
    seatsLeft: 12
  },
  {
    id: 'fl-6e-512',
    airline: 'IndiGo',
    airlineCode: '6E',
    airlineLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80',
    flightNumber: '6E-512',
    from: { city: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International', terminal: 'T1' },
    to: { city: 'Goa (Dabolim)', code: 'GOI', airport: 'Dabolim International Airport', terminal: 'T1' },
    departureTime: '14:20',
    arrivalTime: '15:35',
    duration: '1h 15m',
    stops: 0,
    travelClass: 'Economy',
    price: 3850,
    originalPrice: 4600,
    baggage: { cabin: '7 kg', checkin: '15 kg' },
    refundable: false,
    mealsIncluded: false,
    seatsLeft: 8
  },
  {
    id: 'fl-sg-219',
    airline: 'SpiceJet',
    airlineCode: 'SG',
    airlineLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'SG-219',
    from: { city: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport', terminal: 'T1' },
    to: { city: 'Srinagar', code: 'SXR', airport: 'Sheikh ul-Alam International Airport', terminal: 'T1' },
    departureTime: '07:10',
    arrivalTime: '08:45',
    duration: '1h 35m',
    stops: 0,
    travelClass: 'Economy',
    price: 5200,
    originalPrice: 6500,
    baggage: { cabin: '7 kg', checkin: '15 kg' },
    refundable: true,
    mealsIncluded: false,
    seatsLeft: 5
  },
  {
    id: 'fl-ai-678',
    airline: 'Air India',
    airlineCode: 'AI',
    airlineLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'AI-678',
    from: { city: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport', terminal: 'T3' },
    to: { city: 'Kochi', code: 'COK', airport: 'Cochin International Airport', terminal: 'T3' },
    departureTime: '17:40',
    arrivalTime: '21:00',
    duration: '3h 20m',
    stops: 0,
    travelClass: 'Economy',
    price: 6890,
    originalPrice: 8100,
    baggage: { cabin: '7 kg', checkin: '25 kg' },
    refundable: true,
    mealsIncluded: true,
    seatsLeft: 7
  },
  {
    id: 'fl-uk-812-biz',
    airline: 'Vistara',
    airlineCode: 'UK',
    airlineLogo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80',
    flightNumber: 'UK-812',
    from: { city: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport', terminal: 'T3' },
    to: { city: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International', terminal: 'T2' },
    departureTime: '19:15',
    arrivalTime: '21:30',
    duration: '2h 15m',
    stops: 0,
    travelClass: 'Business',
    price: 18900,
    originalPrice: 22500,
    baggage: { cabin: '12 kg', checkin: '35 kg' },
    refundable: true,
    mealsIncluded: true,
    seatsLeft: 3
  }
];

export const airportList = [
  { city: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport' },
  { city: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International' },
  { city: 'Bengaluru', code: 'BLR', airport: 'Kempegowda International Airport' },
  { city: 'Goa', code: 'GOI', airport: 'Dabolim / Mopa International Airport' },
  { city: 'Kolkata', code: 'CCU', airport: 'Netaji Subhash Chandra Bose Airport' },
  { city: 'Hyderabad', code: 'HYD', airport: 'Rajiv Gandhi International Airport' },
  { city: 'Chennai', code: 'MAA', airport: 'Chennai International Airport' },
  { city: 'Kochi', code: 'COK', airport: 'Cochin International Airport' },
  { city: 'Srinagar', code: 'SXR', airport: 'Sheikh ul-Alam International Airport' },
  { city: 'Jaipur', code: 'JAI', airport: 'Jaipur International Airport' }
];

