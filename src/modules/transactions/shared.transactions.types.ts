import type { PurchasesTransactions } from './purchases/purchases.types';
import type { SalesTransactions } from './sales/sales.types';

export type TransactionDetails = {
    detail_id: number;
    transact_id: string;
    stock_id: string;
    item_price: number;
    item_quantity: number;
    transact_subtotal: number;
};

export type TransactionOutput = {
    header:  PurchasesTransactions | SalesTransactions;
    details?: TransactionDetails[];
};