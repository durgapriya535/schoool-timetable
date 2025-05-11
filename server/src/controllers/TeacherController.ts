import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Teacher } from "../models/Teacher";

export class TeacherController {
  private teacherRepository = AppDataSource.getRepository(Teacher);

  async getAll(req: Request, res: Response) {
    try {
      const teachers = await this.teacherRepository.find();
      return res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return res.status(500).json({ message: "Failed to fetch teachers" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const teacher = await this.teacherRepository.findOne({ where: { id } });
      
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      return res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      return res.status(500).json({ message: "Failed to fetch teacher" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, phone, specialization, maxWeeklyHours } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Teacher name is required" });
      }
      
      const newTeacher = this.teacherRepository.create({
        name,
        phone,
        specialization,
        maxWeeklyHours: maxWeeklyHours || 0
      });
      
      await this.teacherRepository.save(newTeacher);
      return res.status(201).json(newTeacher);
    } catch (error) {
      console.error("Error creating teacher:", error);
      return res.status(500).json({ message: "Failed to create teacher" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, phone, specialization, maxWeeklyHours } = req.body;
      
      const teacher = await this.teacherRepository.findOne({ where: { id } });
      
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      teacher.name = name || teacher.name;
      teacher.phone = phone !== undefined ? phone : teacher.phone;
      teacher.specialization = specialization !== undefined ? specialization : teacher.specialization;
      teacher.maxWeeklyHours = maxWeeklyHours !== undefined ? maxWeeklyHours : teacher.maxWeeklyHours;
      
      await this.teacherRepository.save(teacher);
      return res.json(teacher);
    } catch (error) {
      console.error("Error updating teacher:", error);
      return res.status(500).json({ message: "Failed to update teacher" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.teacherRepository.delete(id);
      
      if (result.affected === 0) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      return res.status(500).json({ message: "Failed to delete teacher" });
    }
  }
}
