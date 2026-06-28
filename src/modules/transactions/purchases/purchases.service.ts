import * as repo from './purchases.repository';
import { SqlSort } from '../../../utils/globalHelpers';
import { generateNextTransactionID, updateLatestTransactionID } from '../settings/transaction-settings.service';
import type { PurchasesTransactions } from './purchases.types';
import type { TransactionDetails } from '../shared.transactions.types';
import { insertStockMovement } from '../../stock/stock.service';
import type * as StockTypes from '../../stock/stock.types';
import { deleteStockMovementByTransactionID as deleteStockMovementByTransactID } from '../../stock/stock.repository';
import { readSupplierName } from '../../clients/supplier/supplier.service';
import { Supplier, SupplierVehicles } from '../../clients/supplier/supplier.types';

export const readPurchasesTransactions = async (filter: Partial<PurchasesTransactions>, sort?: SqlSort) => {
    const purchases = await repo.readPurchasesTransactions(filter, sort);
    let response = new Map<string, (PurchasesTransactions & { supplier_name: string, total_quantity: number })>();
    for (const row of purchases) {
        const supplierName = await readSupplierName(row.supplier_id);
        const totalQuantity = await repo.getPurchasedTotalQuantity(row.transact_id);
        response.set(row.transact_id, {
            ...row,
            supplier_name: supplierName ?? "Unknown Supplier",
            total_quantity: totalQuantity ?? 0,
        });
    }

    return Array.from(response.values());
};

export const insertPurchasesTranscation = async (header: Omit<PurchasesTransactions, "transact_id">, details: Omit<TransactionDetails, "transact_id" | "detail_id">[]): Promise<{ header: PurchasesTransactions & { supplier_name: string }, details: TransactionDetails[] }> => {
    const generatedHeader = await generateNewTransactionHeaders();
    const payload: PurchasesTransactions = {
        transact_id: generatedHeader.transact_id,
        supplier_id: header.supplier_id,
        transact_address: header.transact_address || generatedHeader.transact_address,
        transact_date: new Date(header.transact_date) || generatedHeader.transact_date,
        transact_total_amount: header.transact_total_amount,
        transact_status: header.transact_status,
    }

    const payloadDetails: Omit<TransactionDetails, "detail_id">[] = details.map(d => ({
        transact_id: payload.transact_id,
        ...d,
    }))
    // Move current quantity calculation & updateStockQuantity here

    const result = await repo.insertPurchasesTransaction(payload, payloadDetails);
    await updateLatestTransactionID("PURCHASES", result.transact_id);
    let transact = await repo.readPurchasesTransactions({ transact_id: result.transact_id });
    const transactDetails = await repo.readPurchasesDetails(result.transact_id);
    const supplierName = await readSupplierName(result.supplier_id);
    for (const d of payloadDetails) {
        const newStockIn: StockTypes.StockMovement = {
            direction: "IN",
            stock_id: d.stock_id,
            transact_id: payload.transact_id,
            quantity_change: d.item_quantity,
            movement_date: payload.transact_date
        };
        await insertStockMovement(newStockIn);
    }

    let response: { header: PurchasesTransactions & { supplier_name: string }, details: TransactionDetails[] } = {
        header: {
            ...transact[0],
            supplier_name: supplierName || "Unknown Supplier"
        },
        details: transactDetails
    };

    return response;
};

export const updatePurchasesTransaction = async (transact_id: string, header: Partial<Omit<PurchasesTransactions, "transact_id">>, details: Omit<TransactionDetails, "detail_id">[]): Promise<{ header: PurchasesTransactions, details: TransactionDetails[] }> => {
    await repo.updatePurchasesTransaction(transact_id, header, details);
    // Move current quantity calculation & updateStockQuantity here

    // Reinsert stock movements for this transaction
    await deleteStockMovementByTransactID(transact_id, "IN");

    for (const d of details) {
        const newStockIn: StockTypes.StockMovement = {
            direction: "IN",
            stock_id: d.stock_id!,
            transact_id: transact_id,
            quantity_change: d.item_quantity!,
            movement_date: header.transact_date || new Date()
        };

        await insertStockMovement(newStockIn);
    }

    const transact = await repo.readPurchasesTransactions({ transact_id });
    const transactDetails = await repo.readPurchasesDetails(transact_id);

    const response: { header: PurchasesTransactions, details: TransactionDetails[] } = {
        header: transact[0],
        details: transactDetails
    }

    return response;
};

export const deletePurchasesTransaction = async (id: string) => {
    return await repo.deletePurchasesTransaction(id);
}

export const generateNewTransactionHeaders = async (): Promise<{ transact_id: string, transact_address: string, transact_date: Date }> => {
    const nextTransactID = await generateNextTransactionID("PURCHASES");
    const header = {
        transact_id: nextTransactID,
        transact_address: "22, Jalan Seroja 42, Taman Johor Jaya, 81100 Johor Bahru, Johor",
        transact_date: new Date()
    };
    return header;
};

export const readFullPurchaseDetails = async (filter?: Partial<PurchasesTransactions>): Promise<{
    header: PurchasesTransactions,
    details: TransactionDetails[],
    supplier: Supplier,
    vehicles: SupplierVehicles[]
}[]> => {
    const result = await repo.readFullPurchaseDetails(filter);
    return result;
}

export const readPurchasesDetails = async (transact_id: string): Promise<{ header: PurchasesTransactions & { supplier_name: string }, details: TransactionDetails[] }> => {
    const header = (await repo.readPurchasesTransactions({ transact_id }))[0];
    const supplier_name = await readSupplierName(header.supplier_id);
    const details = await repo.readPurchasesDetails(transact_id);
    const response = {
        header: {
            ...header,
            supplier_name
        },
        details
    };
    return response;
}

export const readPurchasesByDateRange = async (startDate: Date, endDate: Date): Promise<PurchasesTransactions[]> => {
    return await repo.readPurchasesByDateRange(startDate, endDate);
};

export const readPurchasesTotalByDateRange = async (startDate: Date, endDate: Date): Promise<Pick<PurchasesTransactions, "transact_total_amount">> => {
    return await repo.readPurchasesTotalByDateRange(startDate, endDate);
}

export const readPurchasedItemsByDateRange = async (startDate: Date, endDate: Date): Promise<Pick<TransactionDetails, "stock_id" | "item_quantity">[]> => {
    return await repo.readPurchasedItemsByDateRange(startDate, endDate);
};