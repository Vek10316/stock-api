import { Request, Response } from 'express';
import * as service from './buyer.service';

export const getBuyers = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const pageNo = Number.parseInt(query.pageNo as string);
        const pageSize = Number.parseInt(query.pageSize as string);
        const search = query.search as string;
        const result = await service.readBuyers({}, {
            pagination: {
                pageSize,
                pageNumber: pageNo,
            },
            sort: {
                column: "buyer_id",
                direction: "DESC",
            },
        }, search);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getBuyerByID = async (req: Request, res: Response) => {
    try {
        const buyer_id = req.params.id as string;
        const result = (await service.readBuyers({buyer_id}))[0];
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const createBuyer = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        console.log("New insert buyer request: ", body);
        const buyer = body.buyer;
        const vehicles = body.vehicles;
        const result = await service.createBuyer(buyer, vehicles);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateBuyer = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const body = req.body;
        const buyer = body.buyer;
        const vehicles = body.vehicles;
        if (!id || id.trimEnd() === "") {
            return res.status(400).json({ error: `Invalid ID` });
        }
        const result = await service.updateBuyer(id, buyer, vehicles);
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
        const query = req.query;
        const pageNo = Number.parseInt(query.pageNo as string);
        const pageSize = Number.parseInt(query.pageSize as string);
        const search = query.search as string;
        const result = await service.readBuyerVehicles(undefined, {
            pagination: {
                pageSize,
                pageNumber: pageNo,
            }
        }, search);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getVehiclesByBuyerID = async (req: Request, res: Response) => {
    try {
        const buyer_id = req.params.id as string;
        const result = await service.readBuyerVehicles({buyer_id});
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

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
        const result = await service.updateBuyerVehicle(Number.parseInt(id), req.body);
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
        const deleted = await service.deleteBuyerVehicle(Number.parseInt(id));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const readBuyerWithVehicles = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const pageNo = Number.parseInt(query.pageNo as string);
        const pageSize = Number.parseInt(query.pageSize as string);
        const search = query.search as string;
        const result = await service.readBuyerWithVehicles(undefined, {
            pagination: {
                pageSize,
                pageNumber: pageNo,
            }
        }, search);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}