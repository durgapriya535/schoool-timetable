import api from './api';
import { Class } from '../types';

export const classService = {
  getAll: async (): Promise<Class[]> => {
    const response = await api.get('/classes');
    return response.data;
  },

  getById: async (id: number): Promise<Class> => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  create: async (classData: Omit<Class, 'id'>): Promise<Class> => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  update: async (id: number, classData: Partial<Class>): Promise<Class> => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/classes/${id}`);
  }
};
