import * as purchasesService from "../transactions/purchases/purchases.service";
import * as salesService from "../transactions/sales/sales.service";
import * as expensesService from "../expenses/expenses.service";
import * as supplierService from "../clients/supplier/supplier.service";
import type { SqlClauseOptions } from "../../utils/globalHelpers";
import type { DateRange } from "../../types/api-response.type";

export const readMonthlyPurchasesTotal = async (dateRange: DateRange) => {
    try {
        const monthlyPurchases = await purchasesService.readPurchasesTotalByDateRange(dateRange);
        return monthlyPurchases;
    } catch (err) {
        console.error(err);
        throw err;
     };
};

export const readMonthlyPurchasedItems = async (dateRange: DateRange) => {
    try {
        const monthlyPurchasedItems = await purchasesService.readPurchasedItemsByDateRange(dateRange);
        return monthlyPurchasedItems;
    } catch (err) {
        console.error(err);
        throw err;
     };
};

export const readMonthlySalesTotal = async (dateRange: DateRange) => {
    try {
        const monthlySales = await salesService.readSalesTotalByDateRange(dateRange);
        return monthlySales;
    } catch (err) {
        console.error(err);
        throw err;
     };
};

export const readMonthlySoldItems = async (dateRange: DateRange) => {
    try {
        const monthlyPurchasedItems = await salesService.readSoldItemsByDateRange(dateRange);
        return monthlyPurchasedItems;
    } catch (err) {
        console.error(err);
        throw err;
     };
};

export const readMonthlyExpenses = async (dateRange: DateRange) => {
    try {
        const monthlyExpenses = await expensesService.readMonthlyExpensesTotal(dateRange);
        return monthlyExpenses;
    } catch (err) {
        console.error(err);
        throw err;
     };
}

const readFirstAndLastDay = async (date: string): Promise<{ firstDay: Date, lastDay: Date }> => {
    const selectedDate = new Date(date);

    const firstDay = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        2
    );

    const lastDay = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        1
    );

    return {
        firstDay,
        lastDay
    };
};
