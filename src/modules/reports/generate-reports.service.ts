import * as purchases from "../transactions/purchases/purchases.service";
import * as sales from "../transactions/sales/sales.service";

export const getMonthlyPurchasesTotal = async (date: string | Date) => {
    try {
        const {firstDay, lastDay} = await getFirstAndLastDay(date);
        const monthlyPurchases = await purchases.readPurchasesTotalByDateRange(firstDay, lastDay);
        return monthlyPurchases;
    } catch {};
};

export const getMonthlyPurchasedItems = async (date: string | Date) => {
    try {
        const {firstDay, lastDay} = await getFirstAndLastDay(date);

        const monthlyPurchasedItems = await purchases.readPurchasedItemsByDateRange(firstDay, lastDay);

        return monthlyPurchasedItems;
    } catch {};
}

export const getMonthlySalesTotal = async (date: string | Date) => {
    try {
        const {firstDay, lastDay} = await getFirstAndLastDay(date);
        const monthlySales = await sales.readSalesTotalByDateRange(firstDay, lastDay);
        return monthlySales;
    } catch {};
};

export const getMonthlySoldItems = async (date: string | Date) => {
    try {
        const {firstDay, lastDay} = await getFirstAndLastDay(date);

        const monthlyPurchasedItems = await sales.readSoldItemsByDateRange(firstDay, lastDay);

        return monthlyPurchasedItems;
    } catch {};
}

const getFirstAndLastDay = async (date: string | Date): Promise<{firstDay: Date, lastDay: Date}> => {
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
}