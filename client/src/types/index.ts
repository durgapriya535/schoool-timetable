// Class type definition
export interface Class {
  id: number;
  name: string;
  grade?: string;
  section?: string;
  description?: string;
}

// Subject type definition
export interface Subject {
  id: number;
  name: string;
  code?: string;
  description?: string;
  weeklyHours: number;
  color?: string;
}

// Teacher type definition
export interface Teacher {
  id: number;
  name: string;
  phone?: string;
  specialization?: string;
  maxWeeklyHours: number;
}

// Period type definition
export interface Period {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  dayOfWeek?: number;
}

// Timetable entry type definition
export interface TimetableEntry {
  id: number;
  class: Class;
  subject: Subject;
  teacher: Teacher;
  period: Period;
  dayOfWeek: number;
  createdAt: string;
  updatedAt: string;
}

// Alias for Timetable type to match backend naming
export interface Timetable extends TimetableEntry {}

// Class schedule slot type
export interface ScheduleSlot {
  periodId: number;
  periodName: string;
  subject: string | null;
  teacher: string | null;
  class?: string | null;
}

// Day schedule type
export interface DaySchedule {
  day: string;
  slots: ScheduleSlot[];
}

// Class schedule type
export interface ClassSchedule {
  className: string;
  days: string[];
  periods: string[];
  data: DaySchedule[];
}

// Teacher schedule type
export interface TeacherSchedule {
  teacherName: string;
  days: string[];
  periods: string[];
  data: DaySchedule[];
}

// Weekday schedule slot type
export interface WeekdayScheduleSlot {
  periodId: number;
  periodName: string;
  class: string | null;
  classId: number | null; // Added classId field
  subject: string | null;
  teacher: string | null;
}

// Weekday schedule type
export interface WeekdaySchedule {
  weekday: string;
  dayNumber: number;
  periods: string[];
  classes: string[];
  slots: Record<string, WeekdayScheduleSlot[]>; // Key is className
}
