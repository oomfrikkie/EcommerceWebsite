-- =====================================================
-- ACCOUNTS
-- =====================================================
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'AWAITING_VERIFICATION',
    failed_login_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ACCOUNT TOKENS
-- =====================================================
CREATE TABLE IF NOT EXISTS account_token (
    token_id SERIAL PRIMARY KEY,
    token UUID NOT NULL UNIQUE,
    token_type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    account_id INTEGER NOT NULL,
    CONSTRAINT fk_account_token_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE CASCADE
);

-- =====================================================
-- CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- =====================================================
-- PRODUCTS
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT ↔ CATEGORY (MANY TO MANY)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_categories (
    product_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_product_categories_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_product_categories_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
);

-- =====================================================
-- CARTS (ONE ACTIVE PER ACCOUNT)
-- =====================================================
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE | CHECKED_OUT | EXPIRED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS one_active_cart_per_account
ON cart(account_id)
WHERE status = 'ACTIVE';

-- =====================================================
-- CART ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT uq_cart_item UNIQUE (cart_id, product_id),
    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id)
        REFERENCES cart(id)
        ON DELETE CASCADE
);

-- =====================================================
-- ORDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    account_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE CASCADE
);

-- =====================================================
-- ORDER ↔ PRODUCT (MANY TO MANY)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_products (
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (order_id, product_id),
    CONSTRAINT fk_order_products_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_products_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);

-- =====================================================
INSERT INTO categories (name) VALUES
('Clothing'),
('Streetwear'),
('Shoes'),
('Accessories'),
('Sale'),
('Sports')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED PRODUCTS
-- =====================================================
INSERT INTO products (title, brand, description, price, image_url) VALUES
('Oversized Hoodie', 'UrbanWave', 'Heavy cotton oversized hoodie', 59.99, 'OneFifty.png'),
('Classic White Tee', 'UrbanWave', 'Essential everyday t-shirt', 19.99, 'OneFifty.png'),
('Slim Fit Jeans', 'DenimCo', 'Dark wash slim fit jeans', 79.99, 'OneFifty.png'),
('Leather Sneakers', 'StepUp', 'Premium leather sneakers', 129.99, 'leathersneakers.png'),
('Baseball Cap', 'UrbanWave', 'Adjustable streetwear cap', 24.99, 'OneFifty.png');

-- Additional Products
-- Sports Products
INSERT INTO products (title, brand, description, price, image_url) VALUES
('Running Shorts', 'ActivePro', 'Lightweight running shorts for training', 34.99, 'runningshorts.png'),
('Yoga Mat', 'FlexFit', 'Non-slip yoga mat for all levels', 29.99, 'yogamat.png'),
('Basketball', 'ProPlay', 'Official size and weight basketball', 39.99, 'basketball.png'),
('Sports Water Bottle', 'HydroMax', 'Insulated stainless steel water bottle', 22.99, 'OneFifty.png'),
('Gym Duffel Bag', 'CarryAll', 'Spacious duffel bag for gym and travel', 44.99, 'OneFifty.png');
INSERT INTO products (title, brand, description, price, image_url) VALUES
('Graphic Print Tee', 'StreetArt', 'Bold graphic print t-shirt', 29.99, 'OneFifty.png'),
('Cargo Joggers', 'UrbanWave', 'Utility cargo jogger pants', 69.99, 'OneFifty.png'),
('Chunky Sneakers', 'StepUp', 'Chunky sole fashion sneakers', 109.99, 'chunkysneakers.png'),
('Denim Jacket', 'DenimCo', 'Classic blue denim jacket', 89.99, 'OneFifty.png'),
('Beanie Hat', 'UrbanWave', 'Soft knit beanie for winter', 14.99, 'OneFifty.png'),
('Crossbody Bag', 'CarryAll', 'Compact crossbody street bag', 39.99, 'OneFifty.png'),
('Socks 3-Pack', 'UrbanWave', 'Comfort cotton socks (3 pairs)', 12.99, 'OneFifty.png'),
('Windbreaker', 'UrbanWave', 'Lightweight windbreaker jacket', 54.99, 'OneFifty.png'),
('Bucket Hat', 'UrbanWave', 'Trendy bucket hat', 19.99, 'OneFifty.png'),
('High-Top Sneakers', 'StepUp', 'Retro high-top sneakers', 119.99, 'hightopsneakers.png'),
('Faux Leather Belt', 'UrbanWave', 'Adjustable faux leather belt', 17.99, 'OneFifty.png'),
('Tie-Dye Hoodie', 'StreetArt', 'Colorful tie-dye hoodie', 64.99, 'OneFifty.png'),
('Ripped Skinny Jeans', 'DenimCo', 'Distressed skinny jeans', 84.99, 'OneFifty.png'),
('Canvas Tote Bag', 'CarryAll', 'Reusable canvas tote', 15.99, 'OneFifty.png'),
('Aviator Sunglasses', 'UrbanWave', 'Classic aviator sunglasses', 34.99, 'OneFifty.png'),
('Sale Crew Socks', 'UrbanWave', 'Discounted crew socks', 7.99, 'OneFifty.png');

-- =====================================================
-- LINK PRODUCTS TO CATEGORIES
-- =====================================================
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name IN ('Clothing', 'Streetwear')
WHERE p.title = 'Oversized Hoodie';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name = 'Clothing'
WHERE p.title = 'Classic White Tee';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name = 'Clothing'
WHERE p.title = 'Slim Fit Jeans';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name IN ('Shoes', 'Streetwear')
WHERE p.title = 'Leather Sneakers';

-- Category links for new products
-- Sports category links
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Sports' WHERE p.title = 'Running Shorts';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Sports' WHERE p.title = 'Yoga Mat';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Sports' WHERE p.title = 'Basketball';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Sports' WHERE p.title = 'Sports Water Bottle';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Sports' WHERE p.title = 'Gym Duffel Bag';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Clothing' WHERE p.title = 'Graphic Print Tee';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name IN ('Clothing', 'Streetwear') WHERE p.title = 'Cargo Joggers';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Shoes' WHERE p.title = 'Chunky Sneakers';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Clothing' WHERE p.title = 'Denim Jacket';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Accessories' WHERE p.title = 'Beanie Hat';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Accessories' WHERE p.title = 'Crossbody Bag';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Accessories' WHERE p.title = 'Socks 3-Pack';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Clothing' WHERE p.title = 'Windbreaker';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Accessories' WHERE p.title = 'Bucket Hat';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Shoes' WHERE p.title = 'High-Top Sneakers';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Accessories' WHERE p.title = 'Faux Leather Belt';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name IN ('Clothing', 'Streetwear') WHERE p.title = 'Tie-Dye Hoodie';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Clothing' WHERE p.title = 'Ripped Skinny Jeans';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Accessories' WHERE p.title = 'Canvas Tote Bag';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Accessories' WHERE p.title = 'Aviator Sunglasses';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN categories c ON c.name = 'Sale' WHERE p.title = 'Sale Crew Socks';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name IN ('Accessories', 'Streetwear')
WHERE p.title = 'Baseball Cap';
