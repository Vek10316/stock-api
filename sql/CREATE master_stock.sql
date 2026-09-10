CREATE TABLE master_stock (
	stock_id NVARCHAR(25) PRIMARY KEY NOT NULL,
	stock_description NVARCHAR(100) NOT NULL,
	stock_uom NVARCHAR(50) NOT NULL,
	stock_category NVARCHAR(50) NOT NULL,
	current_quantity DECIMAL(7,2) NOT NULL
);