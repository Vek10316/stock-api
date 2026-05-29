import { Request, Response } from 'express';
import * as service from './supplier.service';

export const getSuppliers = async (req: Request, res: Response) => {
    try {
        const result = await service.readSuppliers(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getSupplierByID = async (req: Request, res: Response) => {
    try {
        const supplier_id = req.params.id as string;
        const result = (await service.readSuppliers({supplier_id}))[0];
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const createSupplier = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        console.log("New insert supplier request: ", body);
        const supplier = body.supplier;
        const vehicles = body.vehicles;
        const result = await service.createSupplier(supplier, vehicles);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateSupplier = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const body = req.body;
        const supplier = body.supplier;
        const vehicles = body.vehicles;
        if (!id || id.trimEnd() === "") {
            return res.status(400).json({ error: `Invalid ID` });
        }
        const result = await service.updateSupplier(id, supplier, vehicles);
        res.status(200).json({result});
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const deleteSupplier = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || id.trimEnd() === "") {
            return res.status(400).json({ error: `Invalid ID` });
        }
        const deleted = await service.deleteSupplier(id);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const getSupplierVehicles = async (req: Request, res: Response) => {
    try {
        const result = await service.readSupplierVehicles(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getVehiclesBySupplierID = async (req: Request, res: Response) => {
    try {
        const supplier_id = req.params.id as string;
        const result = await service.readSupplierVehicles({supplier_id});
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const insertSupplierVehicle = async (req: Request, res: Response) => {
    try {
        const result = await service.insertSupplierVehicle(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateSupplierVehicle = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || id.trimEnd() === "") {
            return res.status(400).json({ error: `Invalid ID` });
        }
        const result = await service.updateSupplierVehicle(Number.parseInt(id), req.body);
        res.status(200).json({result});
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const deleteSupplierVehicle = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || id.trimEnd() === "") {
            return res.status(400).json({ error: `Invalid ID` });
        }
        const deleted = await service.deleteSupplierVehicle(Number.parseInt(id));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const readSupplierWithVehicles = async (req: Request, res: Response) => {
    try {
        const result = await service.readSupplierWithVehicles(req.body);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}