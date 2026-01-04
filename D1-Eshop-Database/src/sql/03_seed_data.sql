

INSERT INTO categories (name, description) VALUES
('Elektronika', 'Mobily, laptopy, příslušenství'),
('Oblečení', 'Trička, kalhoty, bundy'),
('Knihy', 'Beletrie, odborná literatura');

INSERT INTO users (email, password_hash, name, credits, is_active) VALUES
('jan@email.cz', 'hash_password_123', 'Jan Novák', 500.00, 1),
('petra@email.cz', 'hash_password_456', 'Petra Svobodová', 1000.00, 1),
('admin@eshop.cz', 'hash_admin_789', 'Admin', 0.00, 1);


INSERT INTO products (name, description, price, stock, category_id, is_featured) VALUES
('iPhone 15', 'Nejnovější Apple telefon', 29990.00, 10, 1, 1),
('Samsung Galaxy S24', 'Vlajková loď Samsungu', 24990.00, 15, 1, 1),
('Tričko Basic', 'Bavlněné tričko, různé barvy', 299.00, 100, 2, 0),
('Mikina Hoodie', 'Teplá mikina s kapucí', 899.00, 50, 2, 1),
('Clean Code', 'Kniha o psaní čistého kódu', 599.00, 25, 3, 0),
('Programování v Pythonu', 'Kompletní průvodce', 699.00, 30, 3, 0);


INSERT INTO orders (user_id, status, total_price) VALUES
(1, 'delivered', 30289.00),
(2, 'paid', 1198.00),
(1, 'pending', 899.00);


INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 29990.00),  
(1, 3, 1, 299.00),    
(2, 3, 2, 299.00),    
(2, 5, 1, 599.00),    
(3, 4, 1, 899.00);    