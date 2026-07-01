import { Request, Response } from 'express';
import * as service from './purchases.service';
import { PurchasesTransactions } from './purchases.types';
import { TransactionDetails } from '../shared.transactions.types';

export const readPurchasesTransactions = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const pageSize = Number.parseFloat(query.pageSize as string);
        const pageNo = Number.parseFloat(query.pageNo as string);
        const search = query.search as string;
        const result = await service.listPurchasesTransactions({}, {
            sort: {
                column: "transact_id",
                direction: "DESC",
            },
            pagination: {
                pageSize,
                pageNumber: pageNo,
            },
        }, search);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const insertPurchasesTransactions = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const header = body.header;
        const details = body.details;
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
        const id = req.params.id as string;
        const query = req.query;
        const search = query.search as string;
        const result = await service.readFullPurchaseDetails({transact_id: id}, undefined, search);
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