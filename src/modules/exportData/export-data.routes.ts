import * as bukkuController from "./export-data.controller";
import { Router } from "express";

const router = Router();

router.get("/bukku-suppliers", bukkuController.exportSuppliersXlsx);
router.get("/bukku-purchases", bukkuController.exportPurchasesXlsx);
router.get("/bukku-buyers", bukkuController.exportBuyersXlsx);
router.get("/bukku-sales", bukkuController.exportSalesXlsx);
export default router;