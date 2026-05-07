import { Router } from 'express';
import * as controller from './transaction-settings.controller';

const router = Router();

router.get("/latest-transaction-id/:transaction_type", controller.getLatestTransactionID);
router.get("/", controller.getTransactionSettings);

export default router;