CREATE TABLE purchases_transactions (
	transact_id NVARCHAR(25) PRIMARY KEY NOT NULL,
	supplier_id INT NOT NULL,
	transact_address NVARCHAR(255),
	transact_date DATETIME NOT NULL,
	transact_total_amount DECIMAL(7,2) NOT NULL,
	transact_status NVARCHAR(25)
	CONSTRAINT fk_purchases_supplier_id
	FOREIGN KEY (supplier_id) REFERENCES master_supplier (id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);