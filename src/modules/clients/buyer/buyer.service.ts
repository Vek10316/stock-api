import * as repo from "./buyer.repository";
import type { Buyer, BuyerVehicles } from "./buyer.types";

export const readBuyers = (data: any) => {
    return repo.readBuyers(data);
}

export const createBuyer = (data: any) => {
    return repo.createBuyer(data);
};

export const updateBuyer = (id: string, data: any) => {
    return repo.updateBuyer(id, data);
};

export const deleteBuyer = (id: string) => {
    return repo.deleteBuyer(id);
};

export const readBuyerVehicles = (data: any) => {
    return repo.readBuyerVehicles(data);
};

export const insertBuyerVehicle = (data: any) => {
    return repo.insertBuyerVehicle(data);
};

export const updateBuyerVehicle = (vehicle_id: string, data: any) => {
    return repo.updateBuyerVehicle(vehicle_id, data);
};

export const deleteBuyerVehicle = (vehicle_id: string) => {
    return repo.deleteBuyerVehicle(vehicle_id);
};