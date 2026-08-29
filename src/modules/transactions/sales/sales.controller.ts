import { Request, Response } from 'express';
import * as service from './sales.service';
import { SalesTransactions } from './sales.types';
import { TransactionDetails } from '../shared.transactions.types';
import { SqlClauseOptions } from '../../../utils/globalHelpers';

export const readSalesTransactions = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : 100;
        const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : 1;
        const search = query.search as string;
        const result = await service.readSalesTransactions({}, {
            sort: {
                column: "transact_id",
                order: "DESC",
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

export const listSalesTransactions = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : 100;
        const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : 1;
        const search = query.search as string;
        const result = await service.listSalesTransactions({}, {
            sort: {
                column: "transact_id",
                order: "DESC",
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

export const insertSalesTransactions = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const header = body.header;
        const details = body.details;
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
        const id = req.params.id as string;
        const query = req.query;
        const search = query.search as string;
        const result = await service.readFullSaleDetails({transact_id: id}, undefined, search);
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
};

export const readSalesCount = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const search = query.search !== undefined ? query.search as string : undefined;
        const startDate = query.startDate !== undefined ? new Date(query.startDate as string + " 00:00:00") : undefined;
        const endDate = query.endDate !== undefined ? new Date(query.endDate as string + " 23:59:59") : undefined;
        const sqlClauseOptions: SqlClauseOptions = {
            dateRange: startDate !== undefined && endDate !== undefined ? {
                column: "transact_date",
                startDate,
                endDate
            } : undefined
        };
        const result = await service.readSalesCount({}, sqlClauseOptions, search)
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        throw err;
    }
};

export const readSalesDetailsCount = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const search = query.search !== undefined ? query.search as string : undefined;
        const startDate = query.startDate !== undefined ? new Date(query.startDate as string + " 00:00:00") : undefined;
        const endDate = query.endDate !== undefined ? new Date(query.endDate as string + " 23:59:59") : undefined;
        const sqlClauseOptions: SqlClauseOptions = {
            dateRange: startDate !== undefined && endDate !== undefined ? {
                column: "transact_date",
                startDate,
                endDate
            } : undefined
        };
        const result = await service.readSalesDetailsCount({}, sqlClauseOptions, search);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        throw err;
    }
};