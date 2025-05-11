import { Router } from "express";
import { TeacherController } from "../controllers/TeacherController";

const router = Router();
const teacherController = new TeacherController();

router.get("/", teacherController.getAll.bind(teacherController));
router.get("/:id", teacherController.getById.bind(teacherController));
router.post("/", teacherController.create.bind(teacherController));
router.put("/:id", teacherController.update.bind(teacherController));
router.delete("/:id", teacherController.delete.bind(teacherController));

export default router;
