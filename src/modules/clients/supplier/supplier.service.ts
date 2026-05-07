import * as repo from "./supplier.repository";
import type { Supplier, SupplierVehicles } from "./supplier.types";

export const readSuppliers = (data: any) => {
    return repo.readSuppliers(data);
}

export const createSupplier = (data: any) => {
    return repo.createSupplier(data);
};

export const updateSupplier = (id: string, data: any) => {
    return repo.updateSupplier(id, data);
};

export const deleteSupplier = (id: string) => {
    return repo.deleteSupplier(id);
};

export const readSupplierVehicles = (data: any) => {
    return repo.readSupplierVehicles(data);
};

export const insertSupplierVehicle = (data: any) => {
    return repo.insertSupplierVehicle(data);
};

export const updateSupplierVehicle = (vehicle_id: string, data: any) => {
    return repo.updateSupplierVehicle(vehicle_id, data);
};

export const deleteSupplierVehicle = (vehicle_id: string) => {
    return repo.deleteSupplierVehicle(vehicle_id);
};