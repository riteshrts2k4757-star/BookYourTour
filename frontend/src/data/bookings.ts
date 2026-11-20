export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  type: 'tour' | 'hotel' | 'flight' | 'train' | 'bus';
  itemId: string;
  itemName: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'failed';
  amount: number;
  date: string;
  travellers: number;
  thumbnail?: string;
  details: Record<string, any>;
  createdAt: string;
}

export const initialBookings: Booking[] = [
  {
    id: 'bk-1001',
    bookingRef: 'SRT-TR-84920',
    userId: 'user-1',
    type: 'tour',
    itemId: 'golden-triangle',
    itemName: 'Golden Triangle Heritage Circuit',
    status: 'confirmed',
    paymentStatus: 'paid',
    amount: 29998,
    date: '2027-02-10',
    travellers: 2,
    thumbnail: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    details: {
      pickupLocation: 'Delhi IGI Airport Terminal 3',
      specialRequests: 'Vegetarian meals preferred',
      leadTraveller: 'Aarav Sharma',
      guideName: 'Vikram Singh',
      guidePhone: '+91 98101 23456',
      route: 'Delhi • Agra (Taj Mahal) • Jaipur',
      navibandSynced: true,
      navibandBattery: '92%'
    },
    createdAt: '2024-11-01'
  },
  {
    id: 'bk-1002',
    bookingRef: 'SRT-HT-51902',
    userId: 'user-1',
    type: 'hotel',
    itemId: 'rambagh-palace-jaipur',
    itemName: 'Rambagh Palace Heritage & Luxury',
    status: 'confirmed',
    paymentStatus: 'paid',
    amount: 37000,
    date: '2027-02-12',
    travellers: 2,
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    details: {
      roomName: 'Palace Garden View Room',
      checkIn: '2027-02-12',
      checkOut: '2027-02-14',
      nights: 2,
      location: 'Jaipur, Rajasthan',
      freeBreakfast: true,
      geniusBenefit: '15% Off Applied'
    },
    createdAt: '2024-11-02'
  },
  {
    id: 'bk-1003',
    bookingRef: 'SRT-FL-92811',
    userId: 'user-1',
    type: 'flight',
    itemId: 'fl-6e-2041',
    itemName: 'IndiGo 6E-2041 (DEL -> BOM)',
    status: 'completed',
    paymentStatus: 'paid',
    amount: 4899,
    date: '2024-10-15',
    travellers: 1,
    thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
    details: {
      pnr: '6EZ9KL',
      seat: '12F (Window)',
      departure: 'New Delhi (DEL) 07:15 AM',
      arrival: 'Mumbai (BOM) 09:30 AM',
      gate: 'Gate 42B',
      webCheckInStatus: 'Completed'
    },
    createdAt: '2024-09-28'
  },
  {
    id: 'bk-1004',
    bookingRef: 'SRT-TRN-38291',
    userId: 'user-1',
    type: 'train',
    itemId: 'tr-22436',
    itemName: 'Vande Bharat Express (NDLS -> BSB)',
    status: 'completed',
    paymentStatus: 'paid',
    amount: 1750,
    date: '2024-08-14',
    travellers: 1,
    thumbnail: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=600&q=80',
    details: {
      pnr: '2418593810',
      coach: 'C4',
      seat: '28 (Window)',
      departure: 'NDLS 06:00 AM',
      arrival: 'Varanasi Cantt 14:00 PM',
      platform: 'Platform 1'
    },
    createdAt: '2024-08-01'
  }
];

