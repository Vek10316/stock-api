import { Router } from "express";
import * as controller from "./expenses.controller";

const router = Router();

router.post("/", controller.insertNewExpenseRecord);
router.get("/:id", controller.readExpenseRecordByID);
router.patch("/:id", controller.updateExpenseRecord);
router.get("/", controller.readAllExpenses);

export default router;