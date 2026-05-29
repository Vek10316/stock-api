import { Request, Response } from 'express';
import * as service from './purchases.service';
import { PurchasesTransactions } from './purchases.types';
import { TransactionDetails } from '../shared.transactions.types';
import { Supplier, SupplierVehicles } from '../../clients/supplier/supplier.types';
import { readSupplierName } from '../../clients/supplier/supplier.repository';

export const readPurchasesTransactions = async (req: Request, res: Response) => {
    try {
        const result = await service.readPurchasesTransactions(req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const insertPurchasesTransactions = async (req: Request, res: Response) => {
    try {
        const json = await JSON.parse(JSON.stringify(req.body));
        const header = json.header as Omit<PurchasesTransactions, "transact_id">;
        const details = json.details as Omit<TransactionDetails, "detail_id">[];
        const result = await service.insertPurchasesTranscation(header, details);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updatePurchasesTransactions = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const json = await JSON.parse(JSON.stringify(req.body));
        console.log("New update purchase request: ", json);
        const header = json.header as Partial<Omit<PurchasesTransactions, "transact_id">>;
        const details = json.details as Omit<TransactionDetails, "detail_id">[];
        const result = await service.updatePurchasesTransaction(id, header, details);
        res.json(result);
    } catch (err: any) {
        console.error(`Something went wrong!`, err);
        res.status(500).json({ error: err.message });
    }
};

export const deletePurchasesTransactions = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await service.deletePurchasesTransaction(id);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const readFullPurchaseDetails = async (req: Request, res: Response) => {
    try {
        const result = await service.readFullPurchaseDetails(req.body);
        res.json(result);
    } catch (err: any) { 
        res.status(500).json({ error: err.message });
    }
};

export const readPurchasesDetails = async (req: Request, res: Response) => {
    try {
        const transact_id = req.params.id as string;
        const result = await service.readPurchasesDetails(transact_id);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}