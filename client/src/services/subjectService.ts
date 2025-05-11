import api from './api';
import { Subject } from '../types';

export const subjectService = {
  getAll: async (): Promise<Subject[]> => {
    const response = await api.get('/subjects');
    return response.data;
  },

  getById: async (id: number): Promise<Subject> => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  create: async (subjectData: Omit<Subject, 'id'>): Promise<Subject> => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  update: async (id: number, subjectData: Partial<Subject>): Promise<Subject> => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  }
};
