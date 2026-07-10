import * as service from "./expenses.service";
import { Request, Response } from "express";

export const readAllExpenses = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const pageNo = query.pageNo !== undefined ? Number.parseInt(query.pageNo as string) : 1;
        const pageSize = query.pageSize !== undefined ? Number.parseInt(query.pageSize as string) : 100;
        const search = query.search as string;
        const expenses = await service.readAllExpenses({}, {
            pagination: {
                pageSize,
                pageNumber: pageNo,
            },
            sort: {
                column: "expense_id"
            }
        }, search);
        res.json(expenses);
    } catch (err: any) {
        console.error(err);
        res.json({ err });
    }
};

export const readExpenseRecordByID = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        res.json(await service.readExpenseRecordByID(id));
    } catch (err: any) {
        res.json({ err });
    }
}

export const insertNewExpenseRecord = async (req: Request, res: Response) => {
    try {
        const body = await req.body;
        const insertResponse = await service.insertNewExpenseRecord(body);
        res.json({ insertResponse });
    } catch (err: any) {
        res.json({ err });
    }
};

export const updateExpenseRecord = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const body = req.body;
        const updateResponse = await service.updateExpenseRecord(id, body)
        res.json(updateResponse)
    } catch (err) {
        res.json({ err });
    }
};