import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Not } from "typeorm";
import { Timetable } from "../models/Timetable";
import { Class } from "../models/Class";
import { Subject } from "../models/Subject";
import { Teacher } from "../models/Teacher";
import { Period } from "../models/Period";

// Define an interface for conflict detection results
interface ConflictCheckResult {
  hasConflict: boolean;
  message: string;
  conflictingEntry?: Timetable;
}

// Define types for schedule slots
interface ClassScheduleSlot {
  periodId: number;
  periodName: string;
  subject: string | null;
  teacher: string | null;
}

interface ClassDaySchedule {
  day: string;
  slots: ClassScheduleSlot[];
}

interface ClassSchedule {
  className: string;
  days: string[];
  periods: string[];
  data: ClassDaySchedule[];
}

interface TeacherScheduleSlot {
  periodId: number;
  periodName: string;
  class: string | null;
  subject: string | null;
}

interface TeacherDaySchedule {
  day: string;
  slots: TeacherScheduleSlot[];
}

interface TeacherSchedule {
  teacherName: string;
  days: string[];
  periods: string[];
  data: TeacherDaySchedule[];
}

interface WeekdayScheduleSlot {
  periodId: number;
  periodName: string;
  class: string | null;
  subject: string | null;
  teacher: string | null;
}

interface WeekdaySchedule {
  weekday: string;
  dayNumber: number;
  periods: string[];
  classes: string[];
  slots: Record<string, WeekdayScheduleSlot[]>; // Key is className
}

export class TimetableController {
  private timetableRepository = AppDataSource.getRepository(Timetable);
  private classRepository = AppDataSource.getRepository(Class);
  private subjectRepository = AppDataSource.getRepository(Subject);
  private teacherRepository = AppDataSource.getRepository(Teacher);
  private periodRepository = AppDataSource.getRepository(Period);
  
  // Weekday names mapping
  private weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  /**
   * Check for teacher conflicts - ensures a teacher isn't assigned to multiple classes at the same time
   */
  private async checkTeacherConflict(
    teacherId: number, 
    periodId: number, 
    dayOfWeek: number, 
    excludeTimetableId?: number
  ): Promise<ConflictCheckResult> {
    try {
      const whereCondition: any = {
        teacher: { id: teacherId },
        period: { id: periodId },
        dayOfWeek
      };
      
      // If we're updating an existing entry, exclude it from the conflict check
      if (excludeTimetableId) {
        whereCondition.id = Not(excludeTimetableId);
      }
      
      const conflictingEntry = await this.timetableRepository.findOne({
        where: whereCondition,
        relations: ["teacher", "period", "class", "subject"]
      });
      
      if (conflictingEntry) {
        return {
          hasConflict: true,
          message: `Teacher is already assigned to ${conflictingEntry.class.name} for ${conflictingEntry.subject.name} during this period (${conflictingEntry.period.name}) on ${this.weekdays[dayOfWeek - 1]}`,
          conflictingEntry
        };
      }
      
      return {
        hasConflict: false,
        message: "No conflicts found"
      };
    } catch (error) {
      console.error("Error checking for teacher conflicts:", error);
      return {
        hasConflict: true,
        message: "Error checking for teacher conflicts"
      };
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const timetables = await this.timetableRepository.find({
        relations: ["class", "subject", "teacher", "period"]
      });
      return res.json(timetables);
    } catch (error) {
      console.error("Error fetching timetables:", error);
      return res.status(500).json({ message: "Failed to fetch timetables" });
    }
  }

  async getByClass(req: Request, res: Response) {
    try {
      const classId = parseInt(req.params.classId);
      const timetables = await this.timetableRepository.find({
        where: { class: { id: classId } },
        relations: ["class", "subject", "teacher", "period"],
        order: { dayOfWeek: "ASC" }
      });
      
      return res.json(timetables);
    } catch (error) {
      console.error("Error fetching timetables by class:", error);
      return res.status(500).json({ message: "Failed to fetch timetables" });
    }
  }

