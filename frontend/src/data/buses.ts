export interface BusSeat {
  id: string;
  number: string;
  deck: 'lower' | 'upper';
  type: 'sleeper' | 'seater';
  price: number;
  isBooked: boolean;
  isLadies?: boolean;
}

export interface Bus {
  id: string;
  operator: string;
  busType: string;
  ac: boolean;
  seaterSleeper: 'seater' | 'sleeper' | 'semi-sleeper';
  from: { city: string; boardingPoints: { name: string; time: string }[] };
  to: { city: string; droppingPoints: { name: string; time: string }[] };
  departureTime: string;
  arrivalTime: string;
  duration: string;
  amenities: string[];
  totalSeats: number;
  availableSeats: number;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  liveTracking: boolean;
  seats: BusSeat[];
}

export const buses: Bus[] = [
  {
    id: 'bus-vrl-volvo',
    operator: 'VRL Travels',
    busType: 'Volvo Multi-Axle I-Shift A/C Sleeper (2+1)',
    ac: true,
    seaterSleeper: 'sleeper',
    from: {
      city: 'Bengaluru',
      boardingPoints: [
        { name: 'Majestic Anand Rao Circle', time: '21:00' },
        { name: 'Yeshwantpur Govardhan', time: '21:30' },
        { name: 'Navrang Circle', time: '21:45' }
      ]
    },
    to: {
      city: 'Goa (Panaji)',
      droppingPoints: [
        { name: 'Mapusa Court Circle', time: '07:30' },
        { name: 'Panaji KTC Bus Stand', time: '08:15' }
      ]
    },
    departureTime: '21:00',
    arrivalTime: '08:15',
    duration: '11h 15m',
    amenities: ['Charging Point', 'Blanket & Pillow', 'Reading Light', 'Emergency Exit', 'Water Bottle', 'Track My Bus GPS'],
    totalSeats: 36,
    availableSeats: 12,
    price: 1450,
    originalPrice: 1700,
    rating: 4.7,
    reviews: 1420,
    liveTracking: true,
    seats: [
      { id: 'L1', number: '1', deck: 'lower', type: 'sleeper', price: 1450, isBooked: false },
      { id: 'L2', number: '2', deck: 'lower', type: 'sleeper', price: 1450, isBooked: true },
      { id: 'L3', number: '3', deck: 'lower', type: 'sleeper', price: 1450, isBooked: false },
      { id: 'L4', number: '4', deck: 'lower', type: 'sleeper', price: 1450, isBooked: false, isLadies: true },
      { id: 'U1', number: 'U1', deck: 'upper', type: 'sleeper', price: 1450, isBooked: false },
      { id: 'U2', number: 'U2', deck: 'upper', type: 'sleeper', price: 1450, isBooked: true },
      { id: 'U3', number: 'U3', deck: 'upper', type: 'sleeper', price: 1450, isBooked: false },
      { id: 'U4', number: 'U4', deck: 'upper', type: 'sleeper', price: 1450, isBooked: false }
    ]
  },
  {
    id: 'bus-zingbus-delhi-manali',
    operator: 'Zingbus Plus',
    busType: 'Scania AC Diamond Seater (2+2)',
    ac: true,
    seaterSleeper: 'seater',
    from: {
      city: 'New Delhi',
      boardingPoints: [
        { name: 'Kashmere Gate Metro Station Gate 1', time: '19:30' },
        { name: 'Majnu Ka Tilla', time: '20:00' }
      ]
    },
    to: {
      city: 'Manali',
      droppingPoints: [
        { name: 'Kullu Bypass', time: '08:30' },
        { name: 'Private Bus Parking Manali', time: '09:45' }
      ]
    },
    departureTime: '19:30',
    arrivalTime: '09:45',
    duration: '14h 15m',
    amenities: ['Individual USB Charging', 'Complimentary Snack Box', 'Sanitized Interiors', 'Live GPS Tracking'],
    totalSeats: 44,
    availableSeats: 16,
    price: 1199,
    originalPrice: 1499,
    rating: 4.8,
    reviews: 2150,
    liveTracking: true,
    seats: [
      { id: 'S1', number: '1A', deck: 'lower', type: 'seater', price: 1199, isBooked: false },
      { id: 'S2', number: '1B', deck: 'lower', type: 'seater', price: 1199, isBooked: true },
      { id: 'S3', number: '2A', deck: 'lower', type: 'seater', price: 1199, isBooked: false },
      { id: 'S4', number: '2B', deck: 'lower', type: 'seater', price: 1199, isBooked: false }
    ]
  },
  {
    id: 'bus-intercity-mumbai-pune',
    operator: 'Neeta Tours & Travels',
    busType: 'Mercedes Benz Multi-Axle AC Semi-Sleeper',
    ac: true,
    seaterSleeper: 'semi-sleeper',
    from: {
      city: 'Mumbai',
      boardingPoints: [
        { name: 'Borivali West Gokul Hotel', time: '07:00' },
        { name: 'Dadar Asiad Bus Stand', time: '07:45' },
        { name: 'Vashi Plaza', time: '08:30' }
      ]
    },
    to: {
      city: 'Pune',
      droppingPoints: [
        { name: 'Wakad Bridge', time: '11:15' },
        { name: 'Shivajinagar Station', time: '11:45' }
      ]
    },
    departureTime: '07:00',
    arrivalTime: '11:45',
    duration: '4h 45m',
    amenities: ['Reclining Seats', 'AC', 'Newspaper', 'Water Bottle'],
    totalSeats: 40,
    availableSeats: 18,
    price: 450,
    originalPrice: 550,
    rating: 4.5,
    reviews: 980,
    liveTracking: true,
    seats: [
      { id: 'NP1', number: 'A1', deck: 'lower', type: 'seater', price: 450, isBooked: false },
      { id: 'NP2', number: 'A2', deck: 'lower', type: 'seater', price: 450, isBooked: false }
    ]
  },
  {
    id: 'bus-orange-hyderabad-chennai',
    operator: 'Orange Tours & Travels',
    busType: 'Bharat Benz AC Sleeper (2+1)',
    ac: true,
    seaterSleeper: 'sleeper',
    from: {
      city: 'Hyderabad',
      boardingPoints: [
        { name: 'Ameerpet Big Bazaar', time: '20:15' },
        { name: 'Gachibowli Outer Ring Road', time: '21:00' }
      ]
    },
    to: {
      city: 'Chennai',
      droppingPoints: [
        { name: 'Koyambedu Bus Stand', time: '07:00' },
        { name: 'Guindy Flyover', time: '07:30' }
      ]
    },
    departureTime: '20:15',
    arrivalTime: '07:30',
    duration: '11h 15m',
    amenities: ['WiFi', 'Clean Bedding', 'Water', 'Reading Lamp'],
    totalSeats: 30,
    availableSeats: 7,
    price: 1350,
    originalPrice: 1600,
    rating: 4.6,
    reviews: 1340,
    liveTracking: true,
    seats: [
      { id: 'OH1', number: '1L', deck: 'lower', type: 'sleeper', price: 1350, isBooked: false }
    ]
  }
];

export const busCities = [
  'New Delhi', 'Manali', 'Mumbai', 'Pune', 'Bengaluru', 'Goa (Panaji)',
  'Hyderabad', 'Chennai', 'Jaipur', 'Agra', 'Shimla', 'Rishikesh'
];

