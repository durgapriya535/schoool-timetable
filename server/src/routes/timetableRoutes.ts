import { Router } from "express";
import { TimetableController } from "../controllers/TimetableController";

const router = Router();
const timetableController = new TimetableController();

router.get("/", timetableController.getAll.bind(timetableController));
router.get("/class/:classId", timetableController.getByClass.bind(timetableController));
router.get("/teacher/:teacherId", timetableController.getByTeacher.bind(timetableController));
router.get("/class/:classId/schedule", timetableController.getClassSchedule.bind(timetableController));
router.get("/teacher/:teacherId/schedule", timetableController.getTeacherSchedule.bind(timetableController));
router.get("/weekday/:dayOfWeek", timetableController.getWeekdaySchedule.bind(timetableController));
router.post("/", timetableController.create.bind(timetableController));
router.put("/:id", timetableController.update.bind(timetableController));
router.delete("/:id", timetableController.delete.bind(timetableController));

export default router;
