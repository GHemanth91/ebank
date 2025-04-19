const mysql = require("mysql2/promise");
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create connection pool using environment variables
const pool = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "ebank",
	port: process.env.DB_PORT || 3306,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	debug: process.env.NODE_ENV === 'development',
});

// Test database connection
const testConnection = async () => {
	try {
		const connection = await pool.getConnection();
		console.log('Database connection established successfully');
		connection.release();
		return true;
	} catch (error) {
		console.error('Database connection failed:', error.message);
		return false;
	}
};

// Export the pool and test function
module.exports = pool;
module.exports.testConnection = testConnection;
