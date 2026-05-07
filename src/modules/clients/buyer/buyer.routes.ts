import { Router } from 'express';
import * as controller from './buyer.controller';

const router = Router();

//Vehicles
router.post('/vehicles/', controller.insertBuyerVehicle);
router.get('/vehicles/', controller.getBuyerVehicles);
router.patch('/vehicles/:id', controller.updateBuyerVehicle);
router.delete('/vehicles/:id', controller.deleteBuyerVehicle);

router.post('/', controller.createBuyer);
router.get('/', controller.getBuyers);
router.patch('/:id', controller.updateBuyer);
router.delete('/:id', controller.deleteBuyer);


export default router;