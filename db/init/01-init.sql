CREATE TABLE user (
    id            VARCHAR(36)   NOT NULL PRIMARY KEY,
    name          VARCHAR(255)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    emailVerified BOOLEAN       NOT NULL DEFAULT FALSE,
    image         TEXT          NULL,
    createdAt     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    phone         TEXT          NOT NULL,
    fname         TEXT          NULL,
    address       TEXT          NULL,
    city          TEXT          NULL,
    role          INT           NULL DEFAULT 0
);

CREATE TABLE session (
    id        VARCHAR(36)  NOT NULL PRIMARY KEY,
    expiresAt TIMESTAMP(3) NOT NULL,
    token     VARCHAR(255) NOT NULL UNIQUE,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ipAddress TEXT         NULL,
    userAgent TEXT         NULL,
    userId    VARCHAR(36)  NOT NULL,
    CONSTRAINT session_userId_fk FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
    INDEX session_userId_idx (userId)
);

CREATE TABLE account (
    id                    VARCHAR(36)  NOT NULL PRIMARY KEY,
    accountId             TEXT         NOT NULL,
    providerId            TEXT         NOT NULL,
    userId                VARCHAR(36)  NOT NULL,
    accessToken           TEXT         NULL,
    refreshToken          TEXT         NULL,
    idToken               TEXT         NULL,
    accessTokenExpiresAt  TIMESTAMP(3) NULL,
    refreshTokenExpiresAt TIMESTAMP(3) NULL,
    scope                 TEXT         NULL,
    password              TEXT         NULL,
    createdAt             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT account_userId_fk FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
    INDEX account_userId_idx (userId)
);

CREATE TABLE verification (
    id         VARCHAR(36)  NOT NULL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    value      TEXT         NOT NULL,
    expiresAt  TIMESTAMP(3) NOT NULL,
    createdAt  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX verification_identifier_idx (identifier)
);
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    slug VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(300) NOT NULL,
    cover_image_key VARCHAR(255) NULL,
    slices VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    details_html TEXT NULL,
    CONSTRAINT category_fk FOREIGN KEY (category_id) REFERENCES categories(id)
);
CREATE TABLE carts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('cancelled', 'pending', 'completed') NOT NULL DEFAULT 'pending',
    customer_message TEXT NULL,
    photos_folder VARCHAR(255) NULL,
    delivery_date DATETIME NULL,
    CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
);
CREATE TABLE cart_items (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL,
    article_id INT NOT NULL,
    slices INT NOT NULL CHECK (slices >= 1),
    quantity INT NOT NULL CHECK (quantity >= 1),
    unit_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT cart_items_cart_fk FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT cart_items_article_fk FOREIGN KEY (article_id) REFERENCES articles(id)
);
