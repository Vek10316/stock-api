CREATE TABLE bukku_suppliers (
	supplier_id INT NOT NULL,
	contact_code NVARCHAR(50) NOT NULL,
	CONSTRAINT fk_bukku_supplier_id
	FOREIGN KEY (supplier_id) REFERENCES master_supplier (id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);