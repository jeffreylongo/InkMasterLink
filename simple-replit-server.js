const express = require('express');
const path = require('path');
const http = require('http');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = 'http://localhost:3000';

// Serve static files
app.use(express.static('public'));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Proxy API requests to backend
app.use('/api', async (req, res) => {
  try {
    const backendUrl = `${BACKEND_URL}/api${req.url}`;
    console.log(`Proxying to backend: ${backendUrl}`);
    
    const response = await axios({
      method: req.method,
      url: backendUrl,
      data: req.method !== 'GET' ? req.body : undefined,
      headers: { 'Content-Type': 'application/json' },
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error proxying request:', error.message);
    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data || { error: 'Internal Server Error' };
    res.status(statusCode).json(errorData);
  }
});

// Specific routes for HTML files
app.get('/shop-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop-detail.html'));
});

app.get('/shops.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shops.html'));
});

app.get('/artists.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'artists.html'));
});

app.get('/guestspots.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'guestspots.html'));
});

// Explicit home route
app.get('/', (req, res) => {
  console.log('Serving home page (index.html)');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Default route serves index.html
app.use((req, res) => {
  console.log(`Serving fallback for: ${req.url}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Replit-optimized server running on port ${PORT}`);
  console.log(`API Backend URL: ${BACKEND_URL}`);
});