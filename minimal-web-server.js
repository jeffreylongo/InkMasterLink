const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple MIME type mapping
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Serve files from public directory
  let filePath = req.url;
  
  // Default to index.html when requesting the root
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  // Remove query parameters if any
  filePath = filePath.split('?')[0];
  
  // Map URL to filesystem path
  filePath = path.join(__dirname, 'public', filePath);
  
  // Get file extension
  const extname = path.extname(filePath).toLowerCase();
  
  // Check if the file exists and serve it
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // For single-page apps, serve index.html for unknown paths
      if (req.url.startsWith('/api/')) {
        // Return empty arrays for API requests
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: 0, data: [] }));
      } else {
        // Serve index.html for non-API routes
        const indexPath = path.join(__dirname, 'public', 'index.html');
        fs.readFile(indexPath, (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      }
      return;
    }
    
    // Determine content type
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal web server running on port ${PORT}`);
});