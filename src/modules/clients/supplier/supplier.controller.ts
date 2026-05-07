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

export const createSupplier = async (req: Request, res: Response) => {
    try {
        const result = await service.createSupplier(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateSupplier = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || id.trimEnd() === "") {
            return res.status(400).json({ error: `Invalid ID` });
        }
        const result = await service.updateSupplier(id, req.body);
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
        const result = await service.updateSupplierVehicle(id, req.body);
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
        const deleted = await service.deleteSupplierVehicle(id);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}