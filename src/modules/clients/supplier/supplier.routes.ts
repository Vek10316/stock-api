import { Router } from 'express';
import * as controller from './supplier.controller';

const router = Router();

//Vehicles
router.post('/vehicles/', controller.insertSupplierVehicle);
router.get('/vehicles/', controller.getSupplierVehicles);
router.patch('/vehicles/:id', controller.updateSupplierVehicle);
router.delete('/vehicles/:id', controller.deleteSupplierVehicle);

router.post('/', controller.createSupplier);
router.get('/', controller.getSuppliers);
router.patch('/:id', controller.updateSupplier);
router.delete('/:id', controller.deleteSupplier);

export default router;