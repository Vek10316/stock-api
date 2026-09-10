CREATE TABLE transaction_settings (
	ID int PRIMARY KEY IDENTITY(1, 1),
	transaction_description NVARCHAR(25),
	transaction_type NVARCHAR(25) NOT NULL DEFAULT 'PURCHASE',
	transaction_prefix NVARCHAR(25) NOT NULL,
	latest_transaction_id NVARCHAR(25) NOT NULL,
	is_active BIT NOT NULL DEFAULT 0,
)