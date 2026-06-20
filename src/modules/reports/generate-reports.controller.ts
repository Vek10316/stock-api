import { Response, Request } from "express";
import * as service from "./generate-reports.service";

export const readPurchaseTotalsByDateRange = async (req: Request, res: Response) => {
    try {
        const params = req.params;
        const date = params.date as string;
        const result = await service.getMonthlyPurchasesTotal(date);
        res.json({
            date,
            transact_total_amount: result
        });
    } catch (err) {
        res.status(500).json(err);
    }
};