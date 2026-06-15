// Tailored for Bukku's import format

import * as supplierRepo from '../clients/supplier/supplier.repository';
import type * as SupplierTypes from '../clients/supplier/supplier.types';
import * as purchasesRepo from '../transactions/purchases/purchases.repository';
import type * as PurchasesTypes from '../transactions/purchases/purchases.types';
import type { TransactionDetails } from '../transactions/shared.transactions.types';
import * as stockRepo from '../stock/stock.repository';
import { Stock } from '../stock/stock.types';
import exceljs from 'exceljs';

const BukkuContactsImportColumns = {
    legal_name: "Legal Name",
    update_legal_name: "Update Legal Name",
    entity_type: "Entity Type",
    other_name: "Other Name",
    reg_no_type: "Reg. No. Type",
    reg_no: "Registration / ID No.",
    old_reg_no: "Old Registration No.",
    tin: "TIN",
    sst_reg_no: "SST Registration No.",
    billing_first_name: "Billing First Name",
    billing_last_name: "Billing Last Name",
    shipping_first_name: "Shipping First Name",
    shipping_last_name: "Shipping Last Name",
    is_customer: "Is Customer",
    is_supplier: "Is Supplier",
    is_employee: "Is Employee",
    receivable_account_code: "Receivable Account Code",
    credit_limit: "Credit Limit",
    payable_account_code: "Payable Account Code",
    groups: "Groups",
    price_level: "Price Level",
    contact_no: "Contact No.",
    email_addresses: "Email Addresses",
    billing_street: "Billing Street",
    billing_city: "Billing City",
    billing_state: "Billing State",
    billing_postcode: "Billing Postcode",
    billing_country_code: "Billing Country Code",
    shipping_street: "Shipping Street",
    shipping_city: "Shipping City",
    shipping_state: "Shipping State",
    shipping_postcode: "Shipping Postcode",
    shipping_country_code: "Shipping Country Code",
    currency_code: "Currency Code",
    payment_term: "Payment Term",
    income_account_code: "Income Account Code",
    expense_account_code: "Expense Account Code",
    location: "Location",
    tags: "Tags",
    myinvois_action: "MyInvois Action",
    monthly_statement: "Monthly Statement",
    invoice_reminder: "Invoice Reminder",
    remarks: "Remarks",
};

interface BukkuContactsImportTemplate {
    legal_name: string;
    update_legal_name?: string | undefined;
    entity_type?: string | undefined;
    other_name?: string | undefined;
    reg_no_type?: string | undefined;
    reg_no?: string | undefined;
    old_reg_no?: string | undefined;
    tin?: string | undefined;
    sst_reg_no?: string | undefined;
    billing_first_name?: string | undefined;
    billing_last_name?: string | undefined;
    shipping_first_name?: string | undefined;
    shipping_last_name?: string | undefined;
    is_customer?: boolean | undefined;
    is_supplier?: boolean | undefined;
    is_employee?: boolean | undefined;
    receivable_account_code?: string | undefined;
    credit_limit?: number | undefined;
    payable_account_code?: string | undefined;
    groups?: string | undefined;
    price_level?: string | undefined;
    contact_no?: string | undefined;
    email_addresses?: string | undefined;
    billing_street?: string | undefined;
    billing_city?: string | undefined;
    billing_state?: string | undefined;
    billing_postcode?: string | undefined;
    billing_country_code?: string | undefined;
    shipping_street?: string | undefined;
    shipping_city?: string | undefined;
    shipping_state?: string | undefined;
    shipping_postcode?: string | undefined;
    shipping_country_code?: string | undefined;
    currency_code?: string | undefined;
    payment_term?: string | undefined;
    income_account_code?: string | undefined;
    expense_account_code?: string | undefined;
    location?: string | undefined;
    tags?: string | undefined;
    myinvois_action?: string | undefined;
    monthly_statement?: boolean | undefined;
    invoice_reminder?: boolean | undefined;
    remarks?: string | undefined;
};

const BukkuPurchasesImportColumns = {
    supplier: "Supplier",
    invoice_no: "Invoice No.",
    reference_no: "Reference No.",
    date: "Date",
    currency: "Currency",
    rate: "Rate",
    tags: "Tags",
    title: "Title",
    description: "Description",
    product: "Product",
    account: "Account",
    item_description: "Item Description",
    quantity: "Quantity",
    uom: "UOM",
    location: "Location",
    unit_price: "Unit Price",
    discount: "Discount",
    tax: "Tax",
};

interface BukkuPurchasesImportTemplate {
    supplier: string;
    invoice_no?: string | undefined;
    reference_no: string;
    date: string;
    currency?: string | undefined;
    rate?: number | undefined;
    tags?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    product?: string | undefined;
    account: string;
    item_description: string;
    quantity?: number | undefined;
    uom?: string | undefined;
    location?: string | undefined;
    unit_price: number;
    discount?: number | undefined;
    tax?: number | undefined;
};

export const exportSuppliersXlsx = async (filter?: Partial<SupplierTypes.Supplier>) => {
    const suppliers = await supplierRepo.readSuppliers(filter);
    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet();

    sheet.columns = [
        { key: undefined, header: "" },
        ...Object.entries(BukkuContactsImportColumns).map(item => ({
            key: item[0],
            header: item[1],
        }))
    ];

    const payload: BukkuContactsImportTemplate[] = suppliers.map(supplier => ({
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
        { key: undefined, header: undefined},
        ...Object.entries(BukkuPurchasesImportColumns).map(item => ({
            key: item[0],
            header: item[1],
        }))
    ];

    const payload: BukkuPurchasesImportTemplate[] = purchasesMap.map(purchase => ({
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