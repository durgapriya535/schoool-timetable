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

  @Column({ nullable: true, type: "varchar", length: 7, default: "#3788d8" })
  color!: string;

  @OneToMany(() => Timetable, timetable => timetable.subject)
  timetables!: Timetable[];
}
