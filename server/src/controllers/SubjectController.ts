import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Subject } from "../models/Subject";

export class SubjectController {
  private subjectRepository = AppDataSource.getRepository(Subject);

  async getAll(req: Request, res: Response) {
    try {
      const subjects = await this.subjectRepository.find();
      return res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return res.status(500).json({ message: "Failed to fetch subjects" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const subject = await this.subjectRepository.findOne({ where: { id } });
      
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      return res.json(subject);
    } catch (error) {
      console.error("Error fetching subject:", error);
      return res.status(500).json({ message: "Failed to fetch subject" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, code, description, weeklyHours } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Subject name is required" });
      }
      
      const newSubject = this.subjectRepository.create({
        name,
        code,
        description,
        weeklyHours: weeklyHours || 0
      });
      
      await this.subjectRepository.save(newSubject);
      return res.status(201).json(newSubject);
    } catch (error) {
      console.error("Error creating subject:", error);
      return res.status(500).json({ message: "Failed to create subject" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, code, description, weeklyHours } = req.body;
      
      const subject = await this.subjectRepository.findOne({ where: { id } });
      
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      subject.name = name || subject.name;
      subject.code = code !== undefined ? code : subject.code;
      subject.description = description !== undefined ? description : subject.description;
      subject.weeklyHours = weeklyHours !== undefined ? weeklyHours : subject.weeklyHours;
      
      await this.subjectRepository.save(subject);
      return res.json(subject);
    } catch (error) {
      console.error("Error updating subject:", error);
      return res.status(500).json({ message: "Failed to update subject" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.subjectRepository.delete(id);
      
      if (result.affected === 0) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting subject:", error);
      return res.status(500).json({ message: "Failed to delete subject" });
    }
  }
}
