export const BukkuPurchaseBillExportColumns = {
    contact_code: "Contact Code",
    supplier: "Supplier",
    invoice_no: "Invoice No.",
    reference_no: "Reference No.",
    date: "Date",
    payment_term: "Payment Term",
    due_date: "Due Date",
    currency: "Currency",
    rate: "Rate",
    tags: "Tags",
    description: "Description",
    product: "Product",
    account: "Account",
    item_description: "Item Description",
    quantity: "Quantity",
    uom: "UOM",
    location: "Location",
    unit_price: "Unit Price",
    discount: "Discount",
    tax: "Tax",
    classification_code: "Classification Code"
};

export const BukkuContactsExportColumns = {
    contact_code: "Contact Code",
    update_contact_code: "Update Contact Code",
    legal_name: "Legal Name",
    entity_type: "Entity Type",
    other_name: "Other Name",
    reg_no_type: "Reg. No. Type",
    reg_no: "Registration / ID No.",
    old_reg_no: "Old Registration No.",
    tin: "TIN",
    sst_reg_no: "SST Registration No.",
    billing_first_name: "Billing First Name",
    billing_last_name: "Billing Last Name",
    shipping_first_name: "Shipping First Name",
    shipping_last_name: "Shipping Last Name",
    is_customer: "Is Customer",
    is_supplier: "Is Supplier",
    is_employee: "Is Employee",
    receivable_account_code: "Receivable Account Code",
    credit_limit: "Credit Limit",
    payable_account_code: "Payable Account Code",
    groups: "Groups",
    price_level: "Price Level",
    contact_no: "Contact No.",
    email_addresses: "Email Addresses",
    billing_street: "Billing Street",
    billing_city: "Billing City",
    billing_state: "Billing State",
    billing_postcode: "Billing Postcode",
    billing_country_code: "Billing Country Code",
    shipping_street: "Shipping Street",
    shipping_city: "Shipping City",
    shipping_state: "Shipping State",
    shipping_postcode: "Shipping Postcode",
    shipping_country_code: "Shipping Country Code",
    currency_code: "Currency Code",
    payment_term: "Payment Term",
    income_account_code: "Income Account Code",
    expense_account_code: "Expense Account Code",
    location: "Location",
    tags: "Tags",
    myinvois_action: "MyInvois Action",
    monthly_statement: "Monthly Statement",
    invoice_reminder: "Invoice Reminder",
    remarks: "Remarks",
};

export type BukkuContactsImportTemplate = {
    contact_code: string;
    update_contact_code?: string | undefined;
    legal_name: string;
    entity_type?: string | undefined;
    other_name?: string | undefined;
    reg_no_type?: string | undefined;
    reg_no?: string | undefined;
    old_reg_no?: string | undefined;
    tin?: string | undefined;
    sst_reg_no?: string | undefined;
    billing_first_name?: string | undefined;
    billing_last_name?: string | undefined;
    shipping_first_name?: string | undefined;
    shipping_last_name?: string | undefined;
    is_customer?: boolean | undefined;
    is_supplier?: boolean | undefined;
    is_employee?: boolean | undefined;
    receivable_account_code?: string | undefined;
    credit_limit?: number | undefined;
    payable_account_code?: string | undefined;
    groups?: string | undefined;
    price_level?: string | undefined;
    contact_no?: string | undefined;
    email_addresses?: string | undefined;
    billing_street?: string | undefined;
    billing_city?: string | undefined;
    billing_state?: string | undefined;
    billing_postcode?: string | undefined;
    billing_country_code?: string | undefined;
    shipping_street?: string | undefined;
    shipping_city?: string | undefined;
    shipping_state?: string | undefined;
    shipping_postcode?: string | undefined;
    shipping_country_code?: string | undefined;
    currency_code?: string | undefined;
    payment_term?: string | undefined;
    income_account_code?: string | undefined;
    expense_account_code?: string | undefined;
    location?: string | undefined;
    tags?: string | undefined;
    myinvois_action?: string | undefined;
    monthly_statement?: boolean | undefined;
    invoice_reminder?: boolean | undefined;
    remarks?: string | undefined;
};

export type BukkuPurchaseBillImportTemplate = {
    contact_code?: string | undefined;
    supplier: string;
    invoice_no?: string | undefined;
    reference_no: string;
    date: string;
    payment_term?: string | undefined;
    due_date?: string | undefined;
    currency?: string | undefined;
    rate?: number | undefined;
    tags?: string | undefined;
    description?: string | undefined;
    product?: string | undefined;
    account: string;
    item_description: string;
    quantity?: number | undefined;
    uom?: string | undefined;
    location?: string | undefined;
    unit_price: number;
    discount?: number | undefined;
    tax?: number | undefined;
    classification_code?: string | undefined;
};