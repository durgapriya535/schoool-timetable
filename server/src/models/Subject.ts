import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Timetable } from "./Timetable";

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true, type: "varchar", length: 50 })
  code!: string;

  @Column({ nullable: true, type: "text" })
  description!: string;

  @Column({ default: 0 })
  weeklyHours!: number;

  @OneToMany(() => Timetable, timetable => timetable.subject)
  timetables!: Timetable[];
}
