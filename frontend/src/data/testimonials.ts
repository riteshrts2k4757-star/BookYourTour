export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  photo: string;
  rating: number;
  quote: string;
  trip: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 'testi-1',
    name: 'Ananya Singhania',
    role: 'Travel Journalist',
    city: 'Mumbai',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    quote: 'Sarthi redefined what an Indian tour operator feels like. The NaviBand wristband integration made hiking high passes completely stress-free without constantly pulling out my phone.',
    trip: 'Ladakh High-Altitude Adventure'
  },
  {
    id: 'testi-2',
    name: 'Rajeev & Priyamvada Sen',
    role: 'Architects & Photographers',
    city: 'Kolkata',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    quote: 'Booking our Golden Triangle anniversary circuit through Sarthi gave us access to private palace wings and curated street food trails we could never have arranged independently.',
    trip: 'Golden Triangle Heritage Circuit'
  },
  {
    id: 'testi-3',
    name: 'Marcus & Elena Vance',
    role: 'Global Explorers',
    city: 'London, UK',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    quote: 'The level of care, the verified local guides, and the seamless transport transitions made our first trip to India an extraordinary, lifelong memory.',
    trip: 'Kerala Backwaters & Tea Gardens'
  }
];

