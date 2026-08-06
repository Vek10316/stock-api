import * as repo from './stock.repository';
import * as StockTypes from './stock.types';
import type { SqlClauseOptions } from '../../utils/globalHelpers';
import { ApiPaginatedResponse } from '../../types/api-response.type';

export const readStock = async (filter?: Partial<StockTypes.Stock>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    if (search !== undefined && search.trim() !== "") {
        sqlClauseOptions = {
            ...sqlClauseOptions,
            search: {
                columns: ["stock_id", "stock_description"],
                searchQuery: search
            },
        };
    }
    return await repo.readStock(filter, sqlClauseOptions);
}

export const readStockCategories = (sqlClauseOptions: SqlClauseOptions) => {
    return repo.readStockCategories(sqlClauseOptions);
}

export const createStock = async (stock: StockTypes.Stock, prices: Omit<StockTypes.StockPricingHistory, "history_id">) => {
    const stockRes = await repo.createNewStock({
        stock_id: stock.stock_id,
        stock_description: stock.stock_description ?? stock.stock_id,
        stock_uom: stock.stock_uom.toUpperCase() ?? "KG",
        stock_category: stock.stock_category?.toUpperCase() ?? "GENERAL",
        current_quantity: stock.current_quantity ?? 1
    });

    const priceRes = await repo.updateStockPrice({
        stock_id: stock.stock_id,
        buy_price: prices.buy_price ?? 0,
        sell_price: prices.sell_price ?? 0,
        effective_date: prices.effective_date ?? new Date().toISOString(),
    })

    const response: { stock: StockTypes.Stock, prices: StockTypes.StockPricingHistory } = {
        stock: stockRes,
        prices: priceRes,
    };

    return response;
};

export const updateStock = async (stock_id: string, stock: Partial<StockTypes.Stock>, prices?: Omit<StockTypes.StockPricingHistory, "history_id">) => {
    const stockRes = await repo.updateStock(stock_id, {
        ...stock, 
        stock_category: stock.stock_category?.toUpperCase() ?? undefined
    });

    if (prices) {
        await repo.updateStockPrice({
            ...prices,
            stock_id: stock.stock_id ?? stock_id,
            effective_date: prices.effective_date ?? new Date().toISOString(),
        })
    }

    const pricesRes = (await repo.readStockPricingHistory({ stock_id })).sort((a, b) => {
        return (new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());
    })[0];

    const response = {
        stock: stockRes,
        prices: pricesRes,
    };

    return response;
};

export const deleteStock = (stock_id: string) => {
    return repo.deleteStockById(stock_id);
}

// Stock movement
export const readStockMovement = (data: Partial<StockTypes.StockMovement>) => {
    return repo.readStockMovement(data);
}

export const insertStockMovement = (data: StockTypes.StockMovement) => {
    return repo.insertStockMovement(data);
};

export const updateStockMovement = (movement_id: number, data: any) => {
    return repo.updateStockMovement(movement_id, data);
};

export const deleteStockMovement = (movement_id: number) => {
    return repo.deleteStockMovement(movement_id);
};

// Stock pricing history
export const readStockPricingHistory = (data: Partial<StockTypes.StockPricingHistory>) => {
    return repo.readStockPricingHistory(data);
};

export const updateStockPricing = (data: Omit<StockTypes.StockPricingHistory, "history_id">) => {
    if (data.effective_date === undefined) {
        data.effective_date = new Date().toISOString()
            .replace("T", " ")
            .replace("Z", "");
    }
    return repo.updateStockPrice(data);
};

export const deleteStockPricing = (id: string) => {
    return repo.deleteStockPrice(id);
};

export const listStock = async (filter?: Partial<StockTypes.Stock>, sqlClauseOptions?: SqlClauseOptions, search?: string): Promise<ApiPaginatedResponse<repo.StockListResponse[]>> => {
    return await repo.listStock(filter, sqlClauseOptions, search);
};

export const deleteStockMovementByTransactionID = async (transact_id: string, direction: "IN" | "OUT", stock_id?: string) => {
    const payload = stock_id?.trim() !== "" ? { transact_id, direction } : { transact_id, direction, stock_id };
    const movements = await readStockMovement(payload);
    const res = await repo.deleteStockMovementByTransactionID(transact_id, direction, stock_id);

    // Assuming stock_id is unique while sharing the same transact ID: Differentiate with stock_id
    if (!movements) return true;

    for (const d of movements) {
        const qty = d.direction == "IN" ?
            (d.quantity_change * -1) :
            d.quantity_change

        await repo.updateStockQuantity(d.stock_id, qty);
    };
    return res;
};

export const readStockDetails = async (stock_id: string): Promise<{ stock: StockTypes.Stock, priceHistory: StockTypes.StockPricingHistory[] }> => {
    const stock = (await repo.readStock({ stock_id }))[0];
    const priceHistory = await repo.readStockPricingHistory({ stock_id });
    const res = {
        stock,
        priceHistory
    };
    return res;
};