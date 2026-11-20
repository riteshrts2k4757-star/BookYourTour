export interface DestinationAttraction {
  name: string;
  type: string;
  description: string;
  image?: string;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  tagline: string;
  description: string;
  heroImage: string;
  images: string[];
  categories: string[];
  bestTimeToVisit: string;
  avgBudgetPerDay: string;
  popularFor: string[];
  attractions: DestinationAttraction[];
  featured: boolean;
}

export const destinations: Destination[] = [
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'The Pink City of Royal Forts & Timeless Palaces',
    description: 'Capital of Rajasthan, famed for majestic hill forts, terracotta-pink terracotta facades, bustling jewelry bazaars, and opulent royal gastronomy.',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80'
    ],
    categories: ['Heritage', 'Culture', 'Luxury', 'Shopping'],
    bestTimeToVisit: 'October to March',
    avgBudgetPerDay: '₹3,500 - ₹8,000',
    popularFor: ['Amber Fort', 'Hawa Mahal', 'Ghewar sweets', 'Blue Pottery', 'Block Prints'],
    attractions: [
      { name: 'Amber Fort & Palace', type: 'Fort', description: 'Hilltop Rajput fortress featuring Maota lake reflections and Sheesh Mahal mirror palace.' },
      { name: 'Hawa Mahal (Palace of Winds)', type: 'Monument', description: '5-story honeycomb facade built in 1799 with 953 jharokha latticed windows.' },
      { name: 'City Palace Complex', type: 'Palace', description: 'Royal residence blending Rajput, Mughal and European architectural styles.' }
    ],
    featured: true
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    tagline: 'Sun-drenched Shores, Susegad Living & Portuguese Charm',
    description: "India's beloved beach state with 105 km of coastline, colonial church squares, fresh coconut-seafood curries, and nightlife under open stars.",
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80'
    ],
    categories: ['Beach', 'Nightlife', 'Relaxation', 'Water Sports'],
    bestTimeToVisit: 'November to February',
    avgBudgetPerDay: '₹2,500 - ₹6,000',
    popularFor: ['Palolem & Anjuna Beaches', 'Dudhsagar Waterfalls', 'Fontainhas Latin Quarter', 'Seafood Curries'],
    attractions: [
      { name: 'Basilica of Bom Jesus', type: 'UNESCO Site', description: 'Historic 16th-century church holding the mortal remains of St. Francis Xavier.' },
      { name: 'Dudhsagar Waterfalls', type: 'Waterfall', description: 'Four-tiered sea of milk cascade falling 310 meters through dense Western Ghats.' },
      { name: 'Fontainhas', type: 'Heritage Quarter', description: 'Colorful Portuguese colonial streets with narrow tiled lanes and art cafes.' }
    ],
    featured: true
  },
  {
    id: 'kerala',
    name: 'Kerala Backwaters',
    state: 'Kerala',
    tagline: "God's Own Country of Emerald Lagoons and Tea Peaks",
    description: 'A serene coastal paradise of interconnected canals, spice hills in Wayanad, mist-blanketed tea gardens in Munnar, and soothing Ayurvedic therapies.',
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=900&q=80'
    ],
    categories: ['Nature', 'Wellness', 'Romantic', 'Heritage'],
    bestTimeToVisit: 'September to March',
    avgBudgetPerDay: '₹3,000 - ₹7,500',
    popularFor: ['Alleppey Houseboats', 'Munnar Tea Plantations', 'Kathakali Dance', 'Ayurveda Massages'],
    attractions: [
      { name: 'Alleppey Backwaters', type: 'Canals & Lagoons', description: 'Labyrinth of palm-fringed lagoons sailed by wooden Kettuvallam houseboats.' },
      { name: 'Eravikulam National Park', type: 'Wildlife', description: 'Home of the endangered Nilgiri Tahr and rolling meadows of Neelakurinji blooms.' }
    ],
    featured: true
  },
  {
    id: 'ladakh',
    name: 'Leh Ladakh',
    state: 'Ladakh (UT)',
    tagline: 'Land of High Passes, Glacial Lakes & Starlit Heavens',
    description: 'An ethereal high-altitude desert surrounded by the Karakoram and Himalayan ranges, home to ancient cliffside gompas and turquoise glacial lakes.',
    heroImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1626621331169-5f68be661cf2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=900&q=80'
    ],
    categories: ['Adventure', 'Mountains', 'Photography', 'Spirituality'],
    bestTimeToVisit: 'May to September',
    avgBudgetPerDay: '₹4,000 - ₹9,000',
    popularFor: ['Pangong Lake', 'Khardung La Pass', 'Thiksey Monastery', 'Nubra Valley Sand Dunes'],
    attractions: [
      { name: 'Pangong Tso', type: 'Glacial Lake', description: 'Spectacular 134-km long endorheic lake changing colors from turquoise to deep blue.' },
      { name: 'Khardung La Pass', type: 'Mountain Pass', description: 'Iconic high mountain pass standing at 17,582 ft above sea level.' }
    ],
    featured: true
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    tagline: 'Eternal City on the Ganges & Cradle of Ancient Traditions',
    description: "One of the world's oldest continuously inhabited cities, sacred to millions, where music, ancient chants, incense and riverside cremations form an unbroken continuity of life.",
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80'
    ],
    categories: ['Spirituality', 'Culture', 'History', 'Food'],
    bestTimeToVisit: 'November to February',
    avgBudgetPerDay: '₹2,000 - ₹5,000',
    popularFor: ['Ganga Aarti', 'Assi Ghat Sunrise', 'Banarasi Silk Sarees', 'Kachori Jalebi'],
    attractions: [
      { name: 'Dashashwamedh Ghat', type: 'Ghat', description: 'The main riverside ghat hosting the spectacular evening Maha Ganga Aarti.' },
      { name: 'Sarnath', type: 'Archaeological Site', description: 'Sacred deer park where Gautam Buddha taught his very first sermon on Dharma.' }
    ],
    featured: true
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    tagline: 'The City of Joy, Cultural Arts & Colonial Splendor',
    description: 'Intellectual capital of India, revered for Victoria Memorial marble halls, yellow ambassador cabs, St. Paul Cathedral, and iconic heritage street food trails.',
    heroImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80'
    ],
    categories: ['Culture', 'Heritage', 'Arts', 'Food'],
    bestTimeToVisit: 'October to March',
    avgBudgetPerDay: '₹2,500 - ₹6,000',
    popularFor: ['Victoria Memorial', 'Howrah Bridge', 'Kolkata Biryani', 'Rosogolla & Sandesh'],
    attractions: [
      { name: 'Victoria Memorial', type: 'Monument', description: 'Grand white Makrana marble monument dedicated to Queen Victoria, surrounded by 64 acres of gardens.' },
      { name: 'Howrah Bridge', type: 'Bridge', description: 'Iconic cantilever suspension bridge spanning the Hooghly River.' }
    ],
    featured: true
  },
  {
    id: 'vrindavan',
    name: 'Vrindāvan',
    state: 'Uttar Pradesh',
    tagline: 'Sacred Groves, Yamuna Ghats & Krishna Legends',
    description: 'Holy spiritual town on the banks of Yamuna, resonant with temple bells, colorful flower stalls, Banke Bihari temple chants, and ancient heritage shrines.',
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1609334761849-7bc049740738?auto=format&fit=crop&w=900&q=80'
    ],
    categories: ['Spirituality', 'Temple Towns', 'Culture'],
    bestTimeToVisit: 'October to March',
    avgBudgetPerDay: '₹1,800 - ₹4,500',
    popularFor: ['Prem Mandir', 'Banke Bihari Temple', 'Yamuna Aarti at Keshi Ghat'],
    attractions: [
      { name: 'Prem Mandir', type: 'Temple', description: 'Massive Italian marble temple complex displaying intricate Krishna life dioramas and musical light shows.' },
      { name: 'Banke Bihari Temple', type: 'Temple', description: 'Most sacred temple dedicated to Banke Bihari, famous for curtains drawn back and forth.' }
    ],
    featured: true
  },
  {
    id: 'ujjain',
    name: 'Ujjain',
    state: 'Madhya Pradesh',
    tagline: 'Ancient City of Mahakal on the Sacred Shipra River',
    description: 'One of the seven sacred Moksha puris of Hinduism and home to the revered Mahakaleshwar Jyotirlinga, boasting centuries of astronomical and spiritual history.',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1609334761849-7bc049740738?auto=format&fit=crop&w=900&q=80'
    ],
    categories: ['Spirituality', 'Temple Towns', 'Heritage'],
    bestTimeToVisit: 'October to March',
    avgBudgetPerDay: '₹2,000 - ₹5,000',
    popularFor: ['Mahakaleshwar Temple', 'Mahakal Lok Corridor', 'Ram Ghat Aarti', 'Bhasma Aarti'],
    attractions: [
      { name: 'Mahakaleshwar Jyotirlinga', type: 'Temple', description: 'One of the twelve sacred Jyotirlingas, where Lord Shiva is worshipped as the Lord of Time and Death.' },
      { name: 'Mahakal Lok Corridor', type: 'Corridor', description: 'Sprawling 900-meter corridor embellished with 108 grand stone pillars and Shiva myth murals.' }
    ],
    featured: true
  },
  {
    id: 'new-delhi',
    name: 'New Delhi',
    state: 'Delhi NCR',
    tagline: 'Imperial Capital of Mughal Forts & Modern Energy',
    description: "India's vibrant capital where centuries-old Mughal mosques and red stone forts coexist with tree-lined Rajpath boulevards, embassies, and buzzing street markets.",
    heroImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80'
    ],
    categories: ['Heritage', 'Capital City', 'Food', 'Shopping'],
    bestTimeToVisit: 'October to March',
    avgBudgetPerDay: '₹3,000 - ₹8,500',
    popularFor: ['India Gate', 'Qutub Minar', 'Humayun Tomb', 'Chandni Chowk Parathas'],
    attractions: [
      { name: 'Humayun’s Tomb', type: 'Mausoleum', description: 'UNESCO World Heritage red sandstone garden tomb that inspired the Taj Mahal.' },
      { name: 'Qutub Minar Complex', type: 'Minaret', description: '73-meter tall fluted brick minaret built in 1192 surrounded by ancient ruins.' }
    ],
    featured: true
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    tagline: 'The Pearl City of Nizami Palaces & Dum Biryani',
    description: 'City of Nawabs celebrated for the magnificent Charminar, massive Golconda Fort acoustics, sparkling pearls, and world-renowned slow-cooked Dum Biryani.',
    heroImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1627976899872-f35d1f887dc7?auto=format&fit=crop&w=900&q=80'
    ],
    categories: ['Heritage', 'Food', 'Culture', 'History'],
    bestTimeToVisit: 'October to February',
    avgBudgetPerDay: '₹2,500 - ₹6,500',
    popularFor: ['Charminar', 'Golconda Fort Sound & Light', 'Hyderabadi Dum Biryani', 'Laad Bazaar Pearls'],
    attractions: [
      { name: 'Charminar', type: 'Monument', description: 'Iconic 16th-century square structure with four 56-meter minarets overlooking bustling bazaars.' },
      { name: 'Golconda Fort', type: 'Fort', description: 'Massive fortress famed for its acoustic clapping portico and diamond vault history.' }
    ],
    featured: true
  }
];

