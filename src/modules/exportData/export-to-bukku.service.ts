// Tailored for Bukku's import format

import * as buyerRepo from '../clients/buyer/buyer.repository';
import * as supplierRepo from '../clients/supplier/supplier.repository';
import type * as SupplierTypes from '../clients/supplier/supplier.types';
import type * as BuyerTypes from '../clients/buyer/buyer.types';
import * as salesRepo from '../transactions/sales/sales.repository';
import * as purchasesRepo from '../transactions/purchases/purchases.repository';
import type * as SalesTypes from '../transactions/sales/sales.types';
import type * as PurchasesTypes from '../transactions/purchases/purchases.types';
import type { TransactionDetails } from '../transactions/shared.transactions.types';
import * as stockRepo from '../stock/stock.repository';
import * as bukkuRepo from './export-to-bukku.repository';
import { Stock } from '../stock/stock.types';
import exceljs from 'exceljs';
import {
    BukkuSaleBillExportColumns,
    BukkuPurchaseBillExportColumns,
    BukkuContactsExportColumns
} from './export-bukku-columns';
import type {
    BukkuSaleBillExportTemplate,
    BukkuPurchaseBillExportTemplate,
    BukkuContactsExportTemplate
} from './export-bukku-columns';
import { SqlClauseOptions } from '../../utils/globalHelpers';

export const previewBukkuSuppliers = async (filter?: Partial<SupplierTypes.Supplier>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    sqlClauseOptions = {
        ...sqlClauseOptions,
        maxRows: 100
    };
    const suppliers = await supplierRepo.listSuppliers(filter, sqlClauseOptions, search) as supplierRepo.ListSupplierResult[];
    let contactCodes = await readAllSupplierBukkuContactCodes();
    try {
        const supplierIDs = suppliers.flatMap(s => s.id);
        if (contactCodes === undefined || contactCodes.length !== suppliers.length) {
            const noContactCodes = contactCodes === undefined ?
                supplierIDs :
                supplierIDs.filter(s => !contactCodes.flatMap(c => c.supplier_id).includes(s));

            for (const row of noContactCodes) {
                await assignSupplierBukkuContactCode(row);
            }
            contactCodes = await readAllSupplierBukkuContactCodes();
        }
    } catch (err) {
        throw err;
    }

    const columnHeaders = {
        _: "",
        ...BukkuContactsExportColumns,
    };

    const previewData = suppliers.map(supplier => ({
        _: "",
        contact_code: contactCodes.find(c => c.supplier_id === supplier.id)!.contact_code,
        legal_name: supplier.supplier_name,
        reg_no_type: supplier.supplier_id_type,
        reg_no: supplier.supplier_id,
        contact_no: supplier.supplier_phone,
        email_addresses: supplier.supplier_email,
        tin: supplier.supplier_tin,
        is_supplier: true,
        is_customer: true,
    }));

    sqlClauseOptions = {
        ...sqlClauseOptions,
        maxRows: undefined
    };
    const supplierCount = await supplierRepo.readSupplierCount(filter, sqlClauseOptions, search) as number;

    return {
        headers: columnHeaders,
        data: previewData,
        totalCount: supplierCount
    };
}

