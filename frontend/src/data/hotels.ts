export interface HotelRoom {
  id: string;
  name: string;
  type: string;
  price: number;
  originalPrice?: number;
  capacity: number;
  beds: string;
  size: string;
  amenities: string[];
  available: number;
  image: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  type: 'hotel' | 'resort' | 'villa' | 'apartment' | 'homestay' | 'guesthouse' | 'hostel' | 'luxury';
  city: string;
  state: string;
  address: string;
  coordinates: [number, number];
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  amenities: string[];
  rooms: HotelRoom[];
  checkIn: string;
  checkOut: string;
  cancellation: string;
  featured: boolean;
  nearbyAttractions: { name: string; distance: string }[];
  policies: string[];
}

export const hotels: Hotel[] = [
  {
    id: 'rambagh-palace-jaipur',
    name: 'Rambagh Palace Heritage & Luxury',
    slug: 'rambagh-palace-heritage-luxury',
    type: 'luxury',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Bhawani Singh Road, Jaipur, Rajasthan 302005',
    coordinates: [75.8077, 26.8953],
    ratingsAverage: 4.9,
    ratingsQuantity: 420,
    price: 18500,
    originalPrice: 22000,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Former residence of the Maharaja of Jaipur, offering manicured Mughal gardens, royal suites, signature royal Jiva spa, and peacocks strolling across palatial lawns.',
    amenities: ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Luxury Jiva Spa', 'Heritage Dining', 'Valet Parking', 'Airport Shuttle', 'Bar & Lounge'],
    rooms: [
      {
        id: 'palace-room',
        name: 'Palace Garden View Room',
        type: 'Deluxe',
        price: 18500,
        originalPrice: 22000,
        capacity: 2,
        beds: '1 Royal King Bed',
        size: '550 sq.ft',
        amenities: ['Mughal Garden View', 'Marble Bath', 'Free Breakfast', 'Smart TV'],
        available: 4,
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'royal-suite',
        name: 'Maharaja Heritage Suite',
        type: 'Suite',
        price: 36000,
        originalPrice: 42000,
        capacity: 3,
        beds: '1 Grand King + Living Area',
        size: '1100 sq.ft',
        amenities: ['Private Butler', 'Jacuzzi', 'Terrace View', 'Champagne Breakfast'],
        available: 2,
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '14:00',
    checkOut: '12:00',
    cancellation: 'Free cancellation up to 48 hours before check-in',
    featured: true,
    nearbyAttractions: [
      { name: 'Albert Hall Museum', distance: '2.5 km' },
      { name: 'City Palace', distance: '4.8 km' },
      { name: 'Hawa Mahal', distance: '5.1 km' }
    ],
    policies: ['Valid government photo ID required', 'Pets not permitted', 'Couples welcome']
  },
  {
    id: 'taj-exotica-goa',
    name: 'Taj Exotica Beach Resort & Spa',
    slug: 'taj-exotica-beach-resort-spa',
    type: 'resort',
    city: 'Benaulim',
    state: 'Goa',
    address: 'Calwaddo, Benaulim, Salcete, Goa 403716',
    coordinates: [73.9234, 15.2536],
    ratingsAverage: 4.8,
    ratingsQuantity: 388,
    price: 14200,
    originalPrice: 17500,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Mediterranean-style coastal resort spread across 56 acres of lush gardens with private beach access, nine-hole golf course, and beachfront seafood shacks.',
    amenities: ['Private Beachfront', 'Outdoor Infinity Pool', 'Golf Course', 'Tennis Courts', 'Kids Activity Club', 'Ayurvedic Spa'],
    rooms: [
      {
        id: 'sea-view-villa',
        name: 'Plunge Pool Garden Villa',
        type: 'Villa',
        price: 14200,
        originalPrice: 17500,
        capacity: 2,
        beds: '1 King Bed',
        size: '610 sq.ft',
        amenities: ['Private Plunge Pool', 'Verandah', 'Free Breakfast', 'Ocean Breeze'],
        available: 5,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'deluxe-sea-view',
        name: 'Sunset Sea View Room',
        type: 'Deluxe',
        price: 19800,
        originalPrice: 24000,
        capacity: 3,
        beds: '1 King Bed + Daybed',
        size: '720 sq.ft',
        amenities: ['Direct Ocean Sunset View', 'Balcony', 'Deep Soaking Tub'],
        available: 3,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '15:00',
    checkOut: '12:00',
    cancellation: 'Free cancellation up to 72 hours before arrival',
    featured: true,
    nearbyAttractions: [
      { name: 'Benaulim Beach', distance: '0.1 km' },
      { name: 'Colva Beach', distance: '3.2 km' },
      { name: 'Cabo de Rama Fort', distance: '22 km' }
    ],
    policies: ['Children of all ages welcome', 'Smoking in designated beach zones only']
  },
  {
    id: 'kumarakom-lake-resort',
    name: 'Kumarakom Lake Resort & Heritage Villas',
    slug: 'kumarakom-lake-resort-heritage-villas',
    type: 'resort',
    city: 'Kumarakom',
    state: 'Kerala',
    address: 'Vembanad Lake, Kumarakom, Kottayam, Kerala 686566',
    coordinates: [76.4312, 9.6174],
    ratingsAverage: 4.9,
    ratingsQuantity: 310,
    price: 16500,
    originalPrice: 19000,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Nestled on the serene banks of Lake Vembanad. Reconstructed 16th-century traditional Kerala heritage homesteads with meandering swimming pool and private lake cruise docks.',
    amenities: ['Meandering Pool', 'Ayurmana Spa', 'Sunset Lake Cruise', 'Seafood Bar', 'Yoga Pavilion', 'Cultural Shows'],
    rooms: [
      {
        id: 'heritage-lake-villa',
        name: 'Heritage Villa with Private Pool',
        type: 'Villa',
        price: 16500,
        originalPrice: 19000,
        capacity: 2,
        beds: '1 Four-Poster King Bed',
        size: '650 sq.ft',
        amenities: ['Open-air Courtyard Shower', 'Private Plunge Pool', 'Lake Breeze'],
        available: 3,
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '14:00',
    checkOut: '11:00',
    cancellation: 'Free cancellation up to 5 days prior to check-in',
    featured: true,
    nearbyAttractions: [
      { name: 'Kumarakom Bird Sanctuary', distance: '2 km' },
      { name: 'Vembanad Lake Boating', distance: '0.1 km' }
    ],
    policies: ['Eco-sensitive plastic-free resort', 'Fishing gear available on request']
  },
  {
    id: 'wildflower-hall-shimla',
    name: 'Wildflower Hall, An Oberoi Resort',
    slug: 'wildflower-hall-oberoi-resort-shimla',
    type: 'resort',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    address: 'Chharabra, Shimla, Himachal Pradesh 171012',
    coordinates: [77.2415, 31.1192],
    ratingsAverage: 4.9,
    ratingsQuantity: 275,
    price: 21000,
    originalPrice: 25000,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Set at 8,250 feet amidst 22 acres of dense cedar and pine forests. Boasts a heated outdoor whirlpool with panoramic snow peak vistas and grand colonial architecture.',
    amenities: ['Heated Outdoor Whirlpool', 'Indoor Heated Pool', 'Cedar Forest Trekking', 'Observatory', 'Library Lounge', 'Mountain Spa'],
    rooms: [
      {
        id: 'mountain-deluxe',
        name: 'Premier Mountain View Room',
        type: 'Deluxe',
        price: 21000,
        originalPrice: 25000,
        capacity: 2,
        beds: '1 King Bed',
        size: '600 sq.ft',
        amenities: ['Snow Peak Himalayan View', 'Fireplace Heater', 'Marble Bath'],
        available: 4,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '14:00',
    checkOut: '12:00',
    cancellation: 'Free cancellation up to 7 days before check-in',
    featured: true,
    nearbyAttractions: [
      { name: 'Kufri Snow Point', distance: '6 km' },
      { name: 'The Mall Road Shimla', distance: '13 km' },
      { name: 'Jakhu Temple', distance: '11 km' }
    ],
    policies: ['Heated rooms with electric blankets', 'Nature walks guided by in-house naturalist']
  },
  {
    id: 'leela-palace-udaipur',
    name: 'The Leela Palace Udaipur on Lake Pichola',
    slug: 'the-leela-palace-udaipur-lake-pichola',
    type: 'luxury',
    city: 'Udaipur',
    state: 'Rajasthan',
    address: 'Lake Pichola, Udaipur, Rajasthan 313001',
    coordinates: [73.6781, 24.5779],
    ratingsAverage: 4.9,
    ratingsQuantity: 512,
    price: 24500,
    originalPrice: 29000,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Arrive by fairy-tale boat across Lake Pichola. Breathtaking views of the Aravalli hills, City Palace, and Jag Mandir with world-class Mewari hospitality.',
    amenities: ['Private Boat Arrival', 'Lakeside Pool', 'ESPA Wellness Spa', 'Sheesh Mahal Dining', 'Astrology Session', 'Folk Music Courtyard'],
    rooms: [
      {
        id: 'lake-view-room',
        name: 'Grand Heritage Lake View',
        type: 'Deluxe',
        price: 24500,
        originalPrice: 29000,
        capacity: 2,
        beds: '1 King Bed',
        size: '580 sq.ft',
        amenities: ['Full Lake Pichola View', 'Balcony', 'Breakfast on boat option'],
        available: 3,
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '14:00',
    checkOut: '12:00',
    cancellation: 'Free cancellation up to 48 hours prior to arrival',
    featured: true,
    nearbyAttractions: [
      { name: 'Jagdish Temple', distance: '1.2 km' },
      { name: 'City Palace', distance: '1.5 km' },
      { name: 'Bagore Ki Haveli', distance: '0.8 km' }
    ],
    policies: ['Private boat transfer included with room reservation']
  },
  {
    id: 'ananda-in-the-himalayas',
    name: 'Ananda in the Himalayas Wellness Retreat',
    slug: 'ananda-in-the-himalayas-wellness-retreat',
    type: 'resort',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    address: 'The Palace Estate, Narendra Nagar, Tehri Garhwal, Uttarakhand 249175',
    coordinates: [78.2915, 30.1584],
    ratingsAverage: 4.8,
    ratingsQuantity: 198,
    price: 28000,
    originalPrice: 32000,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'World-renowned wellness retreat located on a 100-acre Maharaja palace estate overlooking Rishikesh and the holy Ganges valley. Traditional Ayurveda, Yoga, and Vedanta.',
    amenities: ['Award-winning 25,000 sq ft Spa', 'Daily Yoga & Meditation', 'Organic Cuisine', 'Golf Course', 'Heated Lap Pool', 'Vedanta Talks'],
    rooms: [
      {
        id: 'valley-view-deluxe',
        name: 'Palace Valley View Deluxe',
        type: 'Deluxe',
        price: 28000,
        originalPrice: 32000,
        capacity: 2,
        beds: '1 King Bed',
        size: '520 sq.ft',
        amenities: ['Valley View Balcony', 'Kurta Pajamas Provided', 'Organic Bath Amenities'],
        available: 3,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '14:00',
    checkOut: '11:00',
    cancellation: 'Free cancellation up to 7 days before check-in',
    featured: false,
    nearbyAttractions: [
      { name: 'Triveni Ghat, Rishikesh', distance: '16 km' },
      { name: 'Laxman Jhula', distance: '18 km' },
      { name: 'Beatles Ashram', distance: '20 km' }
    ],
    policies: ['Children below 14 not accommodated to preserve tranquil environment']
  },
  {
    id: 'suryagarh-jaisalmer',
    name: 'Suryagarh Fortress & Desert Retreat',
    slug: 'suryagarh-fortress-desert-retreat',
    type: 'hotel',
    city: 'Jaisalmer',
    state: 'Rajasthan',
    address: 'Kahala Phata, Sam Road, Jaisalmer, Rajasthan 345001',
    coordinates: [70.8124, 26.8912],
    ratingsAverage: 4.8,
    ratingsQuantity: 245,
    price: 13500,
    originalPrice: 16000,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'A fortress built from yellow Jaisalmer sandstone in the Thar Desert. Sunset camel rides, midnight ghost tours, halwai breakfast, and grand courtyards.',
    amenities: ['Desert Safari Hub', 'Indoor Neel Pool', 'Rait Spa', 'Archery & Falconry', 'Traditional Halwai Breakfast', 'Campfire Dinners'],
    rooms: [
      {
        id: 'fort-room',
        name: 'Fort Heritage Room',
        type: 'Deluxe',
        price: 13500,
        originalPrice: 16000,
        capacity: 2,
        beds: '1 Carved Sandstone King Bed',
        size: '500 sq.ft',
        amenities: ['Desert View', 'Brass Fittings', 'Free Breakfast & High Tea'],
        available: 6,
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '14:00',
    checkOut: '12:00',
    cancellation: 'Free cancellation up to 48 hours prior to arrival',
    featured: false,
    nearbyAttractions: [
      { name: 'Jaisalmer Fort', distance: '14 km' },
      { name: 'Kuldhara Haunted Village', distance: '12 km' },
      { name: 'Sam Sand Dunes', distance: '25 km' }
    ],
    policies: ['Desert safari experiences can be booked directly at the concierge']
  },
  {
    id: 'zostel-rishikesh-hostel',
    name: 'Zostel Tapovan Co-living & Backpacker Stay',
    slug: 'zostel-tapovan-coliving-backpacker-stay',
    type: 'hostel',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    address: 'Badrinath Road, Tapovan, Rishikesh, Uttarakhand 249192',
    coordinates: [78.3245, 30.1345],
    ratingsAverage: 4.6,
    ratingsQuantity: 620,
    price: 1199,
    originalPrice: 1499,
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Vibrant backpacker hostel with rooftop yoga cafe, high-speed co-working desks, community jam nights, and river rafting excursions.',
    amenities: ['Superfast Wi-Fi', 'Rooftop Cafe', 'Co-working Desks', 'Board Games & Jam Sessions', 'Lockers', 'Laundry'],
    rooms: [
      {
        id: 'mixed-dorm-6',
        name: '6-Bed AC Mixed Dormitory',
        type: 'Dorm',
        price: 1199,
        originalPrice: 1499,
        capacity: 1,
        beds: '1 Pod Bunk Bed with Privacy Curtain',
        size: '300 sq.ft',
        amenities: ['Individual Reading Light', 'Universal Socket', 'Secure Locker'],
        available: 8,
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'private-mountain-room',
        name: 'Private Mountain View Suite',
        type: 'Deluxe',
        price: 3499,
        originalPrice: 4200,
        capacity: 2,
        beds: '1 Queen Bed',
        size: '350 sq.ft',
        amenities: ['En-suite Bathroom', 'Balcony with River Peak View'],
        available: 3,
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '12:00',
    checkOut: '10:00',
    cancellation: 'Free cancellation up to 24 hours prior to check-in',
    featured: false,
    nearbyAttractions: [
      { name: 'Laxman Jhula', distance: '0.8 km' },
      { name: 'Secret Waterfall Trek', distance: '2.5 km' },
      { name: 'Triveni Ghat', distance: '4.2 km' }
    ],
    policies: ['Age policy 18-40 years for dorm rooms', 'Quiet hours after 23:00']
  },
  {
    id: 'taj-fishermans-cove-chennai',
    name: "Taj Fisherman's Cove Resort & Spa",
    slug: 'taj-fishermans-cove-chennai',
    type: 'resort',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Covelong Beach, East Coast Road, Chennai, Tamil Nadu 603112',
    coordinates: [80.2526, 12.7915],
    ratingsAverage: 4.8,
    ratingsQuantity: 842,
    price: 18500,
    originalPrice: 22000,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80'
    ],
    description: "Built on the ramparts of an old Dutch fort, Taj Fisherman's Cove whispers of romance, crashing Bay of Bengal surf, and sun-kissed sea breeze with thatched seaside cottages and azure infinity pools.",
    amenities: ['Private Beach Access', 'Infinity Swimming Pool', 'Jiva Spa', 'Seafood Grill by Sea', 'Free Wi-Fi', 'Butler Service'],
    rooms: [
      {
        id: 'sea-facing-cottage',
        name: 'Sea-Facing Luxury Cottage with Sit-Out',
        type: 'Cottage',
        price: 18500,
        originalPrice: 22000,
        capacity: 2,
        beds: '1 King Bed',
        size: '520 sq.ft',
        amenities: ['Private Patio', 'Ocean View', 'Outdoor Shower', 'Espresso Machine'],
        available: 3,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '14:00',
    checkOut: '12:00',
    cancellation: 'Free cancellation up to 48 hours prior to arrival',
    featured: true,
    nearbyAttractions: [
      { name: 'Shore Temple Mamallapuram', distance: '16 km' },
      { name: 'DakshinaChitra Heritage Museum', distance: '5 km' },
      { name: 'Muttukadu Boat House', distance: '3 km' }
    ],
    policies: ['Government ID required at check-in', 'Pets not allowed']
  },
  {
    id: 'radisson-blu-temple-bay',
    name: 'Radisson Blu Resort Temple Bay Mamallapuram',
    slug: 'radisson-blu-temple-bay-mamallapuram',
    type: 'resort',
    city: 'Mamallapuram',
    state: 'Tamil Nadu',
    address: '57, Covelong Road, Kanchipuram District, Mamallapuram 603104',
    coordinates: [80.1983, 12.6289],
    ratingsAverage: 4.7,
    ratingsQuantity: 1104,
    price: 14200,
    originalPrice: 17500,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Set on 44 tropical beachside acres overlooking the Bay of Bengal, featuring a meandering 27,000-sq-ft swimming pool, Ayurveda wellness sanctuary, and seaside chalets.',
    amenities: ['Sprawling Meandering Pool', 'Ayurvedic Spa', 'Beach Access', 'Kids Play Zone', 'Catamaran Rides', 'Multi-cuisine Dining'],
    rooms: [
      {
        id: 'pool-view-chalet',
        name: 'Pool View Luxury Chalet',
        type: 'Chalet',
        price: 14200,
        originalPrice: 17500,
        capacity: 3,
        beds: '1 King Bed + 1 Daybed',
        size: '480 sq.ft',
        amenities: ['Poolside Balcony', 'Bathtub', 'High-speed Wi-Fi', 'Mini Bar'],
        available: 4,
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '15:00',
    checkOut: '12:00',
    cancellation: 'Free cancellation up to 3 days prior',
    featured: true,
    nearbyAttractions: [
      { name: "Arjuna's Penance", distance: '1.2 km' },
      { name: 'Pancha Rathas', distance: '2.0 km' }
    ],
    policies: ['No smoking in rooms']
  },
  {
    id: 'grand-hyatt-goa',
    name: 'Grand Hyatt Goa',
    slug: 'grand-hyatt-goa-panaji',
    type: 'resort',
    city: 'Panaji',
    state: 'Goa',
    address: 'P.O. Goa University, Bambolim, Goa 403206',
    coordinates: [73.8567, 15.4497],
    ratingsAverage: 4.9,
    ratingsQuantity: 1890,
    price: 16800,
    originalPrice: 21000,
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'A contemporary resort inspired by 17th-century Indo-Portuguese architecture, set across 28 manicured waterfront acres overlooking Bambolim Bay.',
    amenities: ['Waterfront Bambolim Bay', 'Indoor & Outdoor Heated Pools', 'Shamana Spa', 'Casino', '7 Signature Restaurants'],
    rooms: [
      {
        id: 'grand-bay-view',
        name: 'Grand Bay View Room with Balcony',
        type: 'Deluxe Room',
        price: 16800,
        originalPrice: 21000,
        capacity: 2,
        beds: '1 King Bed',
        size: '540 sq.ft',
        amenities: ['Ocean View Balcony', 'Marble Soaking Tub', 'Pillow Menu'],
        available: 5,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '15:00',
    checkOut: '12:00',
    cancellation: 'Free cancellation up to 48 hours prior',
    featured: true,
    nearbyAttractions: [
      { name: 'Basilica of Bom Jesus', distance: '12 km' },
      { name: 'Miramar Beach', distance: '7 km' }
    ],
    policies: ['Valid government photo ID required']
  },
  {
    id: 'the-leela-kovalam',
    name: 'The Leela Kovalam, A Raviz Hotel',
    slug: 'the-leela-kovalam-raviz-hotel',
    type: 'luxury',
    city: 'Kovalam',
    state: 'Kerala',
    address: 'Beach Road, Kovalam, Thiruvananthapuram, Kerala 695527',
    coordinates: [76.9784, 8.3988],
    ratingsAverage: 4.9,
    ratingsQuantity: 1530,
    price: 21500,
    originalPrice: 26000,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80'
    ],
    description: "Cradled between two sweeping beaches, perched on a rock face cliff with uninterrupted views of the Arabian shoreline. Features an infinity pool merging into the sea horizon.",
    amenities: ['Cliff-edge Infinity Pool', 'Private Beach Access', 'Ayurvedic Aveda Spa', 'The Club Lounge & Butler', 'Sky Bar at Sunset'],
    rooms: [
      {
        id: 'club-ocean-view',
        name: 'The Club Cliff Ocean Panorama Room',
        type: 'Club Suite',
        price: 21500,
        originalPrice: 26000,
        capacity: 2,
        beds: '1 Super King Bed',
        size: '620 sq.ft',
        amenities: ['Panoramic Cliff Ocean View', 'Club Lounge Access', 'Private Plunge Bath'],
        available: 3,
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '14:00',
    checkOut: '12:00',
    cancellation: 'Free cancellation up to 48 hours prior',
    featured: true,
    nearbyAttractions: [
      { name: 'Lighthouse Beach', distance: '0.9 km' },
      { name: 'Padmanabhaswamy Temple', distance: '14 km' }
    ],
    policies: ['Children of all ages welcome']
  },
  {
    id: 'nero-boutique-hotel',
    name: 'NĒRO Boutique Hotel',
    slug: 'nero-boutique-hotel-imerovigli-greece',
    type: 'luxury',
    city: 'Imerovigli',
    state: 'Santorini, Greece',
    address: 'Caldera Cliffside, Imerovigli, 84700 Santorini, Greece',
    coordinates: [25.4227, 36.4326],
    ratingsAverage: 4.9,
    ratingsQuantity: 162,
    price: 22388,
    originalPrice: 28000,
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'As featured on Booking.com "Homes guests love", NĒRO Boutique Hotel boasts pristine whitewashed minimalist design, heated infinity plunge pool, and front-row seats to world-famous Aegean sunsets.',
    amenities: ['Heated Caldera Plunge Pool', 'Champagne Breakfast in Bed', 'VIP Helipad Transfer', 'Private Terrace Sunbeds', 'Free High-speed Wi-Fi'],
    rooms: [
      {
        id: 'caldera-sunset-suite',
        name: 'Deluxe Caldera View Suite with Private Pool',
        type: 'Cave Suite',
        price: 22388,
        originalPrice: 28000,
        capacity: 2,
        beds: '1 Queen Bed',
        size: '450 sq.ft',
        amenities: ['Private Heated Plunge Pool', 'Caldera Sea View', 'Wine Tasting Basket'],
        available: 2,
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '15:00',
    checkOut: '11:00',
    cancellation: 'Free cancellation up to 7 days prior',
    featured: true,
    nearbyAttractions: [
      { name: 'Skaros Rock Hike', distance: '0.4 km' },
      { name: 'Fira Old Port Cable Car', distance: '2.1 km' }
    ],
    policies: ['Adults-only retreat (16+)']
  },
  {
    id: 'leman-locke-london',
    name: 'Leman Locke Aparthotel',
    slug: 'leman-locke-london-uk',
    type: 'apartment',
    city: 'Tower Hamlets, London',
    state: 'United Kingdom',
    address: '15 Leman St, London E1 8EN, United Kingdom',
    coordinates: [-0.0706, 51.5137],
    ratingsAverage: 4.8,
    ratingsQuantity: 1004,
    price: 40709,
    originalPrice: 48000,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Design-led studio apartments featuring bespoke pastel pink L-shaped sofas, full designer kitchens, floor-to-ceiling glass city views, on-site artisan coffee shop and fitness studio.',
    amenities: ['Full Designer Kitchen', 'Floor-to-Ceiling Windows', 'Artisan Coffee Roastery', 'Coworking Lounge', '24/7 Gym'],
    rooms: [
      {
        id: 'skyline-studio',
        name: 'Skyline Studio Apartment',
        type: 'Studio Apartment',
        price: 40709,
        originalPrice: 48000,
        capacity: 2,
        beds: '1 Locke Dream King Bed',
        size: '390 sq.ft',
        amenities: ['Full Kitchen with Dishwasher', 'Smart 4K TV', 'Washer/Dryer'],
        available: 4,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '16:00',
    checkOut: '11:00',
    cancellation: 'Free cancellation up to 24 hours prior',
    featured: true,
    nearbyAttractions: [
      { name: 'Tower Bridge', distance: '1.1 km' },
      { name: 'Spitalfields Market', distance: '0.8 km' }
    ],
    policies: ['Contactless mobile key entry available']
  },
  {
    id: 'apartments-sloane-club',
    name: 'The Apartments by The Sloane Club',
    slug: 'the-apartments-by-the-sloane-club-london',
    type: 'apartment',
    city: 'Kensington and Chelsea, London',
    state: 'United Kingdom',
    address: '52 Lower Sloane St, London SW1W 8BS, United Kingdom',
    coordinates: [-0.1565, 51.4908],
    ratingsAverage: 4.9,
    ratingsQuantity: 257,
    price: 62003,
    originalPrice: 75000,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Impeccable serviced residences in aristocratic Chelsea. Rich heritage upholstery, king-sized tufted beds, full concierge privileges, and access to private Sloane dining salons.',
    amenities: ['Private Member Club Access', 'Dedicated 24/7 Concierge', 'Valet Parking', 'Luxury Bathrobes & Molton Brown Toiletries'],
    rooms: [
      {
        id: 'chelsea-two-bedroom',
        name: 'Chelsea Executive Residence',
        type: 'Serviced Residence',
        price: 62003,
        originalPrice: 75000,
        capacity: 4,
        beds: '2 Super King Beds',
        size: '850 sq.ft',
        amenities: ['Chef Kitchen', 'Dining Room', 'Fireplace', 'Marble Bathrooms'],
        available: 1,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '15:00',
    checkOut: '11:00',
    cancellation: 'Free cancellation up to 72 hours prior',
    featured: true,
    nearbyAttractions: [
      { name: "Sloane Square & Saatchi Gallery", distance: '0.3 km' },
      { name: 'Harrods Knightsbridge', distance: '1.2 km' }
    ],
    policies: ['Smart casual dress code in member lounge']
  },
  {
    id: '7seasons-apartments-budapest',
    name: '7Seasons Apartments Budapest',
    slug: '7seasons-apartments-budapest-hungary',
    type: 'apartment',
    city: 'Budapest',
    state: 'Hungary',
    address: 'Király u. 8, 1061 Budapest, Hungary',
    coordinates: [19.0567, 47.4988],
    ratingsAverage: 4.8,
    ratingsQuantity: 9819,
    price: 12579,
    originalPrice: 15500,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Premier self-catering modern apartments located in the heart of Budapest next to Deák Ferenc Square, surrounded by cafes, the Danube promenade, and historic thermal baths.',
    amenities: ['Underground Private Parking', 'Balcony with City Views', '24-hour Front Desk', 'Airport Shuttle', 'Full Kitchen'],
    rooms: [
      {
        id: 'superior-one-bed-apt',
        name: 'Superior 1-Bedroom Apartment with Balcony',
        type: '1-Bedroom Apartment',
        price: 12579,
        originalPrice: 15500,
        capacity: 3,
        beds: '1 Double Bed + 1 Sofa Bed',
        size: '500 sq.ft',
        amenities: ['Balcony', 'Air Conditioning', 'Espresso Machine', 'Washing Machine'],
        available: 6,
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
      }
    ],
    checkIn: '15:00',
    checkOut: '11:00',
    cancellation: 'Free cancellation up to 24 hours prior',
    featured: true,
    nearbyAttractions: [
      { name: "St. Stephen's Basilica", distance: '0.5 km' },
      { name: 'Hungarian State Opera House', distance: '0.6 km' },
      { name: 'Széchenyi Chain Bridge', distance: '1.2 km' }
    ],
    policies: ['No stag or hen parties allowed']
  }
];

export const hotelCategories = [
  { id: 'hotels', name: 'Hotels', count: 48, icon: 'Building' },
  { id: 'resorts', name: 'Resorts', count: 32, icon: 'Palmtree' },
  { id: 'villas', name: 'Villas', count: 18, icon: 'Home' },
  { id: 'apartments', name: 'Apartments', count: 26, icon: 'Layers' },
  { id: 'homestays', name: 'Homestays', count: 35, icon: 'HeartHandshake' },
  { id: 'hostels', name: 'Hostels', count: 22, icon: 'Users' },
  { id: 'luxury', name: 'Luxury Stays', count: 14, icon: 'Crown' },
  { id: 'beach', name: 'Beach Stays', count: 29, icon: 'Sun' },
  { id: 'mountain', name: 'Mountain Stays', count: 31, icon: 'Mountain' }
];

