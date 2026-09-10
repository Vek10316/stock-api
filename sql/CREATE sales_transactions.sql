CREATE TABLE sales_transactions (
	transact_id NVARCHAR(25) PRIMARY KEY NOT NULL,
	buyer_id INT NOT NULL,
	transact_address NVARCHAR(255),
	transact_date DATETIME NOT NULL,
	transact_total_amount DECIMAL(7,2) NOT NULL,
	transact_status NVARCHAR(25)
	CONSTRAINT fk_sales_buyer_id
	FOREIGN KEY (buyer_id) REFERENCES master_buyer (id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);