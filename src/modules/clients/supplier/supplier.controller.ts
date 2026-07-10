import { Request, Response } from 'express';
import * as service from './supplier.service';

export const getSuppliers = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const pageNo = Number.parseInt(query.pageNo as string);
        const pageSize = Number.parseInt(query.pageSize as string);
        const search = query.search as string;
        const result = await service.readSuppliers({}, {
            pagination: {
                pageSize,
                pageNumber: pageNo,
            },
            sort: {
                column: "supplier_id",
                order: "DESC",
            },
        }, search);
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
        const query = req.query;
        const pageNo = Number.parseInt(query.pageNo as string);
        const pageSize = Number.parseInt(query.pageSize as string);
        const search = query.search as string;
        const result = await service.readSupplierVehicles(undefined, {
            pagination: {
                pageSize,
                pageNumber: pageNo,
            },
            sort: {
                column: "vehicle_id"
            }
        }, search);
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

export const listSuppliers = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const pageNo = query.pageNo !== undefined ? Number.parseInt(query.pageNo as string) : 1;
        const pageSize = query.pageSize !== undefined ? Number.parseInt(query.pageSize as string) : 100;
        const search = query.search as string;
        const result = await service.listSuppliers({}, {
            pagination: {
                pageSize,
                pageNumber: pageNo,
            },
            sort: {
                column: "supplier_id",
                order: "DESC",
            },
        }, search);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};