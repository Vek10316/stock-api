import * as repo from "./buyer.repository";
import type { Buyer, BuyerVehicles } from "./buyer.types";
import type { SqlClauseOptions } from "../../../utils/globalHelpers";
import { ApiPaginatedResponse } from "../../../types/api-response.type";

export const readBuyers = async (data?: Partial<Buyer>, sqlClauseOptions?: SqlClauseOptions, search?: string): Promise<Buyer[]> => {
    let buyer = await repo.readBuyers(data, sqlClauseOptions, search);
    return buyer;
}

export const createBuyer = async (buyer: Omit<Buyer, "id">, vehicles: Pick<BuyerVehicles, "plate_no">[]) => {
    try {
        const created = await repo.createBuyer(buyer);
        if (vehicles !== undefined && vehicles.length > 0) {
            vehicles = vehicles.filter(v => v.plate_no.trim() !== "");
            vehicles.map((v) => {
                repo.insertBuyerVehicle({
                    ...v,
                    buyer_id: created.id
                })
            })
        };
        let result = await repo.listBuyers({ id: created.id });
        return result;
    } catch (err: any) {
        throw err;
    }
};

export const updateBuyer = async (id: number, buyer: Partial<Buyer>, vehicles: Omit<BuyerVehicles, "vehicle_id">[]): Promise<{ buyer: Buyer, vehicles: BuyerVehicles[] }> => {
    const buyerRes = await repo.updateBuyer(id, buyer);
    const vehicleIDs = (await repo.readBuyerVehicles({ buyer_id: id })).map(s => s.vehicle_id);
    vehicleIDs.forEach(async v => {
        await repo.deleteBuyerVehicle(v)
    });

    vehicles.forEach(async v => {
        await repo.insertBuyerVehicle(v);
    });

    const vehiclesRes = await repo.readBuyerVehicles({ buyer_id: id });

    const response = {
        buyer: buyerRes,
        vehicles: vehiclesRes,
    };

    return response;
};

export const deleteBuyer = (id: number) => {
    return repo.deleteBuyer(id);
};

export const readBuyerVehicles = (filter?: Partial<BuyerVehicles>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    return repo.readBuyerVehicles(filter, sqlClauseOptions, search);
};

export const insertBuyerVehicle = (data: Omit<BuyerVehicles, "vehicle_id">) => {
    return repo.insertBuyerVehicle(data);
};

export const updateBuyerVehicle = (vehicle_id: number, data: any) => {
    return repo.updateBuyerVehicle(vehicle_id, data);
};

export const deleteBuyerVehicle = (vehicle_id: number) => {
    return repo.deleteBuyerVehicle(vehicle_id);
};

export const readBuyerName = (id: number): Promise<string> => {
    return repo.readBuyerName(id);
};

export const listBuyers = async (filter?: Partial<Buyer>, sqlClauseOptions?: SqlClauseOptions, search?: string)
    : Promise<ApiPaginatedResponse<(Buyer & { plate_no: string })[]> | repo.ListBuyerResult[]> => {
    const result = await repo.listBuyers(filter, sqlClauseOptions, search);
    return result;
};

export const readBuyerCount = async (filter?: Partial<Buyer>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    const result = await repo.readBuyerCount(filter, sqlClauseOptions, search);
    return result;
};

export const updateBuyerLastTransactDate = async (id: number, transact_date: Date): Promise<boolean> => {
    const result = await repo.updateBuyerLastTransactDate(id, transact_date);
    return result;
};