const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// File extensions to MIME types mapping
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Create database connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Handle API requests
  if (req.url.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }
  
  // Serve static files
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file doesn't exist, serve index.html (for SPA routing)
      filePath = path.join(__dirname, 'public', 'index.html');
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

// API request handler
async function handleApiRequest(req, res) {
  // Set response headers
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Handle random parlors request
    if (req.url.startsWith('/api/parlors/random')) {
      const urlParams = new URL(req.url, 'http://localhost').searchParams;
      const limit = parseInt(urlParams.get('limit') || '9');
      
      const { rows } = await pool.query('SELECT * FROM parlors ORDER BY RANDOM() LIMIT $1', [limit]);
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: rows.length, data: rows }));
      return;
    }
    
    // Handle featured parlors request
    if (req.url.startsWith('/api/parlors/featured')) {
      const urlParams = new URL(req.url, 'http://localhost').searchParams;
      const limit = parseInt(urlParams.get('limit') || '1');
      
      const { rows } = await pool.query(
        'SELECT * FROM parlors WHERE featured = true ORDER BY rating DESC NULLS LAST LIMIT $1', 
        [limit]
      );
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: rows.length, data: rows }));
      return;
    }
    
    // Handle artists request (simplified)
    if (req.url.startsWith('/api/artists')) {
      const mockData = [{
        id: 1,
        name: "Featured Artist",
        featured: true,
        specialty: "Realism, Traditional",
        location: { city: "New York", state: "NY" },
        profileImage: "https://images.unsplash.com/photo-1521488674203-62bf581664be"
      }];
      
      res.writeHead(200);
      res.end(JSON.stringify(mockData));
      return;
    }
    
    // Default API response
    res.writeHead(404);
    res.end(JSON.stringify({ success: false, message: 'API endpoint not found' }));
    
  } catch (error) {
    console.error('API error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ success: false, message: 'Server error' }));
  }
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Basic server running on port ${PORT}`);
  
  // Test database connection
  pool.query('SELECT COUNT(*) FROM parlors')
    .then(result => console.log(`Database connected. Found ${result.rows[0].count} shops.`))
    .catch(err => console.error('Database connection error:', err.message));
});