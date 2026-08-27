import { Response, Request } from "express";
import * as service from "./reports.service";

export const readMonthlyPurchsaesTotal = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
        const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
        if (startDate == null || endDate == null) {
            res.statusCode = 400;
            return res.json({
                status: "error",
                message: "startDate and endDate queries are required"
            });
        }

        const result = await service.readMonthlyPurchasesTotal({ startDate, endDate });
        res.json({
            date: `${startDate} - ${endDate}`,
            data: result,
        });
    } catch (err: any) {
        res.status(500).json(err);
        throw err;
    }
};

export const readMonthlyPurchasedItems = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
        const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
        if (startDate == null || endDate == null) {
            res.statusCode = 400;
            return res.json({
                status: "error",
                message: "startDate and endDate queries are required"
            });
        }

        const result = await service.readMonthlyPurchasedItems({ startDate, endDate });
        res.json({
            date: `${startDate} - ${endDate}`,
            data: result
        });
    } catch (err) {
        res.status(500).json(err);
        throw err;
    }
};

export const readMonthlySalesTotal = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
        const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
        if (startDate == null || endDate == null) {
            res.statusCode = 400;
            return res.json({
                status: "error",
                message: "startDate and endDate queries are required"
            });
        }

        const result = await service.readMonthlySalesTotal({ startDate, endDate });
        res.json({
            date: `${startDate} - ${endDate}`,
            data: result,
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const readMonthlySoldItems = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
        const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
        if (startDate == null || endDate == null) {
            res.statusCode = 400;
            return res.json({
                status: "error",
                message: "startDate and endDate queries are required"
            });
        }

        const result = await service.readMonthlySoldItems({ startDate, endDate });
        res.json({
            date: `${startDate} - ${endDate}`,
            data: result
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const readMonthlyExpenses = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
        const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
        if (startDate == null || endDate == null) {
            res.statusCode = 400;
            return res.json({
                status: "error",
                message: "startDate and endDate queries are required"
            });
        }

        const result = await service.readMonthlyExpenses({ startDate, endDate });
        res.json({
            date: `${startDate} - ${endDate}`,
            data: result
        });
    } catch (err) {
        res.status(500).json(err);
    }
};