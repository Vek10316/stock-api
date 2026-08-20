import { Router } from 'express';
import * as controller from './sales.controller';

const router = Router();

router.post("/", controller.insertSalesTransactions);
router.get("/details/:id", controller.readSalesDetails);
router.get("/read-full-details/:id", controller.readFullSaleDetails);
router.get("/list", controller.listSalesTransactions);
router.get("/", controller.readSalesTransactions);
router.patch("/:id", controller.updateSalesTransactions);
router.delete("/:id", controller.deleteSalesTransactions);

export default router;