  async getByTeacher(req: Request, res: Response) {
    try {
      const teacherId = parseInt(req.params.teacherId);
      const timetables = await this.timetableRepository.find({
        where: { teacher: { id: teacherId } },
        relations: ["class", "subject", "teacher", "period"],
        order: { dayOfWeek: "ASC" }
      });
      
      return res.json(timetables);
    } catch (error) {
      console.error("Error fetching timetables by teacher:", error);
      return res.status(500).json({ message: "Failed to fetch timetables" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { classId, subjectId, teacherId, periodId, dayOfWeek } = req.body;
      
      if (!classId || !subjectId || !teacherId || !periodId || dayOfWeek === undefined) {
        return res.status(400).json({ 
          message: "Class ID, Subject ID, Teacher ID, Period ID, and Day of Week are required" 
        });
      }
      
      // Check if all entities exist
      const classEntity = await this.classRepository.findOne({ where: { id: classId } });
      const subject = await this.subjectRepository.findOne({ where: { id: subjectId } });
      const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
      const period = await this.periodRepository.findOne({ where: { id: periodId } });
      
      if (!classEntity || !subject || !teacher || !period) {
        return res.status(404).json({ message: "One or more related entities not found" });
      }
      
      // Check for class-period conflicts (a class can't have two subjects at the same time)
      const existingEntry = await this.timetableRepository.findOne({
        where: {
          class: { id: classId },
          period: { id: periodId },
          dayOfWeek
        },
        relations: ["class", "period", "subject"]
      });
      
      if (existingEntry) {
        return res.status(409).json({ 
          message: `Class ${classEntity.name} already has ${existingEntry.subject.name} scheduled during ${period.name} on ${this.weekdays[dayOfWeek - 1]}`,
          conflictType: "class",
          conflictingEntry: existingEntry
        });
      }
      
      // Check for teacher conflicts
      const teacherConflictCheck = await this.checkTeacherConflict(teacherId, periodId, dayOfWeek);
      
      if (teacherConflictCheck.hasConflict) {
        return res.status(409).json({ 
          message: teacherConflictCheck.message,
          conflictType: "teacher",
          conflictingEntry: teacherConflictCheck.conflictingEntry
        });
      }
      
      const newTimetable = this.timetableRepository.create({
        class: classEntity,
        subject,
        teacher,
        period,
        dayOfWeek
      });
      
      await this.timetableRepository.save(newTimetable);
      
      // Return with relations loaded
      const savedTimetable = await this.timetableRepository.findOne({
        where: { id: newTimetable.id },
        relations: ["class", "subject", "teacher", "period"]
      });
      
      return res.status(201).json(savedTimetable);
    } catch (error) {
      console.error("Error creating timetable entry:", error);
      return res.status(500).json({ message: "Failed to create timetable entry" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { subjectId, teacherId, dayOfWeek } = req.body;
      
      const timetable = await this.timetableRepository.findOne({
        where: { id },
        relations: ["class", "subject", "teacher", "period"]
      });
      
      if (!timetable) {
        return res.status(404).json({ message: "Timetable entry not found" });
      }
      
      // Update subject if provided
      if (subjectId) {
        const subject = await this.subjectRepository.findOne({ where: { id: subjectId } });
        if (!subject) {
          return res.status(404).json({ message: "Subject not found" });
        }
        timetable.subject = subject;
      }
      
      // Update teacher if provided
      if (teacherId) {
        const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
        if (!teacher) {
          return res.status(404).json({ message: "Teacher not found" });
        }
        
        // Check for teacher conflicts
        const dayToCheck = dayOfWeek !== undefined ? dayOfWeek : timetable.dayOfWeek;
        const teacherConflictCheck = await this.checkTeacherConflict(
          teacherId, 
          timetable.period.id, 
          dayToCheck, 
          id
        );
        
        if (teacherConflictCheck.hasConflict) {
          return res.status(409).json({ 
            message: teacherConflictCheck.message,
            conflictType: "teacher",
            conflictingEntry: teacherConflictCheck.conflictingEntry
          });
        }
        
        timetable.teacher = teacher;
      }
      
      // Update day of week if provided
      if (dayOfWeek !== undefined) {
        // If day changes, need to check for both class and teacher conflicts
        
        // Check for class conflicts with the new day
        const classConflict = await this.timetableRepository.findOne({
          where: {
            class: { id: timetable.class.id },
            period: { id: timetable.period.id },
            dayOfWeek,
            id: Not(id)
          },
          relations: ["class", "period", "subject"]
        });
        
        if (classConflict) {
          return res.status(409).json({ 
            message: `Class ${timetable.class.name} already has ${classConflict.subject.name} scheduled during ${timetable.period.name} on ${this.weekdays[dayOfWeek - 1]}`,
            conflictType: "class",
            conflictingEntry: classConflict
          });
        }
        
        // Check for teacher conflicts with the new day
        const teacherId = timetable.teacher.id;
        const teacherConflictCheck = await this.checkTeacherConflict(
          teacherId, 
          timetable.period.id, 
          dayOfWeek, 
          id
        );
        
        if (teacherConflictCheck.hasConflict) {
          return res.status(409).json({ 
            message: teacherConflictCheck.message,
            conflictType: "teacher",
            conflictingEntry: teacherConflictCheck.conflictingEntry
          });
        }
        
        timetable.dayOfWeek = dayOfWeek;
      }
      
      await this.timetableRepository.save(timetable);
      
      // Return updated timetable with relations
      const updatedTimetable = await this.timetableRepository.findOne({
        where: { id },
        relations: ["class", "subject", "teacher", "period"]
      });
      
      return res.json(updatedTimetable);
    } catch (error) {
      console.error("Error updating timetable entry:", error);
      return res.status(500).json({ message: "Failed to update timetable entry" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const timetable = await this.timetableRepository.findOne({
        where: { id }
      });
      
      if (!timetable) {
        return res.status(404).json({ message: "Timetable entry not found" });
      }
      
      await this.timetableRepository.remove(timetable);
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting timetable entry:", error);
      return res.status(500).json({ message: "Failed to delete timetable entry" });
    }
  }

  async getClassSchedule(req: Request, res: Response) {
    try {
      const classId = parseInt(req.params.classId);
      const classEntity = await this.classRepository.findOne({ where: { id: classId } });
      
      if (!classEntity) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      const timetables = await this.timetableRepository.find({
        where: { class: { id: classId } },
        relations: ["class", "subject", "teacher", "period"],
        order: { dayOfWeek: "ASC" }
      });
      
      // Transform data for visualization
      const schedule: ClassSchedule = {
        className: timetables.length > 0 ? timetables[0].class.name : classEntity.name,
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        periods: [],
        data: []
      };
      
      // Get all periods
      const periods = await this.periodRepository.find({ order: { startTime: "ASC" } });
      schedule.periods = periods.map(p => p.name);
      
      // Create the schedule grid
      for (let day = 1; day <= 7; day++) {
        const daySchedule: ClassDaySchedule = {
          day: schedule.days[day - 1],
          slots: []
        };
        
        for (const period of periods) {
          const entry = timetables.find(t => t.dayOfWeek === day && t.period.id === period.id);
          
          if (entry) {
            daySchedule.slots.push({
              periodId: period.id,
              periodName: period.name,
              subject: entry.subject.name,
              teacher: entry.teacher.name
            });
          } else {
            daySchedule.slots.push({
              periodId: period.id,
              periodName: period.name,
              subject: null,
              teacher: null
            });
          }
        }
        
        schedule.data.push(daySchedule);
      }
      
      return res.json(schedule);
    } catch (error) {
      console.error("Error generating class schedule:", error);
      return res.status(500).json({ message: "Failed to generate class schedule" });
    }
  }

  async getTeacherSchedule(req: Request, res: Response) {
    try {
      const teacherId = parseInt(req.params.teacherId);
      const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
      
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      const timetables = await this.timetableRepository.find({
        where: { teacher: { id: teacherId } },
        relations: ["class", "subject", "teacher", "period"],
        order: { dayOfWeek: "ASC" }
      });
      
      // Transform data for visualization
      const schedule: TeacherSchedule = {
        teacherName: timetables.length > 0 ? timetables[0].teacher.name : teacher.name,
        days: this.weekdays,
        periods: [],
        data: []
      };
      
      // Get all periods
      const periods = await this.periodRepository.find({ order: { startTime: "ASC" } });
      schedule.periods = periods.map(p => p.name);
      
      // Create the schedule grid
      for (let day = 1; day <= 7; day++) {
        const daySchedule: TeacherDaySchedule = {
          day: schedule.days[day - 1],
          slots: []
        };
        
        for (const period of periods) {
          const entry = timetables.find(t => t.dayOfWeek === day && t.period.id === period.id);
          
          if (entry) {
            daySchedule.slots.push({
              periodId: period.id,
              periodName: period.name,
              class: entry.class.name,
              subject: entry.subject.name
            });
          } else {
            daySchedule.slots.push({
              periodId: period.id,
              periodName: period.name,
              class: null,
              subject: null
            });
          }
        }
        
        schedule.data.push(daySchedule);
      }
      
      return res.json(schedule);
    } catch (error) {
      console.error("Error generating teacher schedule:", error);
      return res.status(500).json({ message: "Failed to generate teacher schedule" });
    }
  }
  
  async getWeekdaySchedule(req: Request, res: Response) {
    try {
      const dayOfWeek = parseInt(req.params.dayOfWeek);
      
      if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
        return res.status(400).json({ message: "Invalid day of week. Must be between 1 (Monday) and 7 (Sunday)" });
      }
      
      // Get all classes, periods, and timetable entries for the specified day
      const classes = await this.classRepository.find({ order: { name: "ASC" } });
      const periods = await this.periodRepository.find({ order: { startTime: "ASC" } });
      const timetables = await this.timetableRepository.find({
        where: { dayOfWeek },
        relations: ["class", "subject", "teacher", "period"],
        order: { period: { startTime: "ASC" } }
      });
      
      console.log(`Found ${timetables.length} entries for day ${dayOfWeek}`);
      
      // Transform data for visualization
      const schedule: WeekdaySchedule = {
        weekday: this.weekdays[dayOfWeek - 1],
        dayNumber: dayOfWeek,
        periods: periods.map(p => p.name),
        classes: classes.map(c => c.name),
        slots: {}
      };
      
      // Initialize slots for each class
      for (const classItem of classes) {
        schedule.slots[classItem.name] = [];
        
        for (const period of periods) {
          const entry = timetables.find(t => 
            t.class && t.class.id === classItem.id && 
            t.period && t.period.id === period.id
          );
          
          if (entry && entry.subject && entry.teacher) {
            schedule.slots[classItem.name].push({
              periodId: period.id,
              periodName: period.name,
              class: classItem.name,
              subject: entry.subject.name,
              teacher: entry.teacher.name
            });
          } else {
            schedule.slots[classItem.name].push({
              periodId: period.id,
              periodName: period.name,
              class: classItem.name,
              subject: null,
              teacher: null
            });
          }
        }
      }
      
      return res.json(schedule);
    } catch (error) {
      console.error("Error generating weekday schedule:", error);
      return res.status(500).json({ message: "Failed to generate weekday schedule" });
    }
  }
}
