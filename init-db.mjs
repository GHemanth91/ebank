import db from "./database.js";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const client = db;

// Create users table with enhanced fields
await client.query(
`CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  fullName VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(100),
  city VARCHAR(50),
  state VARCHAR(50),
  zipCode VARCHAR(10),
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  profileImage VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  lastLogin DATETIME,
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  refreshToken VARCHAR(255)
  )`,
);

// Create accounts table with enhanced fields
await client.query(
`CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  accountNumber VARCHAR(20) UNIQUE,
  type ENUM('checking', 'savings', 'investment') NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,
);

// Create transactions table with enhanced fields
await client.query(
`CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  fromAccountId VARCHAR(36),
  toAccountId VARCHAR(36),
  type ENUM('deposit', 'withdrawal', 'transfer', 'payment', 'fee') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
  reference VARCHAR(50),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  FOREIGN KEY (fromAccountId) REFERENCES accounts(id) ON DELETE SET NULL,
  FOREIGN KEY (toAccountId) REFERENCES accounts(id) ON DELETE SET NULL
  )`,
);

// Create savings goals table
await client.query(
`CREATE TABLE IF NOT EXISTS savings_goals (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  accountId VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  targetAmount DECIMAL(10, 2) NOT NULL,
  currentAmount DECIMAL(10, 2) DEFAULT 0.00,
  startDate DATETIME NOT NULL,
  targetDate DATETIME,
  category VARCHAR(50),
  description TEXT,
  isCompleted BOOLEAN DEFAULT FALSE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
  )`,
);

// Create budget table
await client.query(
`CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  period ENUM('daily', 'weekly', 'monthly', 'yearly') DEFAULT 'monthly',
  category VARCHAR(50) NOT NULL,
  startDate DATETIME NOT NULL,
  endDate DATETIME,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,
);

// Create budget expenses table to track spending against budgets
await client.query(
`CREATE TABLE IF NOT EXISTS budget_expenses (
  id VARCHAR(36) PRIMARY KEY,
  budgetId VARCHAR(36) NOT NULL,
  transactionId VARCHAR(36),
  amount DECIMAL(10, 2) NOT NULL,
  date DATETIME NOT NULL,
  description TEXT,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (budgetId) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE SET NULL
  )`,
);

// Create notifications table
await client.query(
`CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('transaction', 'security', 'account', 'budget', 'goal', 'system') NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,
);

// Create bills table for bill payments
await client.query(
`CREATE TABLE IF NOT EXISTS bills (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  payee VARCHAR(100) NOT NULL,
  accountNumber VARCHAR(50),
  amount DECIMAL(10, 2) NOT NULL,
  dueDate DATETIME NOT NULL,
  frequency ENUM('one-time', 'weekly', 'monthly', 'yearly') DEFAULT 'monthly',
  category VARCHAR(50),
  isAutoPay BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,
);

// Create a default admin user if it doesn't exist
const adminPassword = await bcrypt.hash('admin123', 10);
const adminId = uuidv4();

try {
  // Drop the users table and recreate it with the correct schema
  await client.query('DROP TABLE IF EXISTS users');

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      fullName VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone VARCHAR(20),
      address VARCHAR(100),
      city VARCHAR(50),
      state VARCHAR(50),
      zipCode VARCHAR(10),
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      profileImage VARCHAR(255),
      isActive BOOLEAN DEFAULT TRUE,
      lastLogin DATETIME,
      accountType ENUM('checking', 'savings', 'both') DEFAULT 'checking',
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME,
      refreshToken VARCHAR(255)
    )
  `);

  // Create the admin user
  await client.query(
    'INSERT INTO users (id, fullName, email, username, password, accountType, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [adminId, 'Admin User', 'admin@ebank.com', 'admin', adminPassword, 'checking', new Date()]
  );
  console.log('Default admin user created');

  // Create a checking account for the admin
  const accountId = uuidv4();
  const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

  await client.query(
    'INSERT INTO accounts (id, userId, accountNumber, type, balance, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [accountId, adminId, accountNumber, 'checking', 10000.00, new Date()]
  );
  console.log('Default admin account created');
} catch (error) {
  console.error('Error creating default admin:', error);
}

console.log("Database initialized successfully");
