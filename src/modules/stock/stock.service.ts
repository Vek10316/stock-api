import * as repo from './stock.repository';
import * as StockTypes from './stock.types';

export const getStock = (data: any) => {
  return repo.readStock(data as Partial<StockTypes.Stock>);
}

export const createStock = (data: any) => {
  return repo.createNewStock({
    stock_id: data.stock_id,
    stock_description: data.stock_description ?? data.stock_id,
    stock_uom: data.stock_uom ?? "KG",
    stock_category: data.stock_category ?? undefined,
    current_quantity: data.current_quantity ?? 1
  });
};

export const updateStock = (stock_id: string, data: any) => {
  return repo.updateStock(stock_id, data);
};

export const deleteStock = (stock_id: string) => {
  return repo.deleteStockById(stock_id);
}

// Stock movement
export const readStockMovement = (data: any) => {
  return repo.readStockMovement(data);
}

export const insertStockMovement = (data: any) => {
  return repo.insertStockMovement(data);
};

export const updateStockMovement = (movement_id: number, data: any) => {
  return repo.updateStockMovement(movement_id, data);
};

export const deleteStockMovement = (movement_id: number) => {
  return repo.deleteStockMovement(movement_id);
};

// Stock pricing history
export const readStockPricingHistory = (data: any) => {
  return repo.readStockPricingHistory(data);
};

export const updateStockPricing = (data: any) => {
  if (data.effective_date === undefined) {
    data.effective_date =  new Date();
  }
  return repo.updateStockPrice(data);
}

export const deleteStockPricing = (id: string) => {
  return repo.deleteStockPrice(id);
}