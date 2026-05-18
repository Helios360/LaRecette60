CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    slug VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(300) NOT NULL,
    slices VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT category_fk FOREIGN KEY (category_id) REFERENCES categories(id)
);
CREATE TABLE carts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('cancelled', 'pending', 'completed') NOT NULL DEFAULT 'pending',
    CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES user(id)
);
CREATE TABLE cart_items (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL,
    article_id INT NOT NULL,
    slices INT NOT NULL CHECK (slices >= 1),
    quantity INT NOT NULL CHECK (quantity >= 1),
    unit_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT cart_items_cart_fk FOREIGN KEY (cart_id) REFERENCES carts(id),
    CONSTRAINT cart_items_article_fk FOREIGN KEY (article_id) REFERENCES articles(id)
);