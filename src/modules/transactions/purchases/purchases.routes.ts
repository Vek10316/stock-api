import { Router } from 'express';
import * as controller from './purchases.controller';

const router = Router();

router.post("/", controller.insertPurchasesTransactions);
router.get("/", controller.readPurchasesTransactions);
router.patch("/:id", controller.updatePurchasesTransactions);
router.delete("/:id", controller.deletePurchasesTransactions);

export default router;