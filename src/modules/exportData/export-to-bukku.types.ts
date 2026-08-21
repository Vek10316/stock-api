export type BukkuContactsSettings = {
    contact_type: "BUYER" | "SUPPLIER";
    contact_code_prefix: string;
    latest_contact_code: string;
};

export type BukkuBuyers = {
    buyer_id: string;
    contact_code: string;
};

export type BukkuSuppliers = {
    supplier_id: string;
    contact_code: string;
};