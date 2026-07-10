import { Router } from 'express';
import * as controller from './purchases.controller';

const router = Router();

router.post("/", controller.insertPurchasesTransactions);
router.get("/details/:id", controller.readPurchasesDetails);
router.get("/read-full-details/:id", controller.readFullPurchaseDetails);
router.get("/list", controller.listPurchasesTransactions);
router.get("/", controller.readPurchasesTransactions);
router.patch("/:id", controller.updatePurchasesTransactions);
router.delete("/:id", controller.deletePurchasesTransactions);

export default router;