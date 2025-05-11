import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Timetable } from "./Timetable";

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  // Email field removed as requested

  @Column({ nullable: true, type: "varchar", length: 20 })
  phone!: string;

  @Column({ nullable: true, type: "varchar", length: 100 })
  specialization!: string;

  @Column({ default: 0 })
  maxWeeklyHours!: number;

  @OneToMany(() => Timetable, timetable => timetable.teacher)
  timetables!: Timetable[];
}
