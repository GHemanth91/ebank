const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUser() {
  try {
    console.log('Checking if user Hello123 exists in the database...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', ['Hello123']);
    
    if (rows.length > 0) {
      console.log('User found:', rows[0].username);
      console.log('User ID:', rows[0].id);
      console.log('Password hash:', rows[0].password);
    } else {
      console.log('User Hello123 not found in the database');
    }

    await connection.end();
  } catch (error) {
    console.error('Error checking user:', error);
  }
}

checkUser();
