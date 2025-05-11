import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Timetable } from "./Timetable";

@Entity()
export class Period {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  startTime!: string;

  @Column()
  endTime!: string;

  @Column({ nullable: true, type: "int" })
  dayOfWeek!: number; // 1-7 representing Monday-Sunday

  @OneToMany(() => Timetable, timetable => timetable.period)
  timetables!: Timetable[];
}
