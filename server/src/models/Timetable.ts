import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, Unique } from "typeorm";
import { Class } from "./Class";
import { Subject } from "./Subject";
import { Teacher } from "./Teacher";
import { Period } from "./Period";

@Entity()
@Unique(["class", "period", "dayOfWeek"])
export class Timetable {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Class, cls => cls.timetables, { onDelete: "CASCADE" })
  @JoinColumn({ name: "classId" })
  class!: Class;

  @ManyToOne(() => Subject, subject => subject.timetables, { onDelete: "CASCADE" })
  @JoinColumn({ name: "subjectId" })
  subject!: Subject;

  @ManyToOne(() => Teacher, teacher => teacher.timetables, { onDelete: "CASCADE" })
  @JoinColumn({ name: "teacherId" })
  teacher!: Teacher;

  @ManyToOne(() => Period, period => period.timetables, { onDelete: "CASCADE" })
  @JoinColumn({ name: "periodId" })
  period!: Period;

  @Column()
  dayOfWeek!: number; // 1-7 representing Monday-Sunday

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
