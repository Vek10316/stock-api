import * as purchases from "../transactions/purchases/purchases.service";
import * as sales from "../transactions/sales/sales.service";
import * as expenses from "../expenses/expenses.service";

export const readMonthlyPurchasesTotal = async (date: string) => {
    try {
        const { firstDay, lastDay } = await readFirstAndLastDay(date);
        const monthlyPurchases = await purchases.readPurchasesTotalByDateRange(firstDay, lastDay);
        return monthlyPurchases;
    } catch (err) {
        console.error(err);
     };
};

export const readMonthlyPurchasedItems = async (date: string) => {
    try {
        const { firstDay, lastDay } = await readFirstAndLastDay(date);

        const monthlyPurchasedItems = await purchases.readPurchasedItemsByDateRange(firstDay, lastDay);

        return monthlyPurchasedItems;
    } catch (err) {
        console.error(err);
     };
};

export const readMonthlySalesTotal = async (date: string) => {
    try {
        const { firstDay, lastDay } = await readFirstAndLastDay(date);
        const monthlySales = await sales.readSalesTotalByDateRange(firstDay, lastDay);
        return monthlySales;
    } catch (err) {
        console.error(err);
     };
};

export const readMonthlySoldItems = async (date: string) => {
    try {
        const { firstDay, lastDay } = await readFirstAndLastDay(date);

        const monthlyPurchasedItems = await sales.readSoldItemsByDateRange(firstDay, lastDay);

        return monthlyPurchasedItems;
    } catch (err) {
        console.error(err);
     };
};

export const readMonthlyExpenses = async (date: string) => {
    try {
        const { firstDay, lastDay } = await readFirstAndLastDay(date);

        const monthlyExpenses = await expenses.readMonthlyExpensesTotal(firstDay, lastDay);

        return monthlyExpenses;
    } catch (err) {
        console.error(err);
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
