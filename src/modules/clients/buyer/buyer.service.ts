import * as repo from "./buyer.repository";
import type { Buyer, BuyerVehicles } from "./buyer.types";
import type { SqlClauseOptions } from "../../../utils/globalHelpers";
import { ApiPaginatedResponse } from "../../../types/api-response.type";

export const readBuyers = async (data?: Partial<Buyer>, sqlClauseOptions?: SqlClauseOptions, search?: string): Promise<Buyer[]> => {
    let buyer = await repo.readBuyers(data, sqlClauseOptions, search);
    if (!data || data === undefined) {
        buyer = buyer.slice(0, 50);
    }
    return buyer;
}

export const createBuyer = async (buyer: Buyer, vehicles: Omit<BuyerVehicles, "vehicle_id">[]) => {
    try {
        await repo.createBuyer(buyer);
        vehicles = vehicles.filter(v => v.plate_no.trim() !== "");
        vehicles.forEach((v) => {
            repo.insertBuyerVehicle(v);
        })
        let result = await repo.listBuyers({buyer_id: buyer.buyer_id});
        return result;
    } catch (err: any) {
        console.error("Failed to insert buyer: ", err);
    }
};

export const updateBuyer = async (buyer_id: string, buyer: Partial<Buyer>, vehicles: Omit<BuyerVehicles, "vehicle_id">[]): Promise<{buyer: Buyer, vehicles: BuyerVehicles[]}> => {
    const buyerRes = await repo.updateBuyer(buyer_id, buyer);
    const vehicleIDs = (await repo.readBuyerVehicles({buyer_id})).map(s => s.vehicle_id);
    vehicleIDs.forEach(async v => {
        await repo.deleteBuyerVehicle(v)
    });

    vehicles.forEach(async v => {
        await repo.insertBuyerVehicle(v);
    });

    const vehiclesRes = await repo.readBuyerVehicles({buyer_id});

    const response = {
        buyer: buyerRes,
        vehicles: vehiclesRes,
    };

    return response;
};

export const deleteBuyer = (buyer_id: string) => {
    return repo.deleteBuyer(buyer_id);
};

export const readBuyerVehicles = (filter?: Partial<BuyerVehicles>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    return repo.readBuyerVehicles(filter, sqlClauseOptions, search);
};

export const insertBuyerVehicle = (data: BuyerVehicles) => {
    return repo.insertBuyerVehicle(data);
};

export const updateBuyerVehicle = (vehicle_id: number, data: any) => {
    return repo.updateBuyerVehicle(vehicle_id, data);
};

export const deleteBuyerVehicle = (vehicle_id: number) => {
    return repo.deleteBuyerVehicle(vehicle_id);
};

export const readBuyerName = (buyer_id: string): Promise<string> => {
    return repo.readBuyerName(buyer_id);
};

export const listBuyers = async (filter?: Partial<Buyer>, sqlClauseOptions?: SqlClauseOptions, search?: string)
:Promise<ApiPaginatedResponse<(Buyer & {plate_no: string})[]>> => {
    const result = await repo.listBuyers(filter, sqlClauseOptions, search);
    return result;
};

export const updateBuyerLastTransactDate = async (buyer_id: string, transact_date: Date): Promise<boolean> => {
    const result = await repo.updateBuyerLastTransactDate(buyer_id, transact_date);
    return result;
}