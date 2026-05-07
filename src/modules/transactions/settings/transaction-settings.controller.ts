import { Request, Response } from 'express';
import * as service from './transaction-settings.repository';

export const getLatestTransactionID = async (req: Request, res: Response) => {
    try {

        const params = req.params.transaction_type as string;
        const transaction_type = params.toUpperCase();
        const result = await service.readLatestTransactionID(transaction_type);
        if (result) {
            res.json({ latest_transaction_id: result });
        } else {
            res.status(404).json({ error: `No active transaction settings found for type ${transaction_type}` });
        }
    } catch (err) {
        console.error(`Error in getLatestTransactionID: ${err}`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getTransactionSettings = async (req: Request, res: Response) => {
    try {
        const filters: any = req.body;

        const result = await service.readTransactionSettings(filters);
        res.json(result);
    } catch (err) {
        console.error(`Error in getTransactionSettings: ${err}`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
};