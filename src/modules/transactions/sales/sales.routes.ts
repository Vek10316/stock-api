import { Router } from 'express';
import * as controller from './sales.controller';

const router = Router();

router.post("/", controller.insertSalesTransactions);
router.get("/", controller.readSalesTransactions);
router.patch("/:id", controller.updateSalesTransactions);
router.delete("/:id", controller.deleteSalesTransactions);

export default router;