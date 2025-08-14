-- Financial Transactions Table
-- This table stores user financial data including income and expenditure

CREATE TABLE financial_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('income', 'expenditure') NOT NULL,
  subtype VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency ENUM('USD', 'CAD') NOT NULL DEFAULT 'USD',
  transaction_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_subtype (subtype),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_currency (currency),
  INDEX idx_user_date (user_id, transaction_date)
);

-- Insert sample data for testing
INSERT INTO financial_transactions (user_id, type, subtype, amount, currency, transaction_date, description) VALUES
(1, 'income', 'salary', 5000.00, 'USD', '2024-01-15', 'Monthly salary payment'),
(1, 'expenditure', 'grocery', 150.75, 'USD', '2024-01-16', 'Weekly grocery shopping'),
(1, 'expenditure', 'transportation', 45.50, 'USD', '2024-01-17', 'Gas and parking'),
(1, 'income', 'bonus', 1000.00, 'CAD', '2024-01-18', 'Performance bonus'),
(1, 'expenditure', 'gift', 89.99, 'USD', '2024-01-19', 'Birthday gift for friend'); 