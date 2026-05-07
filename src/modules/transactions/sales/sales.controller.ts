import { Request, Response } from 'express';
import * as service from './sales.service';

export const readSalesTransactions = async (req: Request, res: Response) => {
    try {
        const result = await service.readSalesTransactions(req.body, true);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const insertSalesTransactions = async (req: Request, res: Response) => {
    try {
        const result = await service.insertSalesTranscation(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateSalesTransactions = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await service.updateSalesTransaction(id, req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteSalesTransactions = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await service.deleteSalesTransaction(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};