export const previewBukkuPurchasesBill = async (filter?: Partial<PurchasesTypes.PurchasesTransactions>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    sqlClauseOptions = {
        ...sqlClauseOptions,
        maxRows: 100
    };
    const purchases = await purchasesRepo.readPurchasesTransactions(filter, sqlClauseOptions, search);
    let contactCodes = await readAllSupplierBukkuContactCodes();
    const supplierIDs = new Set(purchases.map(purchase => purchase.supplier_id));
    try {
        if (contactCodes === undefined || contactCodes.length !== supplierIDs.size) {
            const noContactCodes = contactCodes === undefined ?
                supplierIDs :
                Array.from(supplierIDs).filter(s => !contactCodes.flatMap(c => c.supplier_id).includes(s));

            for (const row of noContactCodes) {
                await assignSupplierBukkuContactCode(row);
            }
            contactCodes = await readAllSupplierBukkuContactCodes();
        }
    } catch (err) {
        throw err;
    }

    const supplierMap = new Map<number, string>();
    supplierIDs.forEach(async (id) => {
        const name = await supplierRepo.readSupplierName(id);
        if (name) {
            supplierMap.set(id, name);
        }
    });
    const purchasesMap: { header: PurchasesTypes.PurchasesTransactions & { contact_code: string }, details: TransactionDetails }[] = [];
    await Promise.all(purchases.map(async (purchase) => {
        const contactCode = contactCodes.find(c => c.supplier_id === purchase.supplier_id)!.contact_code;
        const details = await purchasesRepo.readPurchasesDetails(purchase.transact_id);
        details.forEach(detail => {
            purchasesMap.push({
                header: {
                    ...purchase,
                    contact_code: contactCode
                },
                details: detail,
            });
        })
    }));
    const stockDetails = await stockRepo.readStock();
    const stockMap = new Map<string, Stock>();
    stockDetails.forEach(detail => {
        stockMap.set(detail.stock_id, detail);
    })

    const columnHeaders = {
        _: "",
        ...BukkuPurchaseBillExportColumns
    }

    const previewData = purchasesMap.map(purchase => ({
        _: "",
        contact_code: purchase.header.contact_code,
        supplier: supplierMap.get(purchase.header.supplier_id) || "Unknown Supplier",
        reference_no: purchase.header.transact_id,
        date: purchase.header.transact_date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }),
        account: "placeholder_ac",
        product: purchase.details.stock_id,
        item_description: stockMap.get(purchase.details.stock_id)?.stock_description ?? purchase.details.stock_id,
        uom: stockMap.get(purchase.details.stock_id)?.stock_uom ?? undefined,
        quantity: purchase.details.item_quantity,
        unit_price: purchase.details.item_price,
        location: purchase.header.transact_address,
    }));

    sqlClauseOptions = {
        ...sqlClauseOptions,
        maxRows: undefined
    };
    const purchasesCount = await purchasesRepo.readPurchasesDetailsCount(filter, sqlClauseOptions, search);

    return {
        headers: columnHeaders,
        data: previewData,
        totalCount: purchasesCount
    };
};

export const previewBukkuBuyers = async (filter?: Partial<BuyerTypes.Buyer>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    sqlClauseOptions = {
        ...sqlClauseOptions,
        maxRows: 100
    };
    const buyers = await buyerRepo.listBuyers(filter, sqlClauseOptions, search) as buyerRepo.ListBuyerResult[];
    let contactCodes = await readAllBuyerBukkuContactCodes();
    try {
        const buyerIDs = buyers.flatMap(b => b.id);
        if (contactCodes === undefined || contactCodes.length !== buyers.length) {
            const noContactCodes = contactCodes === undefined ?
                buyerIDs :
                buyerIDs.filter(b => !contactCodes.flatMap(c => c.buyer_id).includes(b));

            for (const row of noContactCodes) {
                await assignBuyerBukkuContactCode(row);
            }
            contactCodes = await readAllBuyerBukkuContactCodes();
        }
    } catch (err) {
        throw err;
    }

    const columnHeaders = {
        _: "",
        ...BukkuContactsExportColumns,
    };

    const previewData = buyers.map(buyer => ({
        _: "",
        contact_code: contactCodes.find(c => c.buyer_id === buyer.id)!.contact_code,
        legal_name: buyer.buyer_name,
        reg_no_type: buyer.buyer_id_type,
        reg_no: buyer.buyer_id,
        contact_no: buyer.buyer_phone,
        email_addresses: buyer.buyer_email,
        tin: buyer.buyer_tin,
        is_supplier: true,
        is_customer: true,
    }));

    sqlClauseOptions = {
        ...sqlClauseOptions,
        maxRows: undefined
    };
    const buyerCount = await buyerRepo.readBuyerCount(filter, sqlClauseOptions, search) as number;

    return {
        headers: columnHeaders,
        data: previewData,
        totalCount: buyerCount
    };
}

