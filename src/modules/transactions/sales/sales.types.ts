export type SalesTransactions = {
    transact_id: string;
    buyer_id: string;
    transact_address: string;
    transact_date: Date;
    transact_total_amount: number;
    transact_status: "UNPAID" | "PARTIAL" | "PAID";
};