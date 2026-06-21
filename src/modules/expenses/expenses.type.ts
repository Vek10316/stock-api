export type ExpensesRecord = {
    expense_id: number;
    expense_date: string;
    expense_category: string;
    expense_amount: number;
    expense_description?: string | undefined;
};