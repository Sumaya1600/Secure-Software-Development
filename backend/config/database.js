// backend/config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phishing_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log(' MySQL Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error(' MySQL connection failed:', err.message);
    console.error('Make sure XAMPP MySQL is running!');
  });

module.exports = {
  query: async (sql, params) => {
    const [rows] = await pool.execute(sql, params);
    return { rows };
  },
  pool
};