import { Request, Response } from 'express';
import * as service from './stock.service';

export const readStock = async (req: Request, res: Response) => {
  try {
    const result = await service.readStock(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const readStockCategories = async (req: Request, res: Response) => {
  try {
    const result = await service.readStockCategories();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export const createStock = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const stockReq = body.stock;
    const pricesReq = body.prices;
    const result = await service.createStock(stockReq, pricesReq);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id || id.trimEnd() === "") {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const body = req.body;
    const stockReq = body.stock;
    const pricesReq = body.prices;

    const result = await service.updateStock(id, stockReq, pricesReq);
    res.status(201).json({result});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id || id === "") {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const deleted = await service.deleteStock(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    res.status(200).json({ message: 'Stock deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Movement
export const getStockMovement = async (req: Request, res: Response) => {
  try {
    const result = await service.readStockMovement(req.body);
    res.status(200).json(result);
  } catch (err: any)  {
    res.status(500).json({ error: err.message });
  }
};

export const insertStockMovement = async (req: Request, res: Response) => {
  try {
    const result = await service.insertStockMovement(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStockMovement = async (req: Request, res: Response) => {
  try {
    const movement_id = Number.parseInt(req.params.id[0]);
    const result = await service.updateStockMovement(movement_id, req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStockMovement = async (req: Request, res: Response) => {
  try {
    const movement_id = Number.parseInt(req.params.id[0]);
    const result = await service.deleteStockMovement(movement_id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Pricing
export const readStockPricingHistory = async (req: Request, res: Response) => {
  try {
    const result = await service.readStockPricingHistory(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStockPricing = async (req: Request, res: Response) => {
  try {
    const result = await service.updateStockPricing(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStockPricing = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await service.deleteStockPricing(id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const readStockWithPrice = async (req: Request, res: Response) => {
  try {
    const result = await service.readStockWithPrice(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export const readStockDetails = async (req: Request, res: Response) => {
  try {
    const stock_id = req.params.id as string;
    const result = await service.readStockDetails(stock_id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}