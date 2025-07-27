-- Enhanced user table with security features
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL
);

-- Performance indexes
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_username ON users(username);

-- Insert a sample user for testing (password is 'TestPass123!')
-- Password hash for 'TestPass123!' using bcrypt
INSERT INTO users (username, email, password) VALUES 
('testuser', 'test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewBfizn7gPNWOd9a');

-- Create database for testing
CREATE DATABASE IF NOT EXISTS webapp_test;
USE webapp_test;

-- Same table structure for test database
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL
);

-- Performance indexes for test database
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_username ON users(username);

-- Switch back to main database
USE webapp_db; 