CREATE TABLE stock_pricing_history(
	history_id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	stock_id NVARCHAR(25) NOT NULL,
	effective_date DATETIME NOT NULL,
	buy_price DECIMAL(7,2) NOT NULL,
	sell_price DECIMAL(7,2) NOT NULL
	CONSTRAINT fk_stock_pricing_stock_id FOREIGN KEY (stock_id) REFERENCES master_stock (stock_id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);