export const previewBukkuSalesBill = async (filter?: Partial<SalesTypes.SalesTransactions>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    sqlClauseOptions = {
        ...sqlClauseOptions,
        maxRows: 100
    };
    const sales = await salesRepo.readSalesTransactions(filter, sqlClauseOptions, search);
    let contactCodes = await readAllBuyerBukkuContactCodes();
    const buyerIDs = new Set(sales.map(sale => sale.buyer_id));

    try {
        if (contactCodes === undefined || contactCodes.length !== buyerIDs.size) {
            const noContactCodes = contactCodes === undefined ?
                buyerIDs :
                Array.from(buyerIDs).filter(s => !contactCodes.flatMap(c => c.buyer_id).includes(s));

            for (const row of noContactCodes) {
                await assignBuyerBukkuContactCode(row);
            }
            contactCodes = await readAllBuyerBukkuContactCodes();
        }
    } catch (err) {
        throw err;
    }

    const buyerMap = new Map<number, string>();
    buyerIDs.forEach(async (id) => {
        const name = await buyerRepo.readBuyerName(id);
        if (name) {
            buyerMap.set(id, name);
        }
    });
    const salesMap: { header: SalesTypes.SalesTransactions & { contact_code: string }, details: TransactionDetails }[] = [];
    await Promise.all(sales.map(async (sale) => {
        const contactCode = contactCodes.find(c => c.buyer_id === sale.buyer_id)!.contact_code;
        const details = await salesRepo.readSalesDetails(sale.transact_id);
        details.forEach(detail => {
            salesMap.push({
                header: {
                    ...sale,
                    contact_code: contactCode
                },
                details: detail,
            });
        })
    }));
    const stockDetails = await stockRepo.readStock();
    const stockMap = new Map<string, Stock>();
    stockDetails.forEach(detail => {
        stockMap.set(detail.stock_id, detail);
    })

    const columnHeaders = {
        _: "",
        ...BukkuSaleBillExportColumns
    }

    const previewData = salesMap.map(sale => ({
        _: "",
        contact_code: sale.header.contact_code,
        supplier: buyerMap.get(sale.header.buyer_id) || "Unknown Buyer",
        reference_no: sale.header.transact_id,
        date: sale.header.transact_date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }),
        account: "placeholder_ac",
        product: sale.details.stock_id,
        item_description: stockMap.get(sale.details.stock_id)?.stock_description ?? sale.details.stock_id,
        uom: stockMap.get(sale.details.stock_id)?.stock_uom ?? undefined,
        quantity: sale.details.item_quantity,
        unit_price: sale.details.item_price,
        location: sale.header.transact_address
    }));

    sqlClauseOptions = {
        ...sqlClauseOptions,
        maxRows: undefined
    };
    const salesCount = await salesRepo.readSalesCount(filter, sqlClauseOptions, search) as number;

    return {
        headers: columnHeaders,
        data: previewData,
        totalCount: salesCount
    };
};

export const exportBukkuSuppliersXlsx = async (filter?: Partial<SupplierTypes.Supplier>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    const suppliers = await supplierRepo.listSuppliers(filter, sqlClauseOptions, search) as supplierRepo.ListSupplierResult[];
    let contactCodes = await readAllSupplierBukkuContactCodes();
    try {
        const supplierIDs = suppliers.flatMap(s => s.id);
        if (contactCodes === undefined || contactCodes.length !== suppliers.length) {
            const noContactCodes = contactCodes === undefined ?
                supplierIDs :
                supplierIDs.filter(s => !contactCodes.flatMap(c => c.supplier_id).includes(s));

            for (const row of noContactCodes) {
                await assignSupplierBukkuContactCode(row);
            }
            contactCodes = await readAllSupplierBukkuContactCodes();
        }
    } catch (err) {
        throw err;
    }

    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet();

    sheet.columns = [
        { key: undefined, header: "" },
        ...Object.entries(BukkuContactsExportColumns).map(item => ({
            key: item[0],
            header: item[1],
        }))
    ];

    const payload: BukkuContactsExportTemplate[] = suppliers.map(supplier => ({
        contact_code: contactCodes.find(c => c.supplier_id === supplier.id)!.contact_code,
        legal_name: supplier.supplier_name,
        reg_no_type: supplier.supplier_id_type,
        reg_no: supplier.supplier_id,
        contact_no: supplier.supplier_phone,
        email_addresses: supplier.supplier_email,
        tin: supplier.supplier_tin,
        is_supplier: true,
        is_customer: true,
    }));

    payload.forEach(row => {
        sheet.addRow(row);
    });

    return workbook;
};

