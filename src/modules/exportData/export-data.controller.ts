import * as bukkuService from "./export-to-bukku.service";
import { Request, Response } from "express";

export const previewBukkuSuppliers = async (req: Request, res: Response) => {
    const query = req.query;
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    try {
        const preview = await bukkuService.previewBukkuSuppliers({},
            pageNo !== undefined && pageSize !== undefined ? {
                pagination: {
                    pageNumber: pageNo,
                    pageSize
                }
            } : undefined, search);
        res.json(preview);
    } catch (err) {
        return res.status(500).json({ message: "Preview failed!" });
    }
};

export const previewBukkuPurchasesBill = async (req: Request, res: Response) => {
    const query = req.query;
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    try {
        const preview = await bukkuService.previewBukkuPurchasesBill({},
            pageNo !== undefined && pageSize !== undefined ? {
                pagination: {
                    pageNumber: pageNo,
                    pageSize
                }
            } : undefined, search);
        res.json(preview);
    } catch (err) {
        return res.status(500).json({ message: "Preview failed!" });
    }
};

export const previewBukkuBuyers = async (req: Request, res: Response) => {
    const query = req.query;
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    try {
        const preview = await bukkuService.previewBukkuBuyers({},
            pageNo !== undefined && pageSize !== undefined ? {
                pagination: {
                    pageNumber: pageNo,
                    pageSize
                }
            } : undefined, search);
        res.json(preview);
    } catch (err) {
        return res.status(500).json({ message: "Preview failed!" });
    }
};

export const previewBukkuSalesBill = async (req: Request, res: Response) => {
    const query = req.query;
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    try {
        const preview = await bukkuService.previewBukkuSalesBill({},
            pageNo !== undefined && pageSize !== undefined ? {
                pagination: {
                    pageNumber: pageNo,
                    pageSize
                }
            } : undefined, search);
        res.json(preview);
    } catch (err) {
        return res.status(500).json({ message: "Preview failed!" });
    }
};

export const exportBukkuSuppliersXlsx = async (req: Request, res: Response) => {
    const query = req.query;
    const pageSize = query.pageSize !== undefined ? Number.parseFloat(query.pageSize as string) : undefined;
    const pageNo = query.pageNo !== undefined ? Number.parseFloat(query.pageNo as string) : undefined;
    const search = query.search as string;
    try {
        const workbook = await bukkuService.exportBukkuSuppliersXlsx({},
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
            `attachment; filename="${currentDate}-export-bukku-suppliers.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        return res.status(500).json({ message: "Export failed" });
    }
};

export const exportBukkuPurchasesBillXlsx = async (req: Request, res: Response) => {
    try {
        const workbook = await bukkuService.exportBukkuPurchasesBillXlsx();
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
            `attachment; filename="${currentDate}-export-bukku-buyers.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        return res.status(500).json({ message: "Export failed" });
    }
};

export const exportBukkuSalesBillXlsx = async (req: Request, res: Response) => {
    try {
        const workbook = await bukkuService.exportBukkuSalesBillXlsx();
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