import * as repo from "./supplier.repository";
import type { Supplier, SupplierVehicles } from "./supplier.types";
import type { SqlClauseOptions } from "../../../utils/globalHelpers";
import { ApiPaginatedResponse } from "../../../types/api-response.type";

export const readSuppliers = async (data?: Partial<Supplier>, sqlClauseOptions?: SqlClauseOptions, search?: string): Promise<Supplier[]> => {
    let supplier = await repo.readSuppliers(data, sqlClauseOptions, search);
    if (!data || data === undefined) {
        supplier = supplier.slice(0, 50);
    }
    return supplier;
}

export const createSupplier = async (supplier: Supplier, vehicles: Omit<SupplierVehicles, "vehicle_id">[]) => {
    try {
        await repo.createSupplier(supplier);
        vehicles = vehicles.filter(v => v.plate_no.trim() !== "");
        vehicles.forEach((v) => {
            repo.insertSupplierVehicle(v);
        })
        let result = await repo.listSuppliers({supplier_id: supplier.supplier_id});
        return result;
    } catch (err: any) {
        console.error("Failed to insert supplier: ", err);
    }
};

export const updateSupplier = async (supplier_id: string, supplier: Partial<Supplier>, vehicles: Omit<SupplierVehicles, "vehicle_id">[]): Promise<{supplier: Supplier, vehicles: SupplierVehicles[]}> => {
    const supplierRes = await repo.updateSupplier(supplier_id, supplier);
    const vehicleIDs = (await repo.readSupplierVehicles({supplier_id})).map(s => s.vehicle_id);
    vehicleIDs.forEach(async v => {
        await repo.deleteSupplierVehicle(v)
    });

    vehicles.forEach(async v => {
        await repo.insertSupplierVehicle(v);
    });

    const vehiclesRes = await repo.readSupplierVehicles({supplier_id});

    const response = {
        supplier: supplierRes,
        vehicles: vehiclesRes,
    };

    return response;
};

export const deleteSupplier = (supplier_id: string) => {
    return repo.deleteSupplier(supplier_id);
};

export const readSupplierVehicles = (filter?: Partial<SupplierVehicles>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    return repo.readSupplierVehicles(filter, sqlClauseOptions, search);
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

export const listSuppliers = async (filter?: Partial<Supplier>, sqlClauseOptions?: SqlClauseOptions, search?: string)
:Promise<ApiPaginatedResponse<(Supplier & {plate_no: string})[]>> => {
    const result = await repo.listSuppliers(filter, sqlClauseOptions, search);
    return result;
};

export const updateSupplierLastTransactDate = async (supplier_id: string, transact_date: Date): Promise<boolean> => {
    const result = await repo.updateSupplierLastTransactDate(supplier_id, transact_date);
    return result;
}