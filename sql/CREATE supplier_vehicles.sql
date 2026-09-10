CREATE TABLE supplier_vehicles (
	vehicle_id INT IDENTITY(0 ,1) PRIMARY KEY,
	supplier_id INT NOT NULL,
	plate_no nvarchar(25)
	CONSTRAINT fk_supplier_id FOREIGN KEY (supplier_id) REFERENCES master_supplier (id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);