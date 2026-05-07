import { Router } from 'express';
import * as controller from './stock.controller';

const router = Router();

router.post('/inventory/', controller.createStock);
router.get('/inventory/', controller.getStock);
router.patch('/inventory/:id', controller.updateStock);
router.delete('/inventory/:id', controller.deleteStock);

//Movement
router.post('/movement/', controller.insertStockMovement);
router.get('/movement/', controller.getStockMovement);
router.patch('/movement/:id', controller.updateStockMovement);
router.delete('/movement/:id', controller.deleteStockMovement);

//Pricing
router.get('/pricing/', controller.readStockPricingHistory);
router.patch('/pricing/', controller.updateStockPricing);
router.delete('/pricing/:id', controller.deleteStockPricing);

export default router;