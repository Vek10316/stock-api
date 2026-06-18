import { Request, Response } from 'express';
import * as service from './sales.service';
import { SalesTransactions } from './sales.types';
import { TransactionDetails } from '../shared.transactions.types';

export const readSalesTransactions = async (req: Request, res: Response) => {
    try {
        const result = await service.readSalesTransactions(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const insertSalesTransactions = async (req: Request, res: Response) => {
    try {
        const json = await JSON.parse(JSON.stringify(req.body));
        const header = json.header as Omit<SalesTransactions, "transact_id">;
        const details = json.details as Omit<TransactionDetails, "detail_id">[];
        const result = await service.insertSalesTranscation(header, details);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateSalesTransactions = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const json = await JSON.parse(JSON.stringify(req.body));
        const header = json.header as Partial<Omit<SalesTransactions, "transact_id">>;
        const details = json.details as Omit<TransactionDetails, "detail_id">[];
        const result = await service.updateSalesTransaction(id, header, details);
        res.json(result);
    } catch (err: any) {
        console.error(`Something went wrong!`, err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteSalesTransactions = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await service.deleteSalesTransaction(id);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const readFullSaleDetails = async (req: Request, res: Response) => {
    try {
        const result = await service.readFullSaleDetails(req.body);
        res.json(result);
    } catch (err: any) { 
        res.status(500).json({ error: err.message });
    }
};

export const readSalesDetails = async (req: Request, res: Response) => {
    try {
        const transact_id = req.params.id as string;
        const result = await service.readSalesDetails(transact_id);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}