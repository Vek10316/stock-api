CREATE TABLE buyer_vehicles (
	vehicle_id INT IDENTITY(1,1) PRIMARY KEY,
	buyer_id INT NOT NULL,
	plate_no nvarchar(25)
	CONSTRAINT fk_vehicles_buyer_id
	FOREIGN KEY (buyer_id) REFERENCES master_buyer (id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);