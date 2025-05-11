import api from './api';
import { Period } from '../types';

export const periodService = {
  getAll: async (): Promise<Period[]> => {
    const response = await api.get('/periods');
    return response.data;
  },

  getById: async (id: number): Promise<Period> => {
    const response = await api.get(`/periods/${id}`);
    return response.data;
  },

  create: async (periodData: Omit<Period, 'id'>): Promise<Period> => {
    const response = await api.post('/periods', periodData);
    return response.data;
  },

  update: async (id: number, periodData: Partial<Period>): Promise<Period> => {
    const response = await api.put(`/periods/${id}`, periodData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/periods/${id}`);
  }
};
