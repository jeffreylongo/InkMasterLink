const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Create PostgreSQL connection pool with better timeout handling
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5,
  min: 1,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 5000,
  acquireTimeoutMillis: 5000,
  createTimeoutMillis: 5000,
  destroyTimeoutMillis: 5000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
});

// Set up MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API routes
  try {
    if (req.url.startsWith('/api/')) {
      await handleApiRequest(req, res);
      return;
    }

    // Serve static files
    serveStaticFile(req, res);
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Server error' }));
  }
});

// Handle API requests
async function handleApiRequest(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  // Parse query parameters
  const url = new URL(req.url, `http://localhost`);
  const params = url.searchParams;
  
  try {
    // Random parlors endpoint
    if (req.url.startsWith('/api/parlors/random')) {
      const limit = parseInt(params.get('limit') || '9');
      const { rows } = await pool.query('SELECT * FROM parlors ORDER BY RANDOM() LIMIT $1', [limit]);
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: rows.length, data: rows }));
      return;
    }
    
    // Featured parlors endpoint
    if (req.url.startsWith('/api/parlors/featured')) {
      const limit = parseInt(params.get('limit') || '1');
      const { rows } = await pool.query(
        'SELECT * FROM parlors WHERE featured = true ORDER BY rating DESC NULLS LAST LIMIT $1', 
        [limit]
      );
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: rows.length, data: rows }));
      return;
    }
    
    // Get parlors by state
    if (req.url.startsWith('/api/parlors/state/')) {
      const statePath = req.url.split('/api/parlors/state/')[1];
      const state = statePath.split('/')[0];
      const limit = parseInt(params.get('limit') || '50');
      const offset = parseInt(params.get('offset') || '0');
      
      const { rows } = await pool.query(
        `SELECT * FROM parlors 
         WHERE location->>'state' = $1 
         ORDER BY rating DESC NULLS LAST 
         LIMIT $2 OFFSET $3`, 
        [state, limit, offset]
      );
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: rows.length, data: rows }));
      return;
    }
    
    // Get available states
    if (req.url.startsWith('/api/parlors/states')) {
      const { rows } = await pool.query(
        `SELECT DISTINCT location->>'state' as state 
         FROM parlors 
         WHERE location->>'state' IS NOT NULL 
         ORDER BY state`
      );
      
      const states = rows.map(row => row.state);
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: states.length, data: states }));
      return;
    }
    
    // Get cities by state
    if (req.url.startsWith('/api/parlors/cities/')) {
      const statePath = req.url.split('/api/parlors/cities/')[1];
      const state = statePath.split('?')[0];
      
      const { rows } = await pool.query(
        `SELECT DISTINCT location->>'city' as city 
         FROM parlors 
         WHERE location->>'state' = $1 AND location->>'city' IS NOT NULL 
         ORDER BY city`, 
        [state]
      );
      
      const cities = rows.map(row => row.city);
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: cities.length, data: cities }));
      return;
    }
    
    // Get parlors by state and/or city using query params
    if (req.url.startsWith('/api/parlors') && (params.has('state') || params.has('city'))) {
      const state = params.get('state');
      const city = params.get('city');
      const limit = parseInt(params.get('limit') || '100');
      const offset = parseInt(params.get('offset') || '0');
      
      let query = 'SELECT * FROM parlors WHERE ';
      let queryParams = [];
      let paramIndex = 1;
      let filters = [];
      
      if (state) {
        query += `location->>'state' = $${paramIndex}`;
        queryParams.push(state);
        paramIndex++;
        filters.push(`state: ${state}`);
      }
      
      if (city) {
        if (state) query += ' AND ';
        query += `location->>'city' = $${paramIndex}`;
        queryParams.push(city);
        paramIndex++;
        filters.push(`city: ${city}`);
      }
      
      query += ` ORDER BY rating DESC NULLS LAST LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);
      
      console.log(`Filtering shops by ${filters.join(', ')}, limit: ${limit}, offset: ${offset}`);
      
      const { rows } = await pool.query(query, queryParams);
      
      console.log(`Found ${rows.length} shops with filters: ${filters.join(', ')}`);
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: rows.length, data: rows }));
      return;
    }
    
    // Get all shops with pagination (exact match for /api/parlors)
    if (req.url === '/api/parlors' || (req.url.startsWith('/api/parlors?') && !params.has('state') && !params.has('city'))) {
      const limit = parseInt(params.get('limit') || '5000'); // Increased to load more shops
      const offset = parseInt(params.get('offset') || '0');
      
      const { rows } = await pool.query(
        `SELECT id, name, 
                location->>'city' as city, 
                location->>'state' as state,
                rating, review_count, 
                contact->>'phone' as phone,
                location->>'address' as address,
                hours, 
                contact->>'website' as website,
                featured, sponsored 
         FROM parlors 
         ORDER BY rating DESC NULLS LAST 
         LIMIT $1 OFFSET $2`, 
        [limit, offset]
      );
      
      console.log(`Serving ${rows.length} shops from database`);
      
      res.writeHead(200);
      res.end(JSON.stringify(rows)); // Return array directly, not wrapped object
      return;
    }
    
    // Get artists (minimal hardcoded implementation)
    if (req.url.startsWith('/api/artists')) {
      const mockArtists = [{
        id: 1,
        name: "Featured Artist",
        featured: true,
        specialty: "Realism, Traditional",
        location: { city: "New York", state: "NY" },
        profileImage: "https://images.unsplash.com/photo-1521488674203-62bf581664be"
      }];
      
      res.writeHead(200);
      res.end(JSON.stringify(mockArtists));
      return;
    }

    // Health check endpoint
    if (req.url === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }
    
    // Get parlor by ID
    if (req.url.match(/^\/api\/parlors\/(\d+)$/)) {
      const id = req.url.split('/')[3];
      const { rows } = await pool.query('SELECT * FROM parlors WHERE id = $1', [id]);
      
      if (rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, message: 'Shop not found' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(rows[0]));
      return;
    }
    
    // Guestspots endpoint (minimal implementation)
    if (req.url.startsWith('/api/guestspots')) {
      const mockGuestspots = [];
      res.writeHead(200);
      res.end(JSON.stringify(mockGuestspots));
      return;
    }
    
    // API endpoint not found
    res.writeHead(404);
    res.end(JSON.stringify({ success: false, message: 'API endpoint not found' }));
    
  } catch (error) {
    console.error('API error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ success: false, message: 'API error', error: error.message }));
  }
}

// Serve static files
function serveStaticFile(req, res) {
  // Default to index.html
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query parameters if any
  filePath = filePath.split('?')[0];
  
  // Map to filesystem path
  filePath = path.join(__dirname, 'public', filePath);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // For single-page app, serve index.html for all unknown routes
      filePath = path.join(__dirname, 'public', 'index.html');
    }
    
    // Get file extension for content type
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Ink Master Link stable server running on port ${PORT}`);
  
  try {
    const result = await pool.query('SELECT COUNT(*) FROM parlors');
    console.log(`Database connected. Found ${result.rows[0].count} shops.`);
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
});
