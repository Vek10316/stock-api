export type Buyer = {
    buyer_id: string;
    buyer_id_type: "NRIC" | "BRN" | "PASSPORT";
    buyer_name: string;
    buyer_address?: string;
    buyer_phone?: string;
    buyer_email?: string;
    buyer_tin?: string;
};

export type BuyerVehicles = {
    vehicle_id: number;
    buyer_id: string;
    plate_no: string;
};