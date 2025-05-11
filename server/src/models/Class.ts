import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Timetable } from "./Timetable";

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true, type: "varchar", length: 20 })
  grade!: string;

  @Column({ nullable: true, type: "varchar", length: 10 })
  section!: string;

  @Column({ nullable: true, type: "text" })
  description!: string;

  @OneToMany(() => Timetable, timetable => timetable.class)
  timetables!: Timetable[];
}
