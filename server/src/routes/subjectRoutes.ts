import { Router } from "express";
import { SubjectController } from "../controllers/SubjectController";

const router = Router();
const subjectController = new SubjectController();

router.get("/", subjectController.getAll.bind(subjectController));
router.get("/:id", subjectController.getById.bind(subjectController));
router.post("/", subjectController.create.bind(subjectController));
router.put("/:id", subjectController.update.bind(subjectController));
router.delete("/:id", subjectController.delete.bind(subjectController));

export default router;
