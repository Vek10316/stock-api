CREATE TABLE bukku_buyers (
	buyer_id INT NOT NULL,
	contact_code NVARCHAR(50) NOT NULL,
	CONSTRAINT fk_bukku_buyer_id
	FOREIGN KEY (buyer_id) REFERENCES master_buyer (id)
	ON UPDATE CASCADE
	ON DELETE CASCADE
);