CREATE TABLE sales_transactions_details (
	detail_id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	transact_id NVARCHAR(25) NOT NULL,
	stock_id NVARCHAR(25) NOT NULL,
	item_price DECIMAL(7,2) NOT NULL,
	item_quantity DECIMAL(7,2) NOT NULL,
	transact_subtotal DECIMAL(7,2) NOT NULL
	
	CONSTRAINT fk_sales_details_transact_id
	FOREIGN KEY (transact_id) REFERENCES sales_transactions (transact_id)
	ON UPDATE CASCADE
	ON DELETE CASCADE,
	CONSTRAINT fk_sales_details_stock_id
	FOREIGN KEY (stock_id) REFERENCES master_stock (stock_id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);