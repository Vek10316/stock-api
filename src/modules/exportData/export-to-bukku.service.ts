// Tailored for Bukku's import format

import * as supplierRepo from '../clients/supplier/supplier.repository';
import type * as SupplierTypes from '../clients/supplier/supplier.types';
import * as purchasesRepo from '../transactions/purchases/purchases.repository';
import type * as PurchasesTypes from '../transactions/purchases/purchases.types';
import type { TransactionDetails } from '../transactions/shared.transactions.types';
import * as stockRepo from '../stock/stock.repository';
import * as bukkuRepo from './export-to-bukku.repository';
import { Stock } from '../stock/stock.types';
import exceljs from 'exceljs';
import {
    BukkuPurchaseBillExportColumns,
    BukkuContactsExportColumns
} from './export-bukku-columns';
import type {
    BukkuPurchaseBillImportTemplate,
    BukkuContactsImportTemplate
} from './export-bukku-columns';
import { SqlClauseOptions } from '../../utils/globalHelpers';

export const exportSuppliersXlsx = async (filter?: Partial<SupplierTypes.Supplier>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    const suppliers = await supplierRepo.listSuppliers(filter, sqlClauseOptions, search) as supplierRepo.ListSupplierResult[];
    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet();

    sheet.columns = [
        { key: undefined, header: "" },
        ...Object.entries(BukkuContactsExportColumns).map(item => ({
            key: item[0],
            header: item[1],
        }))
    ];

    const payload: BukkuContactsImportTemplate[] = suppliers.map(supplier => ({
        contact_code: "[AUTO]",
        legal_name: supplier.supplier_name,
        reg_no_type: supplier.supplier_id_type,
        reg_no: supplier.supplier_id,
        contact_no: supplier.supplier_phone,
        email_addresses: supplier.supplier_email,
        tin: supplier.supplier_tin,
        is_supplier: true,
    }));

    payload.forEach(row => {
        sheet.addRow(row);
    });

    return workbook;
};

export const exportPurchasesXlsx = async (filter?: Partial<PurchasesTypes.PurchasesTransactions>) => {
    const purchases = await purchasesRepo.readPurchasesTransactions(filter);
    const supplierIDs = new Set(purchases.map(purchase => purchase.supplier_id));
    const supplierMap = new Map<string, string>();
    supplierIDs.forEach(async (id) => {
        const name = await supplierRepo.readSupplierName(id);
        if (name) {
            supplierMap.set(id, name);
        }
    });
    const purchasesMap: { header: PurchasesTypes.PurchasesTransactions, details: TransactionDetails }[] = [];
    purchases.forEach(async (purchase) => {
        const details = await purchasesRepo.readPurchasesDetails(purchase.transact_id);
        details.forEach(detail => {
            purchasesMap.push({
                header: purchase,
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

    const payload: BukkuPurchaseBillImportTemplate[] = purchasesMap.map(purchase => ({
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