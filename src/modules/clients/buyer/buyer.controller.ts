import { Request, Response } from 'express';
import * as service from './buyer.service';

export const getBuyers = async (req: Request, res: Response) => {
    try {
        const result = await service.readBuyers(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createBuyer = async (req: Request, res: Response) => {
    try {
        const result = await service.createBuyer(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateBuyer = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || id.trimEnd() === "") {
            return res.status(400).json({ error: `Invalid ID` });
        }
        const result = await service.updateBuyer(id, req.body);
        res.status(200).json({result});
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const deleteBuyer = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || id.trimEnd() === "") {
            return res.status(400).json({ error: `Invalid ID` });
        }
        const deleted = await service.deleteBuyer(id);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const getBuyerVehicles = async (req: Request, res: Response) => {
    try {
        const result = await service.readBuyerVehicles(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const insertBuyerVehicle = async (req: Request, res: Response) => {
    try {
        const result = await service.insertBuyerVehicle(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateBuyerVehicle = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || id.trimEnd() === "") {
            return res.status(400).json({ error: `Invalid ID` });
        }
        const result = await service.updateBuyerVehicle(id, req.body);
        res.status(200).json({result});
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const deleteBuyerVehicle = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || id.trimEnd() === "") {
            return res.status(400).json({ error: `Invalid ID` });
        }
        const deleted = await service.deleteBuyerVehicle(id);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}