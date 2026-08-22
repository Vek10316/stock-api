import * as bukkuService from "./export-to-bukku.service";
import { Request, Response } from "express";

export const exportSuppliersXlsx = async (req: Request, res: Response) => {
    const query = req.query;
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    try {
        const workbook = await bukkuService.exportSuppliersXlsx({},
            pageNo !== undefined && pageSize !== undefined ? {
                pagination: {
                    pageNumber: pageNo,
                    pageSize
                }
            } : undefined, search);
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

export const exportBuyersXlsx = async (req: Request, res: Response) => {
    const query = req.query;
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    try {
        const workbook = await bukkuService.exportBuyersXlsx({},
            pageNo !== undefined && pageSize !== undefined ? {
                pagination: {
                    pageNumber: pageNo,
                    pageSize
                }
            } : undefined, search);
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
            `attachment; filename="${currentDate}-export-buyers.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        return res.status(500).json({ message: "Export failed" });
    }
};

export const exportSalesXlsx = async (req: Request, res: Response) => {
    try {
        const workbook = await bukkuService.exportSalesXlsx();
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
            `attachment; filename="${currentDate}-export-sales.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end()
    } catch (err) {
        return res.status(500).json({ message: "Export failed" });
    }
}