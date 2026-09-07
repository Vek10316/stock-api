import * as repo from "./supplier.repository";
import type { Supplier, SupplierVehicles } from "./supplier.types";
import type { SqlClauseOptions } from "../../../utils/globalHelpers";
import { ApiPaginatedResponse } from "../../../types/api-response.type";

export const readSuppliers = async (data?: Partial<Supplier>, sqlClauseOptions?: SqlClauseOptions, search?: string): Promise<Supplier[]> => {
    let supplier = await repo.readSuppliers(data, sqlClauseOptions, search);
    return supplier;
}

export const createSupplier = async (supplier: Omit<Supplier, "id">, vehicles: Pick<SupplierVehicles, "plate_no">[]) => {
    try {
        const created = await repo.createSupplier(supplier);
        if (vehicles !== undefined && vehicles.length > 0) {
            vehicles = vehicles.filter(v => v.plate_no.trim() !== "");
            vehicles.map((v) => {
                repo.insertSupplierVehicle({
                    ...v,
                    supplier_id: created.id
                })
            })
        };
        let result = await repo.listSuppliers({ id: created.id }) as repo.ListSupplierResult[];
        return result[0];
    } catch (err: any) {
        throw err;
    }
};

export const updateSupplier = async (id: number, supplier: Partial<Supplier>, vehicles: Omit<SupplierVehicles, "vehicle_id">[]): Promise<{ supplier: Supplier, vehicles: SupplierVehicles[] }> => {
    const supplierRes = await repo.updateSupplier(id, supplier);
    const vehicleIDs = (await repo.readSupplierVehicles({ supplier_id: id })).map(s => s.vehicle_id);
    vehicleIDs.forEach(async v => {
        await repo.deleteSupplierVehicle(v)
    });

    vehicles.forEach(async v => {
        await repo.insertSupplierVehicle(v);
    });

    const vehiclesRes = await repo.readSupplierVehicles({ supplier_id: id });

    const response = {
        supplier: supplierRes,
        vehicles: vehiclesRes,
    };

    return response;
};

export const deleteSupplier = (id: number) => {
    return repo.deleteSupplier(id);
};

export const readSupplierVehicles = (filter?: Partial<SupplierVehicles>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    return repo.readSupplierVehicles(filter, sqlClauseOptions, search);
};

export const insertSupplierVehicle = (data: Omit<SupplierVehicles, "vehicle_id">) => {
    return repo.insertSupplierVehicle(data);
};

export const updateSupplierVehicle = (vehicle_id: number, data: any) => {
    return repo.updateSupplierVehicle(vehicle_id, data);
};

export const deleteSupplierVehicle = (vehicle_id: number) => {
    return repo.deleteSupplierVehicle(vehicle_id);
};

export const readSupplierName = (id: number): Promise<string> => {
    return repo.readSupplierName(id);
};

export const listSuppliers = async (filter?: Partial<Supplier>, sqlClauseOptions?: SqlClauseOptions, search?: string)
    : Promise<ApiPaginatedResponse<(Supplier & { plate_no: string })[]> | repo.ListSupplierResult[]> => {
    const result = await repo.listSuppliers(filter, sqlClauseOptions, search);
    return result;
};

export const readSupplierCount = async (filter?: Partial<Supplier>, sqlClauseOptions?: SqlClauseOptions, search?: string) => {
    const result = await repo.readSupplierCount(filter, sqlClauseOptions, search);
    return result;
};

export const updateSupplierLastTransactDate = async (id: number, transact_date: Date): Promise<boolean> => {
    const result = await repo.updateSupplierLastTransactDate(id, transact_date);
    return result;
};