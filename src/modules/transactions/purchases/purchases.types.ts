export type PurchasesTransactions = {
    transact_id: string;
    supplier_id: number;
    transact_address: string;
    transact_date: Date;
    transact_total_amount: number;
    transact_status: "UNPAID" | "PARTIAL" | "PAID";
};