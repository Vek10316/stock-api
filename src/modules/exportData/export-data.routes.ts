import * as bukkuController from "./export-data.controller";
import { Router } from "express";

const router = Router();

router.get("/bukku-suppliers", bukkuController.exportBukkuSuppliersXlsx);
router.get("/bukku-purchases-bill", bukkuController.exportBukkuPurchasesBillXlsx);
router.get("/bukku-buyers", bukkuController.exportBukkuBuyersXlsx);
router.get("/bukku-sales-bill", bukkuController.exportBukkuSalesBillXlsx);
router.get("/preview/bukku-suppliers", bukkuController.previewBukkuSuppliers);
router.get("/preview/bukku-purchases-bill", bukkuController.previewBukkuPurchasesBill);
router.get("/preview/bukku-buyers", bukkuController.previewBukkuBuyers);
router.get("/preview/bukku-sales-bill", bukkuController.previewBukkuSalesBill);
export default router;