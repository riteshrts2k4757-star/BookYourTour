import { initialBookings, Booking } from '../../data/bookings';
import { getStoredData, setStoredData } from '../../utils/storage';

const STORAGE_KEY = 'bookings';

export const bookingService = {
  async getAll(): Promise<Booking[]> {
    return getStoredData<Booking[]>(STORAGE_KEY, initialBookings);
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    const all = await this.getAll();
    return all.filter((b) => b.userId === userId);
  },

  async getById(id: string): Promise<Booking | undefined> {
    const all = await this.getAll();
    return all.find((b) => b.id === id || b.bookingRef === id);
  },

  async create(data: Omit<Booking, 'id' | 'bookingRef' | 'createdAt'>): Promise<Booking> {
    const all = await this.getAll();
    const newBooking: Booking = {
      ...data,
      id: `bk-${Date.now()}`,
      bookingRef: `SRT-${data.type.substring(0, 2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newBooking, ...all];
    setStoredData(STORAGE_KEY, updated);
    return newBooking;
  },

  async updateStatus(id: string, status: Booking['status'], paymentStatus?: Booking['paymentStatus']): Promise<Booking> {
    const all = await this.getAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    const updated = {
      ...all[idx],
      status,
      ...(paymentStatus ? { paymentStatus } : {})
    };
    all[idx] = updated;
    setStoredData(STORAGE_KEY, all);
    return updated;
  },

  async cancelBooking(id: string): Promise<Booking> {
    return this.updateStatus(id, 'cancelled', 'refunded');
  }
};

export const paymentService = {
  async simulatePayment(params: {
    amount: number;
    method: 'card' | 'qr';
    cardDetails?: { cardNumber: string; expiry: string; cvv: string; holderName: string };
    scenario?: 'success' | 'declined' | 'expired';
  }): Promise<{ success: boolean; transactionId: string; message: string }> {
    // Artificial slight delay for realistic UX
    await new Promise((r) => setTimeout(r, 800));

    if (params.scenario === 'declined') {
      return {
        success: false,
        transactionId: `TXN-FAIL-${Date.now()}`,
        message: 'Payment was declined by the issuing bank in demo simulation.'
      };
    }
    if (params.scenario === 'expired') {
      return {
        success: false,
        transactionId: `TXN-EXP-${Date.now()}`,
        message: 'The payment transaction session expired. Please retry.'
      };
    }

    return {
      success: true,
      transactionId: `TXN-DEMO-${Math.floor(10000000 + Math.random() * 90000000)}`,
      message: 'Demo payment completed successfully. Inventory confirmed.'
    };
  }
};

