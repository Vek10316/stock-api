CREATE TABLE expenses_record (
	expense_id INT IDENTITY(1,1) PRIMARY KEY,
	expense_date DATE NOT NULL,
	expense_category NVARCHAR(25) NOT NULL, --(GAS/FUEL) (FOOD) (ELECTRICITY/WATER) (REPAIRS) (MEDICAL)
	expense_amount DECIMAL NOT NULL,
	expense_description NVARCHAR(255),
);