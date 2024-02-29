INSERT INTO users (user_username, user_first_name, user_last_name, user_email, user_hashed_pwd) VALUES ('usr', 'Jericho', 'Sharman', 'jsharman@hotmail.com.au', 'unknown');
-- Inserting dummy data into ITEM_TYPES
INSERT INTO ITEM_TYPES (type_id) VALUES (1), (2), (3);

-- Inserting dummy data into users
INSERT INTO users (user_username, user_first_name, user_last_name, user_email, user_hashed_pwd) 
VALUES 
('johnDoe', 'John', 'Doe', 'johndoe@example.com', 'hashedpassword1'),
('janeDoe', 'Jane', 'Doe', 'janedoe@example.com', 'hashedpassword2');

-- Inserting dummy data into manufacturers
INSERT INTO manufacturers (manufacturer_name, manufacturer_description, manufacturer_number) 
VALUES 
('Acme Corp', 'Description of Acme Corp', 12345),
('Globex', 'Description of Globex', 67890);




-- Inserting dummy data into LOCATION_MASTER
INSERT INTO LOCATION_MASTER (userID,location_id,location_name, location_photo, location_desc) 
VALUES 
(2,'A001','Location 1', 'photo_url_1', 'Description of Location 1'),
(2,'A002','Location 2', 'photo_url_2', 'Description of Location 2');


-- Inserting dummy data into PRIME_LOCATION
INSERT INTO PRIME_LOCATION (userID,location_id, prime_location_name, prime_location_description) 
VALUES 
(2,1, 'Warehouse A', 'Primary storage location'),
(2,2, 'Storefront B', 'Retail location');




-- Inserting dummy data into ITEM_MASTER
INSERT INTO ITEM_MASTER (item_number, alt_item_number, item_descr, item_barcode, item_weight, item_height, item_width, image_link_ID, item_type, manufacturer_ID, item_files) 
VALUES 
(1001, 2001, 'Item Description 1', '1234567890123', 100, 10, 10, 1, 1, 1, 'file1.pdf'),
(1002, 2002, 'Item Description 2', '1234567890124', 200, 20, 20, 2, 2, 2, 'file2.pdf');

-- Inserting dummy data into SOH (Stock on Hand)
INSERT INTO SOH (soh_item, soh_location) 
VALUES 
(1001, 1),
(1002, 2);

-- Inserting dummy data into ITEM_IMAGES_URLS
INSERT INTO ITEM_IMAGES_URLS (the_item, the_image_url, the_image_description) 
VALUES 
(1001, 'http://example.com/image1.jpg', 'Image description 1'),
(1002, 'http://example.com/image2.jpg', 'Image description 2');
