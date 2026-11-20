import { users as initialUsers, guides as initialGuides, User, Guide } from '../../data/users';
import { getStoredData, setStoredData } from '../../utils/storage';

const USER_STORAGE_KEY = 'users';
const GUIDE_STORAGE_KEY = 'guides';

export const userService = {
  async getAll(): Promise<User[]> {
    return getStoredData<User[]>(USER_STORAGE_KEY, initialUsers);
  },

  async getById(id: string): Promise<User | undefined> {
    const list = await this.getAll();
    return list.find((u) => u.id === id);
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const list = await this.getAll();
    const idx = list.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    setStoredData(USER_STORAGE_KEY, list);
    return updated;
  },

  async toggleWishlist(userId: string, itemId: string): Promise<string[]> {
    const user = await this.getById(userId);
    if (!user) throw new Error('User not found');
    const current = user.wishlist || [];
    const exists = current.includes(itemId);
    const updatedWishlist = exists ? current.filter((id) => id !== itemId) : [...current, itemId];
    await this.update(userId, { wishlist: updatedWishlist });
    return updatedWishlist;
  },

  async toggleActive(id: string): Promise<User> {
    const user = await this.getById(id);
    if (!user) throw new Error('User not found');
    return this.update(id, { active: !user.active });
  }
};

export const guideService = {
  async getAll(): Promise<Guide[]> {
    return getStoredData<Guide[]>(GUIDE_STORAGE_KEY, initialGuides);
  },

  async getById(id: string): Promise<Guide | undefined> {
    const list = await this.getAll();
    return list.find((g) => g.id === id);
  },

  async update(id: string, updates: Partial<Guide>): Promise<Guide> {
    const list = await this.getAll();
    const idx = list.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error('Guide not found');
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    setStoredData(GUIDE_STORAGE_KEY, list);
    return updated;
  }
};

