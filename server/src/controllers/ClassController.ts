import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Class } from "../models/Class";

export class ClassController {
  private classRepository = AppDataSource.getRepository(Class);

  async getAll(req: Request, res: Response) {
    try {
      const classes = await this.classRepository.find();
      return res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      return res.status(500).json({ message: "Failed to fetch classes" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const classEntity = await this.classRepository.findOne({ where: { id } });
      
      if (!classEntity) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      return res.json(classEntity);
    } catch (error) {
      console.error("Error fetching class:", error);
      return res.status(500).json({ message: "Failed to fetch class" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, grade, section, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Class name is required" });
      }
      
      const newClass = this.classRepository.create({
        name,
        grade,
        section,
        description
      });
      
      await this.classRepository.save(newClass);
      return res.status(201).json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      return res.status(500).json({ message: "Failed to create class" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, grade, section, description } = req.body;
      
      const classEntity = await this.classRepository.findOne({ where: { id } });
      
      if (!classEntity) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      classEntity.name = name || classEntity.name;
      classEntity.grade = grade !== undefined ? grade : classEntity.grade;
      classEntity.section = section !== undefined ? section : classEntity.section;
      classEntity.description = description !== undefined ? description : classEntity.description;
      
      await this.classRepository.save(classEntity);
      return res.json(classEntity);
    } catch (error) {
      console.error("Error updating class:", error);
      return res.status(500).json({ message: "Failed to update class" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.classRepository.delete(id);
      
      if (result.affected === 0) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting class:", error);
      return res.status(500).json({ message: "Failed to delete class" });
    }
  }
}
