import { Response, Request } from "express";
import * as service from "./reports.service";

export const readMonthlyPurchsaesTotal = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const date = query.date as string;
        const result = await service.readMonthlyPurchasesTotal(date.trim() !== "" ? date : new Date().toLocaleDateString("en-CA"));
        res.json({
            date,
            data: result,
        });
    } catch (err) {
        res.json(err);
    }
};

export const readMonthlyPurchasedItems = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const date = query.date as string;
        const result = await service.readMonthlyPurchasedItems(date.trim() !== "" ? date : new Date().toLocaleDateString("en-CA"));
        res.json({
            date,
            data: result
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const readMonthlySalesTotal = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const date = query.date as string;
        const result = await service.readMonthlySalesTotal(date.trim() !== "" ? date : new Date().toLocaleDateString("en-CA"));
        res.json({
            date,
            data: result,
        });
    } catch (err) {
        res.json(err);
    }
};

export const readMonthlySoldItems = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const date = query.date as string;
        const result = await service.readMonthlySoldItems(date.trim() !== "" ? date : new Date().toLocaleDateString("en-CA"));
        res.json({
            date,
            data: result
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const readMonthlyExpenses = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const date = query.date as string;
        const result = await service.readMonthlyExpenses(date.trim() !== "" ? date : new Date().toLocaleDateString("en-CA"));
        res.json({
            date,
            data: result
        });
    } catch (err) {
        res.status(500).json(err);
    }
};