export const exportBukkuPurchasesBillXlsx = async (filter?: Partial<PurchasesTypes.PurchasesTransactions>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    const purchases = await purchasesRepo.readPurchasesTransactions(filter, sqlClauseOptions, search);
    let contactCodes = await readAllSupplierBukkuContactCodes();
    const supplierIDs = new Set(purchases.map(purchase => purchase.supplier_id));

    try {
        if (contactCodes === undefined || contactCodes.length !== supplierIDs.size) {
            const noContactCodes = contactCodes === undefined ?
                supplierIDs :
                Array.from(supplierIDs).filter(s => !contactCodes.flatMap(c => c.supplier_id).includes(s));

            for (const row of noContactCodes) {
                await assignSupplierBukkuContactCode(row);
            }
            contactCodes = await readAllSupplierBukkuContactCodes();
        }
    } catch (err) {
        throw err;
    }

    const supplierMap = new Map<number, string>();
    supplierIDs.forEach(async (id) => {
        const name = await supplierRepo.readSupplierName(id);
        if (name) {
            supplierMap.set(id, name);
        }
    });
    const purchasesMap: { header: PurchasesTypes.PurchasesTransactions & { contact_code: string }, details: TransactionDetails }[] = [];
    purchases.forEach(async (purchase) => {
        const contactCode = contactCodes.find(c => c.supplier_id === purchase.supplier_id)!.contact_code;
        const details = await purchasesRepo.readPurchasesDetails(purchase.transact_id);
        details.forEach(detail => {
            purchasesMap.push({
                header: {
                    ...purchase,
                    contact_code: contactCode
                },
                details: detail,
            });
        })
    });
    const stockDetails = await stockRepo.readStock();
    const stockMap = new Map<string, Stock>();
    stockDetails.forEach(detail => {
        stockMap.set(detail.stock_id, detail);
    })

    const workbook = new exceljs.Workbook;
    const sheet = workbook.addWorksheet();
    sheet.columns = [
        { key: undefined, header: undefined },
        ...Object.entries(BukkuPurchaseBillExportColumns).map(item => ({
            key: item[0],
            header: item[1],
        }))
    ];

    const payload: BukkuPurchaseBillExportTemplate[] = purchasesMap.map(purchase => ({
        contact_code: purchase.header.contact_code,
        supplier: supplierMap.get(purchase.header.supplier_id) || "Unknown Supplier",
        reference_no: purchase.header.transact_id,
        date: purchase.header.transact_date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }),
        account: "placeholder_ac",
        product: purchase.details.stock_id,
        item_description: stockMap.get(purchase.details.stock_id)?.stock_description ?? purchase.details.stock_id,
        uom: stockMap.get(purchase.details.stock_id)?.stock_uom ?? undefined,
        quantity: purchase.details.item_quantity,
        unit_price: purchase.details.item_price,
    }));

    payload.forEach(row => {
        sheet.addRow(row);
    });

    return workbook;
};

export const exportBuyersXlsx = async (filter?: Partial<BuyerTypes.Buyer>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    const buyers = await buyerRepo.listBuyers(filter, sqlClauseOptions, search) as buyerRepo.ListBuyerResult[];
    let contactCodes = await readAllBuyerBukkuContactCodes();
    try {
        const buyerIDs = buyers.flatMap(s => s.id);
        if (contactCodes === undefined || contactCodes.length !== buyers.length) {
            const noContactCodes = contactCodes === undefined ?
                buyerIDs :
                buyerIDs.filter(b => !contactCodes.flatMap(c => c.buyer_id).includes(b));

            for (const row of noContactCodes) {
                await assignBuyerBukkuContactCode(row);
            }
            contactCodes = await readAllBuyerBukkuContactCodes();
        }
    } catch (err) {

        throw err;
    }

    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet();

    sheet.columns = [
        { key: undefined, header: "" },
        ...Object.entries(BukkuContactsExportColumns).map(item => ({
            key: item[0],
            header: item[1],
        }))
    ];

    const payload: BukkuContactsExportTemplate[] = buyers.map(buyer => ({
        contact_code: contactCodes.find(c => c.buyer_id === buyer.id)!.contact_code,
        legal_name: buyer.buyer_name,
        reg_no_type: buyer.buyer_id_type,
        reg_no: buyer.buyer_id,
        contact_no: buyer.buyer_phone,
        email_addresses: buyer.buyer_email,
        tin: buyer.buyer_tin,
        is_supplier: true,
        is_customer: true,
    }));

    payload.forEach(row => {
        sheet.addRow(row);
    });

    return workbook;
};

