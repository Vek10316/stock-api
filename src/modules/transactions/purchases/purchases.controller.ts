import { Request, Response } from 'express';
import * as service from './purchases.service';

export const readPurchasesTransactions = async (req: Request, res: Response) => {
    try {
        const result = await service.readPurchasesTransactions(req.body, true);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const insertPurchasesTransactions = async (req: Request, res: Response) => {
    try {
        const result = await service.insertPurchasesTranscation(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updatePurchasesTransactions = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await service.updatePurchasesTransaction(id, req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deletePurchasesTransactions = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await service.deletePurchasesTransaction(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};