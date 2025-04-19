const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

async function createTestUser() {
  try {
    console.log('Connecting to database...');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ebank'
    });
    
    console.log('Connected to database successfully');
    
    // Check if test user exists
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', ['testuser']);
    
    if (users.length > 0) {
      console.log('Test user already exists, updating password...');
      
      // Update password
      const hashedPassword = await bcrypt.hash('testpassword', 10);
      await connection.execute('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, 'testuser']);
      
      console.log('Password updated successfully');
      console.log('User ID:', users[0].id);
      console.log('Username:', users[0].username);
      console.log('Email:', users[0].email);
    } else {
      console.log('Creating test user...');
      
      // Create user
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash('testpassword', 10);
      
      await connection.execute(
        `INSERT INTO users (
          id, fullName, email, phone, address, city, state, zipCode,
          username, password, createdAt, accountType
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          'Test User',
          'testuser@example.com',
          '1234567890',
          '123 Test St',
          'Test City',
          'Test State',
          '12345',
          'testuser',
          hashedPassword,
          new Date(),
          'checking'
        ]
      );
      
      console.log('Test user created successfully');
      console.log('User ID:', userId);
      
      // Create account
      const accountId = uuidv4();
      
      await connection.execute(
        `INSERT INTO accounts (
          id, userId, type, balance, createdAt
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          accountId,
          userId,
          'checking',
          1000,
          new Date()
        ]
      );
      
      console.log('Test account created successfully');
      console.log('Account ID:', accountId);
    }
    
    // Close connection
    await connection.end();
    
    console.log('Test user ready for login:');
    console.log('Username: testuser');
    console.log('Password: testpassword');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
