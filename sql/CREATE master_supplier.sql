CREATE TABLE master_supplier (
	id INT IDENTITY(1, 1) PRIMARY KEY NOT NULL,
	supplier_id NVARCHAR(25) NOT NULL,
	supplier_id_type NVARCHAR(25) NOT NULL,
	supplier_name NVARCHAR(100) NOT NULL,
	supplier_address NVARCHAR(255),
	supplier_phone NVARCHAR(15),
	supplier_email NVARCHAR(50),
	supplier_tin NVARCHAR(25),
	last_transact_date DATETIME,
)

INSERT INTO master_supplier (supplier_id, supplier_id_type, supplier_name, supplier_address, supplier_phone, supplier_email, supplier_tin)
VALUES (
	'202103088313', 'BRN', 'Sam Recycle',
	'No 22, Jalan Seroja 42, Taman Johor Jaya, 81100 Johor Bahru, Johor',
	'60187600430', '', ''
);