const express = require('express');
const path = require('path');
const { Pool } = require('pg');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create PostgreSQL connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Serve static files from public folder
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Random shops endpoint
app.get('/api/parlors/random', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const { rows } = await pool.query('SELECT * FROM parlors ORDER BY RANDOM() LIMIT $1', [limit]);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching random parlors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch random parlors' });
  }
});

// Featured shops endpoint
app.get('/api/parlors/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 1;
    const { rows } = await pool.query(
      'SELECT * FROM parlors WHERE featured = true ORDER BY rating DESC NULLS LAST LIMIT $1', 
      [limit]
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching featured parlors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured parlors' });
  }
});

// Artists endpoint (simplified)
app.get('/api/artists', async (req, res) => {
  res.json([{
    id: 1,
    name: "Featured Artist",
    featured: true,
    specialty: "Realism, Traditional",
    location: { city: "New York", state: "NY" },
    profileImage: "https://images.unsplash.com/photo-1521488674203-62bf581664be"
  }]);
});

// All other routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection
  pool.query('SELECT COUNT(*) FROM parlors')
    .then(result => {
      console.log(`Connected to database. Found ${result.rows[0].count} shops.`);
    })
    .catch(err => {
      console.error('Database connection error:', err.message);
    });
});