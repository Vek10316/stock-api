export type Supplier = {
    supplier_id: string;
    supplier_id_type: "NRIC" | "PASSPORT" | "BRN";
    supplier_name: string;
    supplier_address?: string;
    supplier_phone?: string;
    supplier_email?: string;
    supplier_tin?: string;
    last_transact_date?: Date;
}

export type SupplierVehicles = {
    vehicle_id: number;
    supplier_id: string;
    plate_no: string;
}