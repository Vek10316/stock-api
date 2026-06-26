import * as controller from "./reports.controller";
import { Router } from "express";

const router = Router();

router.get("/monthly-purchases/", controller.readMonthlyPurchsaesTotal);
router.get("/monthly-purchased-items/", controller.readMonthlyPurchasedItems);
router.get("/monthly-expenses/", controller.readMonthlyExpenses);

export default router;