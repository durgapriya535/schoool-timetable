import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Period } from "../models/Period";

export class PeriodController {
  private periodRepository = AppDataSource.getRepository(Period);

  async getAll(req: Request, res: Response) {
    try {
      const periods = await this.periodRepository.find();
      return res.json(periods);
    } catch (error) {
      console.error("Error fetching periods:", error);
      return res.status(500).json({ message: "Failed to fetch periods" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const period = await this.periodRepository.findOne({ where: { id } });
      
      if (!period) {
        return res.status(404).json({ message: "Period not found" });
      }
      
      return res.json(period);
    } catch (error) {
      console.error("Error fetching period:", error);
      return res.status(500).json({ message: "Failed to fetch period" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, startTime, endTime, dayOfWeek } = req.body;
      
      if (!name || !startTime || !endTime) {
        return res.status(400).json({ message: "Name, start time, and end time are required" });
      }
      
      const newPeriod = this.periodRepository.create({
        name,
        startTime,
        endTime,
        dayOfWeek
      });
      
      await this.periodRepository.save(newPeriod);
      return res.status(201).json(newPeriod);
    } catch (error) {
      console.error("Error creating period:", error);
      return res.status(500).json({ message: "Failed to create period" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, startTime, endTime, dayOfWeek } = req.body;
      
      const period = await this.periodRepository.findOne({ where: { id } });
      
      if (!period) {
        return res.status(404).json({ message: "Period not found" });
      }
      
      period.name = name || period.name;
      period.startTime = startTime || period.startTime;
      period.endTime = endTime || period.endTime;
      period.dayOfWeek = dayOfWeek !== undefined ? dayOfWeek : period.dayOfWeek;
      
      await this.periodRepository.save(period);
      return res.json(period);
    } catch (error) {
      console.error("Error updating period:", error);
      return res.status(500).json({ message: "Failed to update period" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.periodRepository.delete(id);
      
      if (result.affected === 0) {
        return res.status(404).json({ message: "Period not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting period:", error);
      return res.status(500).json({ message: "Failed to delete period" });
    }
  }
}
