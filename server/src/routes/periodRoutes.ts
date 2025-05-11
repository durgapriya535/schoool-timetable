import { Router } from "express";
import { PeriodController } from "../controllers/PeriodController";

const router = Router();
const periodController = new PeriodController();

router.get("/", periodController.getAll.bind(periodController));
router.get("/:id", periodController.getById.bind(periodController));
router.post("/", periodController.create.bind(periodController));
router.put("/:id", periodController.update.bind(periodController));
router.delete("/:id", periodController.delete.bind(periodController));

export default router;