export const exportBukkuSalesBillXlsx = async (filter?: Partial<SalesTypes.SalesTransactions>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    const sales = await salesRepo.readSalesTransactions(filter, sqlClauseOptions, search);
    let contactCodes = await readAllBuyerBukkuContactCodes();
    const buyerIDs = new Set(sales.map(sales => sales.buyer_id));

    try {
        if (contactCodes === undefined || contactCodes.length !== buyerIDs.size) {
            const noContactCodes = contactCodes === undefined ?
                buyerIDs :
                Array.from(buyerIDs).filter(s => !contactCodes.flatMap(c => c.buyer_id).includes(s));

            for (const row of noContactCodes) {
                await assignBuyerBukkuContactCode(row);
            }
            contactCodes = await readAllBuyerBukkuContactCodes();
        }
    } catch (err) {

        throw err;
    }

    const buyerMap = new Map<number, string>();
    buyerIDs.forEach(async (id) => {
        const name = await buyerRepo.readBuyerName(id);
        if (name) {
            buyerMap.set(id, name);
        }
    });
    const salesMap: { header: SalesTypes.SalesTransactions & { contact_code: string }, details: TransactionDetails }[] = [];
    sales.forEach(async (sale) => {
        const contactCode = contactCodes.find(c => c.buyer_id === sale.buyer_id)!.contact_code;
        const details = await salesRepo.readSalesDetails(sale.transact_id);
        details.forEach(detail => {
            salesMap.push({
                header: {
                    ...sale,
                    contact_code: contactCode
                },
                details: detail,
            });
        })
    });
    const stockDetails = await stockRepo.readStock();
    const stockMap = new Map<string, Stock>();
    stockDetails.forEach(detail => {
        stockMap.set(detail.stock_id, detail);
    })

    const workbook = new exceljs.Workbook;
    const sheet = workbook.addWorksheet();
    sheet.columns = [
        { key: undefined, header: undefined },
        ...Object.entries(BukkuSaleBillExportColumns).map(item => ({
            key: item[0],
            header: item[1],
        }))
    ];

    const payload: BukkuSaleBillExportTemplate[] = salesMap.map(sale => ({
        contact_code: sale.header.contact_code,
        buyer: buyerMap.get(sale.header.buyer_id) || "Unknown Buyer",
        reference_no: sale.header.transact_id,
        date: sale.header.transact_date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }),
        account: "placeholder_ac",
        product: sale.details.stock_id,
        item_description: stockMap.get(sale.details.stock_id)?.stock_description ?? sale.details.stock_id,
        uom: stockMap.get(sale.details.stock_id)?.stock_uom ?? undefined,
        quantity: sale.details.item_quantity,
        unit_price: sale.details.item_price,
    }));

    payload.forEach(row => {
        sheet.addRow(row);
    });

    return workbook;
};

export const generateNextContactCode = async (contact_type: "BUYER" | "SUPPLIER") => {
    const {
        contact_code_prefix: prefix,
        latest_contact_code: latestCode
    } = await bukkuRepo.readBukkuContactsSetting(contact_type);

    const match = latestCode.match(/(\d+)$/);

    const numericStr = match ? match[1] : "0";
    const numericPart = parseInt(numericStr, 10);

    const nextNumericPart = numericPart + 1;

    const paddedNext = nextNumericPart
        .toString()
        .padStart(numericStr.length, "0");

    return `${prefix}${paddedNext}`;
}

export const readAllBuyerBukkuContactCodes = async () => {
    const result = await bukkuRepo.readAllBuyerBukkuContactCodes();
    return result;
};

export const readBuyerBukkuContactCode = async (buyer_id: number) => {
    const result = await bukkuRepo.readBuyerBukkuContactCode(buyer_id);
    return result;
};

export const assignBuyerBukkuContactCode = async (buyer_id: number) => {
    const contact_code = await generateNextContactCode("BUYER");
    const result = await bukkuRepo.insertBuyerContactCode(buyer_id, contact_code).then(async (res) => {
        await bukkuRepo.updateLatestContactCode("BUYER", res.contact_code);
    });
    return result;
};

export const readAllSupplierBukkuContactCodes = async () => {
    const result = await bukkuRepo.readAllSupplierBukkuContactCodes();
    return result;
};

export const readSupplierBukkuContactCode = async (supplier_id: number) => {
    const result = await bukkuRepo.readSupplierBukkuContactCode(supplier_id);
    return result;
};

export const assignSupplierBukkuContactCode = async (supplier_id: number) => {
    const contact_code = await generateNextContactCode("SUPPLIER");
    const result = await bukkuRepo.insertSupplierContactCode(supplier_id, contact_code).then(async (res) => {
        await bukkuRepo.updateLatestContactCode("SUPPLIER", res.contact_code);
    });
    return result;
};