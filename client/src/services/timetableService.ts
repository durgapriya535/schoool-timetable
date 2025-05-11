import api from './api';
import { TimetableEntry, ClassSchedule, TeacherSchedule, WeekdaySchedule } from '../types';

export const timetableService = {
  getAll: async (): Promise<TimetableEntry[]> => {
    const response = await api.get('/timetables');
    return response.data;
  },

  getByClass: async (classId: number): Promise<TimetableEntry[]> => {
    const response = await api.get(`/timetables/class/${classId}`);
    return response.data;
  },

  getByTeacher: async (teacherId: number): Promise<TimetableEntry[]> => {
    const response = await api.get(`/timetables/teacher/${teacherId}`);
    return response.data;
  },

  getClassSchedule: async (classId: number): Promise<ClassSchedule> => {
    const response = await api.get(`/timetables/class/${classId}/schedule`);
    return response.data;
  },

  getTeacherSchedule: async (teacherId: number): Promise<TeacherSchedule> => {
    const response = await api.get(`/timetables/teacher/${teacherId}/schedule`);
    return response.data;
  },

  create: async (timetableData: {
    classId: number;
    subjectId: number;
    teacherId: number;
    periodId: number;
    dayOfWeek: number;
  }): Promise<TimetableEntry> => {
    const response = await api.post('/timetables', timetableData);
    return response.data;
  },

  update: async (
    id: number,
    timetableData: {
      subjectId?: number;
      teacherId?: number;
      dayOfWeek?: number;
    }
  ): Promise<TimetableEntry> => {
    const response = await api.put(`/timetables/${id}`, timetableData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/timetables/${id}`);
  },
  
  getWeekdaySchedule: async (dayOfWeek: number): Promise<WeekdaySchedule> => {
    const response = await api.get(`/timetables/weekday/${dayOfWeek}`);
    return response.data;
  }
};
