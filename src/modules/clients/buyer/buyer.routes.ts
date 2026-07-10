import { Router } from 'express';
import * as controller from './buyer.controller';

const router = Router();

router.get('/list', controller.listBuyers)

router.post('/vehicles/', controller.insertBuyerVehicle);
router.get('/vehicles/:id', controller.getVehiclesByBuyerID);
router.get('/vehicles/', controller.getBuyerVehicles);

router.patch('/vehicles/:id', controller.updateBuyerVehicle);
router.delete('/vehicles/:id', controller.deleteBuyerVehicle);
router.post('/', controller.createBuyer);
router.get('/:id', controller.getBuyerByID);
router.get('/', controller.getBuyers);
router.patch('/:id', controller.updateBuyer);
router.delete('/:id', controller.deleteBuyer);

export default router;