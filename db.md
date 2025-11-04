CREATE TABLE IF NOT EXISTS users (
  id varchar(20) PRIMARY KEY,
  is_bot BOOLEAN DEFAULT 0,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(100),
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
