import * as repo from "./supplier.repository";
import type { Supplier, SupplierVehicles } from "./supplier.types";

export const readSuppliers = async (data: Partial<Supplier>): Promise<Supplier[]> => {
    let supplier = await repo.readSuppliers(data);
    if (!data || data === undefined) {
        supplier = supplier.slice(0, 50);
    }
    return supplier;
}

export const createSupplier = async (supplier: Supplier, vehicles: Omit<SupplierVehicles, "vehicle_id">[]) => {
    try {
        await repo.createSupplier(supplier);
        vehicles.forEach((v) => {
            repo.insertSupplierVehicle(v);
        })
        let result = await repo.readSuppliersWithVehicles({supplier_id: supplier.supplier_id});
        return result;
    } catch (err: any) {
        console.error("Failed to insert supplier: ", err);
    }
};

export const updateSupplier = async (supplier_id: string, supplier: Partial<Supplier>, vehicles: Omit<SupplierVehicles, "vehicle_id">[]): Promise<{details: Supplier, vehicles: SupplierVehicles[]}> => {
    const detailsRes = await repo.updateSupplier(supplier_id, supplier);
    const vehicleIDs = (await repo.readSupplierVehicles({supplier_id})).map(s => s.vehicle_id);
    vehicleIDs.forEach(async v => {
        await repo.deleteSupplierVehicle(v)
    });

    vehicles.forEach(async v => {
        await repo.insertSupplierVehicle(v);
    });

    const vehiclesRes = await repo.readSupplierVehicles({supplier_id});

    const response = {
        details: detailsRes,
        vehicles: vehiclesRes,
    };

    return response;
};

export const deleteSupplier = (supplier_id: string) => {
    return repo.deleteSupplier(supplier_id);
};

export const readSupplierVehicles = (data: Partial<SupplierVehicles>) => {
    return repo.readSupplierVehicles(data);
};

export const insertSupplierVehicle = (data: SupplierVehicles) => {
    return repo.insertSupplierVehicle(data);
};

export const updateSupplierVehicle = (vehicle_id: number, data: any) => {
    return repo.updateSupplierVehicle(vehicle_id, data);
};

export const deleteSupplierVehicle = (vehicle_id: number) => {
    return repo.deleteSupplierVehicle(vehicle_id);
};

export const readSupplierName = (supplier_id: string): Promise<string> => {
    return repo.readSupplierName(supplier_id);
};

export const readSupplierWithVehicles = async (data: Partial<Supplier>) => {
    return await repo.readSuppliersWithVehicles(data);
};