const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkPassword() {
  try {
    console.log('Checking if password is correct for user Hello123...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', ['Hello123']);
    
    if (rows.length > 0) {
      const user = rows[0];
      console.log('User found:', user.username);
      console.log('Password hash:', user.password);
      
      const passwordToCheck = 'password123';
      console.log('Checking password:', passwordToCheck);
      
      const isMatch = await bcrypt.compare(passwordToCheck, user.password);
      console.log('Password match:', isMatch);
    } else {
      console.log('User Hello123 not found in the database');
    }

    await connection.end();
  } catch (error) {
    console.error('Error checking password:', error);
  }
}

checkPassword();
