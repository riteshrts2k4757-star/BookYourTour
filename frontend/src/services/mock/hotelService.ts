import { hotels as initialHotels, Hotel, hotelCategories } from '../../data/hotels';
import { getStoredData, setStoredData } from '../../utils/storage';

const STORAGE_KEY = 'hotels';

export const hotelService = {
  async getAll(): Promise<Hotel[]> {
    return getStoredData<Hotel[]>(STORAGE_KEY, initialHotels);
  },

  async getById(id: string): Promise<Hotel | undefined> {
    const list = await this.getAll();
    return list.find((h) => h.id === id || h.slug === id);
  },

  async getFeatured(): Promise<Hotel[]> {
    const list = await this.getAll();
    return list.filter((h) => h.featured);
  },

  async getCategories() {
    return hotelCategories;
  },

  async search(params: {
    city?: string;
    type?: string;
    maxPrice?: number;
    amenities?: string[];
  }): Promise<Hotel[]> {
    const list = await this.getAll();
    return list.filter((h) => {
      if (params.city) {
        const query = params.city.toLowerCase();
        const matchesCity = h.city.toLowerCase().includes(query);
        const matchesName = h.name.toLowerCase().includes(query);
        const matchesState = h.state.toLowerCase().includes(query);
        if (!matchesCity && !matchesName && !matchesState) return false;
      }
      if (params.type && params.type !== 'all' && h.type !== params.type) {
        return false;
      }
      if (params.maxPrice && h.price > params.maxPrice) {
        return false;
      }
      if (params.amenities && params.amenities.length > 0) {
        const hasAll = params.amenities.every((a) => h.amenities.includes(a));
        if (!hasAll) return false;
      }
      return true;
    });
  },

  async create(data: Omit<Hotel, 'id'>): Promise<Hotel> {
    const list = await this.getAll();
    const newHotel: Hotel = {
      ...data,
      id: `hotel-${Date.now()}`
    };
    const updated = [newHotel, ...list];
    setStoredData(STORAGE_KEY, updated);
    return newHotel;
  },

  async update(id: string, updates: Partial<Hotel>): Promise<Hotel> {
    const list = await this.getAll();
    const idx = list.findIndex((h) => h.id === id);
    if (idx === -1) throw new Error('Hotel not found');
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    setStoredData(STORAGE_KEY, list);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((h) => h.id !== id);
    setStoredData(STORAGE_KEY, filtered);
    return true;
  }
};

