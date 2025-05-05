const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.url === '/') {
    // Serve index.html
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error: ${err.message}`);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } 
  else if (req.url.startsWith('/api/parlors/random')) {
    // Get random parlors
    const limit = 9;
    pool.query('SELECT * FROM parlors ORDER BY RANDOM() LIMIT $1', [limit])
      .then(result => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          count: result.rows.length, 
          data: result.rows 
        }));
      })
      .catch(err => {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Database error' }));
      });
  }
  else if (req.url === '/api/health') {
    // Health check endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  }
  else {
    // Try to serve a static file
    const filePath = path.join(__dirname, 'public', req.url);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File doesn't exist
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end(`Error: ${err.message}`);
          return;
        }
        
        // Determine content type
        const ext = path.extname(filePath);
        let contentType = 'text/plain';
        
        switch (ext) {
          case '.html': contentType = 'text/html'; break;
          case '.css': contentType = 'text/css'; break;
          case '.js': contentType = 'text/javascript'; break;
          case '.json': contentType = 'application/json'; break;
          case '.png': contentType = 'image/png'; break;
          case '.jpg': contentType = 'image/jpeg'; break;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simpler server running on port ${PORT}`);
  
  // Test database connection
  pool.query('SELECT COUNT(*) FROM parlors')
    .then(result => {
      console.log(`Database connected. Found ${result.rows[0].count} shops.`);
    })
    .catch(err => {
      console.error('Database connection error:', err.message);
    });
});
