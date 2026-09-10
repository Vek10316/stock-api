CREATE TABLE bukku_contacts_settings (
	contact_type NVARCHAR(25) NOT NULL UNIQUE,
	contact_code_prefix NVARCHAR(25) NOT NULL UNIQUE,
	latest_contact_code NVARCHAR(25) NOT NULL,
)

INSERT INTO bukku_contacts_settings ( contact_type, contact_code_prefix, latest_contact_code ) VALUES
( 'BUYER', 'BUY-', 'BYR-0' ),
( 'SUPPLIER', 'SUPPLY-', 'SUPPLY-0' )