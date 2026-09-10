CREATE TABLE stock_movement (
	movement_id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	direction NVARCHAR(10) NOT NULL,
	stock_id NVARCHAR(25) NOT NULL,
	transact_id NVARCHAR(25) NOT NULL,
	quantity_change DECIMAL(7,2) NOT NULL,
	movement_date DATETIME NOT NULL,
	remarks NVARCHAR(100)
	CONSTRAINT fk_movement_stock_id
	FOREIGN KEY (stock_id)
	REFERENCES master_stock (stock_id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);