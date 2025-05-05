const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = 'http://localhost:3000';

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'InkrSpace Web Server', 
    time: new Date().toISOString() 
  });
});

// API proxy middleware for specific routes
app.get('/api/artists', (req, res) => {
  proxyRequest(req, res, '/artists');
});

app.get('/api/shops', (req, res) => {
  proxyRequest(req, res, '/parlors');
});

// Helper function for API proxying
function proxyRequest(req, res, backendPath) {
  const backendUrl = `${BACKEND_URL}${backendPath}`;
  
  console.log(`Proxying request to backend: ${req.method} ${backendUrl}`);
  
  axios.get(backendUrl)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.error('Error proxying request:', error.message);
      res.status(500).json({ error: 'Failed to fetch data from backend' });
    });
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`InkrSpace web server running on port ${PORT}`);
  console.log(`Server time: ${new Date().toISOString()}`);
});