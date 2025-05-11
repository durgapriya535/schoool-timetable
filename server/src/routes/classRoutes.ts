import { Router } from "express";
import { ClassController } from "../controllers/ClassController";

const router = Router();
const classController = new ClassController();

router.get("/", classController.getAll.bind(classController));
router.get("/:id", classController.getById.bind(classController));
router.post("/", classController.create.bind(classController));
router.put("/:id", classController.update.bind(classController));
router.delete("/:id", classController.delete.bind(classController));

export default router;
