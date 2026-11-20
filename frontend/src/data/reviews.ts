export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  targetType: 'tour' | 'hotel';
  targetId: string;
  targetName: string;
  rating: number;
  review: string;
  createdAt: string;
  approved: boolean;
}

export const reviews: Review[] = [
  {
    id: 'rev-1',
    userId: 'user-1',
    userName: 'Aarav Sharma',
    userPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    targetType: 'tour',
    targetId: 'golden-triangle',
    targetName: 'Golden Triangle Heritage Circuit',
    rating: 5,
    review: 'Watching sunrise over the Taj Mahal while hearing our guide Sunita explain the Persian calligraphy was one of the most magical moments of my life. Everything was flawlessly organized!',
    createdAt: '2024-10-18',
    approved: true
  },
  {
    id: 'rev-2',
    userId: 'user-2',
    userName: 'Meera Nambiar',
    userPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    targetType: 'hotel',
    targetId: 'rambagh-palace-jaipur',
    targetName: 'Rambagh Palace Heritage & Luxury',
    rating: 5,
    review: 'Unrivaled royal treatment. Peacocks greeting you at breakfast in the verandah, the heritage walks through the palace wings, and the bath rituals were sheer perfection.',
    createdAt: '2024-11-02',
    approved: true
  },
  {
    id: 'rev-3',
    userId: 'user-3',
    userName: 'Vikramaditya Rathore',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    targetType: 'tour',
    targetId: 'ladakh-adventure',
    targetName: 'Ladakh High-Altitude Adventure',
    rating: 5,
    review: 'Rohan Deshmukh is a top-tier expedition leader. When one traveller felt mild altitude headache, he managed oxygen levels instantly. Pangong Lake camping was surreal under the Milky Way.',
    createdAt: '2024-09-14',
    approved: true
  },
  {
    id: 'rev-4',
    userId: 'user-1',
    userName: 'Aarav Sharma',
    userPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    targetType: 'hotel',
    targetId: 'taj-exotica-goa',
    targetName: 'Taj Exotica Beach Resort & Spa',
    rating: 5,
    review: 'The private beach access and sunset cocktails at the lobster shack were dreamlike. Very courteous staff and impeccable cleanliness.',
    createdAt: '2024-12-05',
    approved: true
  },
  {
    id: 'rev-5',
    userId: 'user-2',
    userName: 'Meera Nambiar',
    userPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    targetType: 'tour',
    targetId: 'kerala-backwaters',
    targetName: 'Kerala Backwaters & Tea Gardens',
    rating: 5,
    review: 'The traditional houseboat ride through the Vembanad canals was the calmest three days of my entire year. Karimeen fish fry served on banana leaf was delicious!',
    createdAt: '2024-08-25',
    approved: true
  }
];

