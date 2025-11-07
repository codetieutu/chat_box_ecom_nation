CREATE TABLE IF NOT EXISTS users (
  id varchar(20) PRIMARY KEY,
  is_bot BOOLEAN DEFAULT 0,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(100) DEFAULT "no_username",
  language_code VARCHAR(10),
  balance DECIMAL(15,2) DEFAULT 0,
  is_admin BOOLEAN DEFAULT 0,
  is_block BOOLEAN DEFAULT 0,
  transaction INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  quantity INT DEFAULT 0,
  price DECIMAL(15,2) DEFAULT 0,
  type ENUM('available', 'preorder') DEFAULT 'available'
);


CREATE TABLE IF NOT EXISTS stocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  info TEXT,
  is_sold BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id varchar(20) NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  note TEXT,                       -- nội dung kèm theo
  total_price DECIMAL(15,2) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tx_hash VARCHAR(100) NOT NULL UNIQUE,
    from_address VARCHAR(100) NOT NULL,
    to_address VARCHAR(100) NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    coin VARCHAR(10) NOT NULL,
    time DATETIME NOT NULL,
    network VARCHAR(50) DEFAULT 'BNB Smart Chain',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

