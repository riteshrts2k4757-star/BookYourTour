import { flights, Flight, airportList } from '../../data/flights';
import { trains, Train, railwayStations } from '../../data/trains';
import { buses, Bus, busCities } from '../../data/buses';

const providerStatus = {
  available: false,
  provider: 'Not configured',
  message: 'Live availability is currently unavailable. Add an authorized provider key and backend gateway to enable real flight, train, or bus search responses.'
};

export const flightService = {
  async getStatus() {
    return { ...providerStatus, type: 'flight' };
  },

  async search(): Promise<Flight[]> {
    return [];
  },

  async getById(id: string): Promise<Flight | undefined> {
    return flights.find((f) => f.id === id);
  },

  async getAirports() {
    return airportList;
  }
};

export const trainService = {
  async getStatus() {
    return { ...providerStatus, type: 'train' };
  },

  async search(): Promise<Train[]> {
    return [];
  },

  async getById(id: string): Promise<Train | undefined> {
    return trains.find((t) => t.id === id);
  },

  async getStations() {
    return railwayStations;
  }
};

export const busService = {
  async getStatus() {
    return { ...providerStatus, type: 'bus' };
  },

  async search(): Promise<Bus[]> {
    return [];
  },

  async getById(id: string): Promise<Bus | undefined> {
    return buses.find((b) => b.id === id);
  },

  async getCities() {
    return busCities;
  }
};

