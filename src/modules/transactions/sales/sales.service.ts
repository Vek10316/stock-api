import * as repo from './sales.repository';
import * as gh from '../../../utils/globalHelpers';
import { generateNextTransactionID, updateLatestTransactionID } from '../settings/transaction-settings.service';
import type { SalesTransactions } from './sales.types';
import type { TransactionDetails } from '../shared.transactions.types';
import { insertStockMovement } from '../../stock/stock.service';
import type * as StockTypes from '../../stock/stock.types';
import { deleteStockMovementByTransactionID as deleteStockMovementByTransactID } from '../../stock/stock.repository';
import { readBuyerName } from '../../clients/buyer/buyer.service';
import { Buyer, BuyerVehicles } from '../../clients/buyer/buyer.types';
import type { ApiPaginatedResponse, DateRange } from '../../../types/api-response.type';
import { updateBuyerLastTransactDate } from '../../clients/buyer/buyer.service';
import { readBuyerByID } from '../../clients/buyer/buyer.repository';

export const readSalesTransactions = async (filter?: Partial<SalesTransactions>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string | undefined) => {
    const sales = await repo.readSalesTransactions(filter, sqlClauseOptions, search);
    let response = new Map<string, (SalesTransactions & { buyer_name: string, total_quantity: number })>();
    for (const row of sales) {
        const buyerName = await readBuyerName(row.buyer_id);
        const totalQuantity = await repo.getSoldTotalQuantity(row.transact_id);
        response.set(row.transact_id, {
            ...row,
            buyer_name: buyerName ?? "Unknown Buyer",
            total_quantity: totalQuantity ?? 0,
        });
    }

    return Array.from(response.values());
};

export const listSalesTransactions = async (filter?: Partial<SalesTransactions>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string | undefined):
Promise<ApiPaginatedResponse<SalesTransactions[]>> => {
    const result = await repo.listSaleTransactions(filter, sqlClauseOptions, search);
    return result;
};

export const insertSalesTranscation = async (header: Omit<SalesTransactions, "transact_id">, details: Omit<TransactionDetails, "transact_id" | "detail_id">[]): Promise<{ buyer: Buyer, header: SalesTransactions, details: TransactionDetails[] }> => {
    const generatedHeader = await generateNewTransactionHeaders();
    const payload: SalesTransactions = {
        transact_id: generatedHeader.transact_id,
        buyer_id: header.buyer_id,
        transact_address: header.transact_address || generatedHeader.transact_address,
        transact_date: new Date(header.transact_date) || generatedHeader.transact_date,
        transact_total_amount: header.transact_total_amount,
        transact_status: header.transact_status,
    }

    const payloadDetails: Omit<TransactionDetails, "detail_id">[] = details.map(d => ({
        transact_id: payload.transact_id,
        ...d,
    }));

    const result = await repo.insertSalesTransaction(payload, payloadDetails);
    await updateLatestTransactionID("PURCHASES", result.transact_id);
    let transact = await repo.readSalesTransactions({ transact_id: result.transact_id });
    const transactDetails = await repo.readSalesDetails(result.transact_id);
    const buyer = await readBuyerByID(result.buyer_id);
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

    await updateBuyerLastTransactDate(header.buyer_id, header.transact_date);

    let response: { buyer: Buyer, header: SalesTransactions, details: TransactionDetails[] } = {
        buyer: buyer,
        header: {
            ...transact[0],
        },
        details: transactDetails
    };

    return response;
};

export const updateSalesTransaction = async (transact_id: string, header: Partial<Omit<SalesTransactions, "transact_id">>, details: Omit<TransactionDetails, "detail_id">[]): Promise<{ header: SalesTransactions, details: TransactionDetails[] }> => {
    await repo.updateSalesTransaction(transact_id, header, details);
    
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

    const transact = await repo.readSalesTransactions({ transact_id });
    const transactDetails = await repo.readSalesDetails(transact_id);
    
    await updateBuyerLastTransactDate(transact[0].buyer_id, transact[0].transact_date);

    const response: { header: SalesTransactions, details: TransactionDetails[] } = {
        header: transact[0],
        details: transactDetails
    }

    return response;
};

export const deleteSalesTransaction = async (id: string) => {
    return await repo.deleteSalesTransaction(id);
}

export const generateNewTransactionHeaders = async (): Promise<{ transact_id: string, transact_address: string, transact_date: Date }> => {
    const nextTransactID = await generateNextTransactionID("SALES");
    const header = {
        transact_id: nextTransactID,
        transact_address: "22, Jalan Seroja 42, Taman Johor Jaya, 81100 Johor Bahru, Johor",
        transact_date: new Date()
    };
    return header;
};

export const readFullSaleDetails = async (filter?: Partial<SalesTransactions>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string): Promise<{
    header: SalesTransactions,
    details: TransactionDetails[],
    buyer: Buyer,
    vehicles: BuyerVehicles[]
}[]> => {
    const result = await repo.readFullSaleDetails(filter, sqlClauseOptions, search);
    return result;
}

export const readSalesDetails = async (transact_id: string): Promise<{ buyer: Buyer, header: SalesTransactions, details: TransactionDetails[] }> => {
    const header = (await repo.readSalesTransactions({ transact_id }))[0];
    const buyer = await readBuyerByID(header.buyer_id);
    const details = await repo.readSalesDetails(transact_id);
    const response = {
        buyer,
        header,
        details
    };
    return response;
}

export const readSalesByDateRange = async (dateRange: DateRange): Promise<SalesTransactions[]> => {
    return await repo.readSalesByDateRange(dateRange);
};

export const readSalesTotalByDateRange = async (dateRange: DateRange): Promise<Pick<SalesTransactions, "transact_total_amount">> => {
    return await repo.readSalesTotalByDateRange(dateRange);
}

export const readSoldItemsByDateRange = async (dateRange: DateRange): Promise<Pick<TransactionDetails, "stock_id" | "item_quantity">[]> => {
    return await repo.readSoldItemsByDateRange(dateRange);
};

export const readSalesCount = async (filter?: Partial<SalesTransactions>, sqlClauseOptions?:gh.SqlClauseOptions, search?: string) => {
    const result = await repo.readSalesCount(filter, sqlClauseOptions, search);
    return result;
};

export const readSalesDetailsCount = async (filter?: Partial<TransactionDetails>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string) => {
    const result = await repo.readSalesDetailsCount(filter, sqlClauseOptions, search);
    return result;
};