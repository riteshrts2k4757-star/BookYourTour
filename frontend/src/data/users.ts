export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  photo: string;
  phone?: string;
  bio?: string;
  joinedAt: string;
  wishlist: string[];
  active: boolean;
}

export interface Guide extends User {
  role: 'guide' | 'lead-guide';
  specialization: string[];
  languages: string[];
  experience: string;
  rating: number;
  totalTours: number;
  assignedTours: string[];
}

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Aarav Sharma',
    email: 'traveller@sarthi.com',
    role: 'user',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98765 43210',
    bio: 'Passionate backpacker exploring the hidden corners of India. Coffee lover and amateur photographer.',
    joinedAt: '2024-03-15',
    wishlist: ['golden-triangle', 'rambagh-palace-jaipur', 'ladakh-adventure'],
    active: true
  },
  {
    id: 'user-2',
    name: 'Meera Nambiar',
    email: 'meera@example.com',
    role: 'user',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98234 56789',
    bio: 'Architect and heritage enthusiast. Always looking for unique stays and culinary walks.',
    joinedAt: '2024-06-20',
    wishlist: ['kerala-backwaters'],
    active: true
  },
  {
    id: 'user-3',
    name: 'Vikramaditya Rathore',
    email: 'vikram@example.com',
    role: 'user',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    phone: '+91 97112 88490',
    bio: 'Road trip explorer, Royal Enfield rider, mountain enthusiast.',
    joinedAt: '2024-08-10',
    wishlist: ['ladakh-adventure', 'wildflower-hall-shimla'],
    active: true
  },
  {
    id: 'guide-1',
    name: 'Rohan Deshmukh',
    email: 'guide@sarthi.com',
    role: 'lead-guide',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    phone: '+91 99887 76655',
    bio: 'Ministry of Tourism Certified Himalayan Expedition Leader with 8+ years guiding in Ladakh and Spiti.',
    joinedAt: '2023-01-12',
    wishlist: [],
    active: true
  },
  {
    id: 'guide-2',
    name: 'Sunita Rathore',
    email: 'sunita.guide@sarthi.com',
    role: 'guide',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98290 12345',
    bio: 'Historian specializing in Rajput architecture, miniature paintings, and royal cuisine.',
    joinedAt: '2023-04-18',
    wishlist: [],
    active: true
  },
  {
    id: 'admin-1',
    name: 'Pooja Iyer (Admin)',
    email: 'admin@sarthi.com',
    role: 'admin',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98450 11223',
    bio: 'Platform Administrator & Head of Operations at Sarthi Travel.',
    joinedAt: '2022-11-01',
    wishlist: [],
    active: true
  }
];

export const guides: Guide[] = [
  {
    id: 'guide-1',
    name: 'Rohan Deshmukh',
    email: 'guide@sarthi.com',
    role: 'lead-guide',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    phone: '+91 99887 76655',
    bio: 'Certified Himalayan Expedition Leader with 8+ years guiding high altitude treks in Ladakh and Spiti.',
    joinedAt: '2023-01-12',
    wishlist: [],
    active: true,
    specialization: ['High-Altitude Trekking', 'Wilderness First Aid', 'Astronomy & Stargazing'],
    languages: ['English', 'Hindi', 'Ladakhi'],
    experience: '8+ Years',
    rating: 4.9,
    totalTours: 84,
    assignedTours: ['ladakh-adventure']
  },
  {
    id: 'guide-2',
    name: 'Sunita Rathore',
    email: 'sunita.guide@sarthi.com',
    role: 'guide',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98290 12345',
    bio: 'Historian specializing in Rajput architecture, miniature paintings, and royal cuisine.',
    joinedAt: '2023-04-18',
    wishlist: [],
    active: true,
    specialization: ['Mughal & Rajput History', 'Architectural Walks', 'Royal Gastronomy'],
    languages: ['English', 'Hindi', 'Marwari', 'French'],
    experience: '6 Years',
    rating: 4.8,
    totalTours: 62,
    assignedTours: ['golden-triangle', 'rajasthan-royal-desert']
  },
  {
    id: 'guide-3',
    name: 'K. V. Ramanathan',
    email: 'ramanathan@sarthi.com',
    role: 'guide',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    phone: '+91 94440 33221',
    bio: 'Vedic scholar, temple architecture docent and Ganges river conservation advocate.',
    joinedAt: '2023-07-22',
    wishlist: [],
    active: true,
    specialization: ['Vedic Philosophy', 'Temple Iconography', 'Ancient Boat Lore'],
    languages: ['English', 'Hindi', 'Tamil', 'Sanskrit'],
    experience: '12 Years',
    rating: 4.9,
    totalTours: 110,
    assignedTours: ['varanasi-spiritual-roots', 'kerala-backwaters']
  }
];

