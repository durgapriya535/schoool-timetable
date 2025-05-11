import api from './api';
import { Teacher } from '../types';

export const teacherService = {
  getAll: async (): Promise<Teacher[]> => {
    const response = await api.get('/teachers');
    return response.data;
  },

  getById: async (id: number): Promise<Teacher> => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (teacherData: Omit<Teacher, 'id'>): Promise<Teacher> => {
    const response = await api.post('/teachers', teacherData);
    return response.data;
  },

  update: async (id: number, teacherData: Partial<Teacher>): Promise<Teacher> => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/teachers/${id}`);
  }
};
