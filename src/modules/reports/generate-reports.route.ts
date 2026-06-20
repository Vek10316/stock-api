import * as controller from "./generate-reports.controller";
import { Router } from "express";

const router = Router();

router.get("/purchases/", controller.readPurchaseTotalsByDateRange);

export default router;