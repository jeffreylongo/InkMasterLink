const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = 'http://localhost:3000';

// Enhanced logging
function logWithTimestamp(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Basic middleware
app.use(cors());
app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  logWithTimestamp(`${req.method} ${req.url}`);
  next();
});

// Health check endpoints - multiple paths for testing
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'InkrSpace Web Server', 
    time: new Date().toISOString(),
    port: PORT
  });
});

app.get('/healthcheck', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'InkrSpace Web Server', 
    time: new Date().toISOString(),
    port: PORT
  });
});

// API proxy middleware for specific routes
app.get('/api/artists', (req, res) => {
  proxyRequest(req, res, '/api/artists');
});

app.get('/api/shops', (req, res) => {
  proxyRequest(req, res, '/api/parlors');
});

// Helper function for API proxying
function proxyRequest(req, res, backendPath) {
  const backendUrl = `${BACKEND_URL}${backendPath}`;
  
  logWithTimestamp(`Proxying request to backend: ${req.method} ${backendUrl}`);
  
  axios.get(backendUrl)
    .then(response => {
      logWithTimestamp(`Successfully received response from backend: ${backendPath}`);
      res.json(response.data);
    })
    .catch(error => {
      logWithTimestamp(`Error proxying request: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch data from backend' });
    });
}

// Specific routes for HTML files
const htmlFiles = [
  { path: '/', file: 'index.html' },
  { path: '/index.html', file: 'index.html' },
  { path: '/artists', file: 'artists.html' },
  { path: '/artists.html', file: 'artists.html' },
  { path: '/shops', file: 'shops.html' },
  { path: '/shops.html', file: 'shops.html' },
  { path: '/artist-detail.html', file: 'artist-detail.html' },
  { path: '/shop-detail.html', file: 'shop-detail.html' },
  { path: '/guestspots', file: 'guestspots.html' },
  { path: '/guestspots.html', file: 'guestspots.html' },
  { path: '/guestspot-apply.html', file: 'guestspot-apply.html' },
  { path: '/healthcheck.html', file: 'healthcheck.html' },
];

// Register routes for all HTML files
htmlFiles.forEach(({ path: routePath, file }) => {
  app.get(routePath, (req, res) => {
    const filePath = path.join(__dirname, 'public', file);
    logWithTimestamp(`Serving HTML file: ${filePath}`);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      logWithTimestamp(`File not found: ${filePath}`);
      res.status(404).send('File not found');
    }
  });
});

// Serve static files after routing specific paths
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  logWithTimestamp(`InkrSpace web server running on port ${PORT}`);
  logWithTimestamp(`Server directory: ${__dirname}`);
  logWithTimestamp(`Public directory: ${path.join(__dirname, 'public')}`);
  
  // List files in public directory for debugging
  try {
    const files = fs.readdirSync(path.join(__dirname, 'public'));
    logWithTimestamp(`Files in public directory: ${files.join(', ')}`);
  } catch (error) {
    logWithTimestamp(`Error reading public directory: ${error.message}`);
  }
});