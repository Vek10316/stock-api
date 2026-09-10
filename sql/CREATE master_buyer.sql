CREATE TABLE master_buyer (
	id INT IDENTITY(0, 1) PRIMARY KEY NOT NULL,
	buyer_id NVARCHAR(25) NOT NULL,
	buyer_id_type NVARCHAR(25) NOT NULL,
	buyer_name NVARCHAR(100) NOT NULL,
	buyer_address NVARCHAR(255),
	buyer_phone NVARCHAR(15),
	buyer_email NVARCHAR(50),
	buyer_tin NVARCHAR(25),
	last_transact_date DATETIME,
)

INSERT INTO master_buyer (buyer_id, buyer_id_type, buyer_name, buyer_address, buyer_phone, buyer_email, buyer_tin)
VALUES (
	'202103088313', 'BRN', 'Sam Recycle',
	'No 22, Jalan Seroja 42, Taman Johor Jaya, 81100 Johor Bahru, Johor',
	'60187600430', '', ''
);