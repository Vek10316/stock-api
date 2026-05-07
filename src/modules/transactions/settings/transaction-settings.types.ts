export interface TransactionSettings {
    id: number;
    transaction_description?: string;
    transaction_type: "PURCHASES" | "SALES";
    transaction_prefix: string;
    latest_transaction_id: string;
    is_active: boolean;
}