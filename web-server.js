const express = require('express');
const path = require('path');
const cors = require('cors');

// Create a simplified Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Proxy API requests to the backend server
const axios = require('axios');
const BACKEND_URL = 'http://localhost:3000';

// Handle all API requests and proxy them to the backend
app.use('/api', async (req, res) => {
  try {
    // Map 'shops' URLs to 'parlors' for backward compatibility
    let backendUrl = req.url;
    if (req.url.startsWith('/shops')) {
      backendUrl = req.url.replace('/shops', '/parlors');
      console.log(`Mapped URL from ${req.url} to ${backendUrl} for backward compatibility`);
    }
    
    console.log(`Proxying request to backend: ${req.method} ${backendUrl}`);
    
    const fullBackendUrl = `${BACKEND_URL}${backendUrl}`;
    const response = await axios({
      method: req.method,
      url: fullBackendUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if it exists
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      }
    });
    
    // Return the response from the backend
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error proxying request to backend:', error.message);
    console.error('Request URL:', req.url);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    // Return the error response with appropriate status code
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Internal Server Error' };
    
    res.status(status).json(data);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Specific routes for HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/artists', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'artists.html'));
});

app.get('/artists/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'artist-detail.html'));
});

app.get('/artist-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'artist-detail.html'));
});

app.get('/shops', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shops.html'));
});

app.get('/shops/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop-detail.html'));
});

app.get('/shop-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop-detail.html'));
});

app.get('/guestspots', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'guestspots.html'));
});

app.get('/guestspot-apply.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'guestspot-apply.html'));
});

app.get('/healthcheck.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'healthcheck.html'));
});

// 404 handler for missing routes
app.use((req, res) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web server running on port ${PORT}`);
  console.log(`Server time: ${new Date().toISOString()}`);
});