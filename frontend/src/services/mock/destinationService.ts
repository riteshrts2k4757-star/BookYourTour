import { destinations as initialDestinations, Destination } from '../../data/destinations';
import { getStoredData, setStoredData } from '../../utils/storage';

const STORAGE_KEY = 'destinations';

export const destinationService = {
  async getAll(): Promise<Destination[]> {
    return getStoredData<Destination[]>(STORAGE_KEY, initialDestinations);
  },

  async getById(id: string): Promise<Destination | undefined> {
    const list = await this.getAll();
    return list.find((d) => d.id === id);
  },

  async getFeatured(): Promise<Destination[]> {
    const list = await this.getAll();
    return list.filter((d) => d.featured);
  },

  async create(data: Omit<Destination, 'id'>): Promise<Destination> {
    const list = await this.getAll();
    const newDest: Destination = {
      ...data,
      id: data.name.toLowerCase().replace(/\s+/g, '-')
    };
    const updated = [newDest, ...list];
    setStoredData(STORAGE_KEY, updated);
    return newDest;
  },

  async update(id: string, updates: Partial<Destination>): Promise<Destination> {
    const list = await this.getAll();
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Destination not found');
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    setStoredData(STORAGE_KEY, list);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((d) => d.id !== id);
    setStoredData(STORAGE_KEY, filtered);
    return true;
  }
};

