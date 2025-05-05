const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check PostgreSQL database connection at server startup
async function checkDatabase() {
  try {
    console.log('Checking PostgreSQL database connection...');
    // Import the pg library
    const { Pool } = require('pg');
    
    // Create a connection to the PostgreSQL database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Test the connection
    const result = await pool.query('SELECT COUNT(*) FROM parlors');
    console.log(`PostgreSQL database connected. Found ${result.rows[0].count} shops.`);
    
    // Close the connection
    await pool.end();
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
  }
}

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Ink Master Link API',
    version: '1.0.0',
    endpoints: '/api'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Check database connection after server starts
  checkDatabase();
});

module.exports = app;