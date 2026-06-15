import * as bukkuService from "./export-to-bukku.service";
import { Request, Response } from "express";

export const exportSuppliersXlsx = async (req: Request, res: Response) => {
    try {
        const workbook = await bukkuService.exportSuppliersXlsx();
        const currentDate = new Date().toLocaleDateString("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${currentDate}-export-suppliers.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        return res.status(500).json({ message: "Export failed" });
    }
};

export const exportPurchasesXlsx = async (req: Request, res: Response) => {
    try {
        const workbook = await bukkuService.exportPurchasesXlsx();
        const currentDate = new Date().toLocaleDateString("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${currentDate}-export-purchases.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end()
    } catch (err) {
        return res.status(500).json({ message: "Export failed" });
    }
}