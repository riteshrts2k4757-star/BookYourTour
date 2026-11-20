import { reviews as initialReviews, Review } from '../../data/reviews';
import { getStoredData, setStoredData } from '../../utils/storage';

const STORAGE_KEY = 'reviews';

export const reviewService = {
  async getAll(): Promise<Review[]> {
    return getStoredData<Review[]>(STORAGE_KEY, initialReviews);
  },

  async getByTarget(targetId: string): Promise<Review[]> {
    const list = await this.getAll();
    return list.filter((r) => r.targetId === targetId && r.approved);
  },

  async addReview(data: Omit<Review, 'id' | 'createdAt' | 'approved'>): Promise<Review> {
    const list = await this.getAll();
    const newRev: Review = {
      ...data,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      approved: true // Auto approve in demo mode
    };
    const updated = [newRev, ...list];
    setStoredData(STORAGE_KEY, updated);
    return newRev;
  },

  async toggleApproval(id: string): Promise<Review> {
    const list = await this.getAll();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Review not found');
    list[idx].approved = !list[idx].approved;
    setStoredData(STORAGE_KEY, list);
    return list[idx];
  },

  async delete(id: string): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((r) => r.id !== id);
    setStoredData(STORAGE_KEY, filtered);
    return true;
  }
};

