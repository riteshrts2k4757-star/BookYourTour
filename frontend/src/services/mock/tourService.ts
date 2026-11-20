import { apiClient } from '../apiClient';
import { Tour } from '../../data/tours';

interface BackendLocation {
  description?: string;
  address?: string;
  coordinates?: number[];
  day?: number;
  photo?: string;
}

interface BackendGuide {
  _id?: string;
  id?: string;
  name?: string;
  photo?: string;
}

export interface BackendTour {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  duration?: number;
  maxGroupSize?: number;
  difficulty?: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  price?: number;
  priceDiscount?: number;
  summary?: string;
  description?: string;
  imageCover?: string;
  images?: string[];
  startDates?: string[];
  startLocation?: BackendLocation;
  locations?: BackendLocation[];
  guides?: Array<string | BackendGuide>;
  category?: string;
  featured?: boolean;
  secretTour?: boolean;
  itinerary?: Tour['itinerary'];
  included?: string[];
  excluded?: string[];
  highlights?: string[];
}

interface TourListResponse {
  data?: {
    data?: BackendTour[];
  };
}

interface TourResponse {
  data?: {
    data?: BackendTour;
  };
}

const imageUrl = (image: string | undefined, kind: 'tours' | 'users') => {
  if (!image) return '';
  return image.startsWith('http') || image.startsWith('/')
    ? image
    : `/img/${kind}/${encodeURIComponent(image)}`;
};

const coordinates = (values: number[] | undefined): [number, number] => {
  const longitude = Number(values?.[0]);
  const latitude = Number(values?.[1]);
  return Number.isFinite(longitude) && Number.isFinite(latitude) ? [longitude, latitude] : [0, 0];
};

const dateOnly = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().slice(0, 10);
};

export const mapBackendTour = (source: BackendTour): Tour => {
  const startAddress = source.startLocation?.address || source.startLocation?.description || 'Location to be announced';
  const guides = source.guides || [];
  return {
    id: String(source._id || source.id || ''),
    name: source.name || 'Tour',
    slug: source.slug || '',
    duration: Number(source.duration || 1),
    maxGroupSize: Number(source.maxGroupSize || 1),
    difficulty: source.difficulty === 'medium' || source.difficulty === 'difficult' ? source.difficulty : 'easy',
    ratingsAverage: Number(source.ratingsAverage || 0),
    ratingsQuantity: Number(source.ratingsQuantity || 0),
    price: Number(source.price || 0),
    priceDiscount: source.priceDiscount,
    summary: source.summary || source.description || '',
    description: source.description || source.summary || '',
    imageCover: imageUrl(source.imageCover, 'tours') || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    images: (source.images || []).map((image) => imageUrl(image, 'tours')).filter(Boolean),
    startDates: (source.startDates || []).map(dateOnly),
    startLocation: {
      description: source.startLocation?.description || startAddress,
      coordinates: coordinates(source.startLocation?.coordinates),
      address: startAddress
    },
    locations: (source.locations || []).map((location) => ({
      description: location.description || location.address || 'Tour stop',
      coordinates: coordinates(location.coordinates),
      day: Number(location.day || 1),
      photo: imageUrl(location.photo, 'tours'),
      type: 'attraction'
    })),
    guides: guides.map((guide) => typeof guide === 'string' ? guide : String(guide._id || guide.id || '')).filter(Boolean),
    guideProfiles: guides
      .filter((guide): guide is BackendGuide => typeof guide !== 'string')
      .map((guide) => ({
        id: String(guide._id || guide.id || ''),
        name: guide.name || 'Tour guide',
        photo: imageUrl(guide.photo, 'users') || '/img/users/default.jpg'
      })),
    category: source.category || 'Tour',
    featured: Boolean(source.featured),
    secretTour: Boolean(source.secretTour),
    itinerary: source.itinerary || [],
    included: source.included || [],
    excluded: source.excluded || [],
    highlights: source.highlights || []
  };
};

const readTourList = (response: TourListResponse): Tour[] => {
  const tours = response.data?.data;
  if (!Array.isArray(tours)) {
    throw new Error('The tours service returned an invalid catalog response.');
  }
  return tours.map(mapBackendTour);
};

export const tourService = {
  async getAll(): Promise<Tour[]> {
    const response = await apiClient.get<TourListResponse>('/tours');
    return readTourList(response.data);
  },

  async getById(id: string): Promise<Tour | undefined> {
    if (/^[a-f\d]{24}$/i.test(id)) {
      const response = await apiClient.get<TourResponse>(`/tours/${encodeURIComponent(id)}`);
      const tour = response.data?.data?.data;
      return tour ? mapBackendTour(tour) : undefined;
    }

    const response = await apiClient.get<TourListResponse>('/tours', { params: { slug: id } });
    return readTourList(response.data)[0];
  },

  async getFeatured(): Promise<Tour[]> {
    const tours = await this.getAll();
    const featuredTours = tours.filter((tour) => tour.featured);
    return featuredTours.length ? featuredTours : tours.slice(0, 3);
  },

  async getCategories(): Promise<string[]> {
    const tours = await this.getAll();
    return Array.from(new Set(tours.map((tour) => tour.category)));
  },

  async search(params: {
    destination?: string;
    category?: string;
    difficulty?: string;
    maxPrice?: number;
  }): Promise<Tour[]> {
    const tours = await this.getAll();
    return tours.filter((tour) => {
      if (params.destination) {
        const destination = params.destination.trim().toLowerCase();
        if (
          !tour.name.toLowerCase().includes(destination) &&
          !tour.summary.toLowerCase().includes(destination) &&
          !tour.description.toLowerCase().includes(destination) &&
          !tour.startLocation.description.toLowerCase().includes(destination) &&
          !tour.locations.some((location) => location.description.toLowerCase().includes(destination))
        ) return false;
      }
      if (params.category && params.category !== 'all' && tour.category.toLowerCase() !== params.category.toLowerCase()) return false;
      if (params.difficulty && params.difficulty !== 'all' && tour.difficulty !== params.difficulty) return false;
      if (params.maxPrice !== undefined && tour.price > params.maxPrice) return false;
      return true;
    });
  }
};
