const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config();

async function verifyUser() {
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
    
    // Check if user exists
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', ['testuser']);
    
    if (users.length === 0) {
      console.log('User "testuser" does not exist in the database');
      
      // Create test user
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('testpassword', 10);
      const userId = '0abd9867-6e6e-4a78-a57a-429ca241ba4d';
      
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
      
      // Verify user was created
      const [newUsers] = await connection.execute('SELECT * FROM users WHERE username = ?', ['testuser']);
      console.log('User details:', newUsers[0]);
    } else {
      console.log('User "testuser" exists in the database');
      console.log('User ID:', users[0].id);
      console.log('Username:', users[0].username);
      console.log('Email:', users[0].email);
      
      // Test password
      const isPasswordValid = await bcrypt.compare('testpassword', users[0].password);
      console.log('Is password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('Updating password...');
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        await connection.execute('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, 'testuser']);
        console.log('Password updated successfully');
      }
    }
    
    // Close connection
    await connection.end();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyUser();
