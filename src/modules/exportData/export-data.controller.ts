import * as bukkuService from "./export-to-bukku.service";
import { Request, Response } from "express";
import type { SqlClauseOptions } from "../../utils/globalHelpers";

export const previewBukkuSuppliers = async (req: Request, res: Response) => {
    const query = req.query;
    const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
    if (startDate == null || endDate == null) {
        res.status(400).json({
            status: "error",
            message: "startDate and endDate queries are required"
        })
    }
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    const sqlClauseOptions: SqlClauseOptions = {
        dateRange: startDate !== undefined && endDate !== undefined ? {
            column: "last_transact_date",
            startDate,
            endDate
        } : undefined,
        pagination: pageNo !== undefined && pageSize !== undefined ? {
            pageNumber: pageNo,
            pageSize
        } : undefined
    }
    try {
        const preview = await bukkuService.previewBukkuSuppliers({},
            sqlClauseOptions,
            search
        )
        res.json(preview);
    } catch (err) {
        return res.status(500).json({ message: "Preview failed!" });
    }
};

export const previewBukkuPurchasesBill = async (req: Request, res: Response) => {
    const query = req.query;
    const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
    if (startDate == null || endDate == null) {
        res.status(400).json({
            status: "error",
            message: "startDate and endDate queries are required"
        })
    }
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    const sqlClauseOptions: SqlClauseOptions = {
        dateRange: startDate !== undefined && endDate !== undefined ? {
            column: "transact_date",
            startDate: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0),
            endDate: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999)
        } : undefined,
        pagination: pageNo !== undefined && pageSize !== undefined ? {
            pageNumber: pageNo,
            pageSize
        } : undefined
    }
    try {
        const preview = await bukkuService.previewBukkuPurchasesBill({},
            sqlClauseOptions,
            search);
        res.json(preview);
    } catch (err) {
        return res.status(500).json({ message: "Preview failed!" });
    }
};

export const previewBukkuBuyers = async (req: Request, res: Response) => {
    const query = req.query;
    const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
    if (startDate == null || endDate == null) {
        res.status(400).json({
            status: "error",
            message: "startDate and endDate queries are required"
        })
    }
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    const sqlClauseOptions: SqlClauseOptions = {
        dateRange: startDate !== undefined && endDate !== undefined ? {
            column: "last_transact_date",
            startDate,
            endDate
        } : undefined,
        pagination: pageNo !== undefined && pageSize !== undefined ? {
            pageNumber: pageNo,
            pageSize
        } : undefined
    }
    try {
        const preview = await bukkuService.previewBukkuBuyers({},
            sqlClauseOptions,
            search);
        res.json(preview);
    } catch (err) {
        return res.status(500).json({ message: "Preview failed!" });
    }
};

export const previewBukkuSalesBill = async (req: Request, res: Response) => {
    const query = req.query;
    const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
    if (startDate == null || endDate == null) {
        res.status(400).json({
            status: "error",
            message: "startDate and endDate queries are required"
        })
    }
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    const sqlClauseOptions: SqlClauseOptions = {
        dateRange: startDate !== undefined && endDate !== undefined ? {
            column: "transact_date",
            startDate,
            endDate
        } : undefined,
        pagination: pageNo !== undefined && pageSize !== undefined ? {
            pageNumber: pageNo,
            pageSize
        } : undefined
    }
    try {
        const preview = await bukkuService.previewBukkuSalesBill({}, sqlClauseOptions, search);
        res.json(preview);
    } catch (err) {
        return res.status(500).json({ message: "Preview failed!" });
    }
};

export const exportBukkuSuppliersXlsx = async (req: Request, res: Response) => {
    const query = req.query;
    const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
    if (startDate == null || endDate == null) {
        res.status(400).json({
            status: "error",
            message: "startDate and endDate queries are required"
        })
    }
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    const sqlClauseOptions: SqlClauseOptions = {
        dateRange: startDate !== undefined && endDate !== undefined ? {
            column: "last_transact_date",
            startDate,
            endDate
        } : undefined,
        pagination: pageNo !== undefined && pageSize !== undefined ? {
            pageNumber: pageNo,
            pageSize
        } : undefined
    }
    try {
        const workbook = await bukkuService.exportBukkuSuppliersXlsx({},
            sqlClauseOptions, search);
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
            `attachment; filename="${currentDate}-export-bukku-suppliers.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        return res.status(500).json({ message: "Export failed" });
    }
};

export const exportBukkuPurchasesBillXlsx = async (req: Request, res: Response) => {
    const query = req.query;
    const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
    if (startDate == null || endDate == null) {
        res.status(400).json({
            status: "error",
            message: "startDate and endDate queries are required"
        })
    }
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    const sqlClauseOptions: SqlClauseOptions = {
        dateRange: startDate !== undefined && endDate !== undefined ? {
            column: "last_transact_date",
            startDate,
            endDate
        } : undefined,
        pagination: pageNo !== undefined && pageSize !== undefined ? {
            pageNumber: pageNo,
            pageSize
        } : undefined
    }
    try {
        const workbook = await bukkuService.exportBukkuPurchasesBillXlsx({}, sqlClauseOptions, search);
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
            `attachment; filename="${currentDate}-export-bukku-purchases.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end()
    } catch (err) {
        return res.status(500).json({ message: "Export failed" });
    }
}

export const exportBukkuBuyersXlsx = async (req: Request, res: Response) => {
    const query = req.query;
    const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
    if (startDate == null || endDate == null) {
        res.status(400).json({
            status: "error",
            message: "startDate and endDate queries are required"
        })
    }
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    const sqlClauseOptions: SqlClauseOptions = {
        dateRange: startDate !== undefined && endDate !== undefined ? {
            column: "last_transact_date",
            startDate,
            endDate
        } : undefined,
        pagination: pageNo !== undefined && pageSize !== undefined ? {
            pageNumber: pageNo,
            pageSize
        } : undefined
    }
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
            `attachment; filename="${currentDate}-export-bukku-buyers.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        return res.status(500).json({ message: "Export failed" });
    }
};

export const exportBukkuSalesBillXlsx = async (req: Request, res: Response) => {
    const query = req.query;
    const startDate = query.startDate !== undefined ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate !== undefined ? new Date(query.endDate as string) : undefined;
    if (startDate == null || endDate == null) {
        res.status(400).json({
            status: "error",
            message: "startDate and endDate queries are required"
        })
    }
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    const sqlClauseOptions: SqlClauseOptions = {
        dateRange: startDate !== undefined && endDate !== undefined ? {
            column: "last_transact_date",
            startDate,
            endDate
        } : undefined,
        pagination: pageNo !== undefined && pageSize !== undefined ? {
            pageNumber: pageNo,
            pageSize
        } : undefined
    }
    try {
        const workbook = await bukkuService.exportBukkuSalesBillXlsx({}, sqlClauseOptions, search);
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
            `attachment; filename="${currentDate}-export-bukku-sales.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end()
    } catch (err) {
        return res.status(500).json({ message: "Export failed" });
    }
}