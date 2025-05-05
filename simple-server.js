const express = require('express');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Serve static content
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints that mirror the backend API for development purposes
app.get('/api', (req, res) => {
  res.json({
    message: 'Ink Link API - Development Preview',
    version: '1.0.0',
    status: 'online',
    endpoints: [
      '/api/artists',
      '/api/shops',
      '/api/guestspots',
      '/api/auth',
      '/api/reviews'
    ]
  });
});

// Sample artist endpoint
app.get('/api/artists', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Jane Doe',
      profileImage: 'https://example.com/image1.jpg',
      specialty: ['Traditional', 'Neo-Traditional'],
      location: {
        city: 'New York',
        state: 'NY',
        country: 'USA'
      },
      rating: 4.8,
      featured: true,
      sponsored: false,
      travelWilling: true
    },
    {
      id: '2',
      name: 'John Smith',
      profileImage: 'https://example.com/image2.jpg',
      specialty: ['Blackwork', 'Fine Line'],
      location: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA'
      },
      rating: 4.6,
      featured: false,
      sponsored: true,
      travelWilling: false
    }
  ]);
});

// Redirect from old parlors endpoint to shops
app.get('/api/parlors', (req, res) => {
  res.redirect('/api/shops');
});

// Sample shops endpoint
app.get('/api/shops', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Ink Masters Studio',
      featuredImage: 'https://example.com/parlor1.jpg',
      location: {
        city: 'Chicago',
        state: 'IL',
        country: 'USA'
      },
      rating: 4.9,
      featured: true,
      sponsored: true
    },
    {
      id: '2',
      name: 'Black Rose Tattoo',
      featuredImage: 'https://example.com/parlor2.jpg',
      location: {
        city: 'Miami',
        state: 'FL',
        country: 'USA'
      },
      rating: 4.7,
      featured: true,
      sponsored: false
    }
  ]);
});

// Sample guestspots endpoint
app.get('/api/guestspots', (req, res) => {
  res.json([
    {
      id: '1',
      parlorId: '1',
      parlorName: 'Ink Masters Studio',
      parlorLocation: {
        city: 'Chicago',
        state: 'IL',
        country: 'USA'
      },
      status: 'open',
      dateStart: '2025-05-15',
      dateEnd: '2025-06-10',
      description: 'Looking for an experienced traditional tattoo artist for a 4-week guest spot. Busy shop in downtown Chicago with consistent walk-ins and appointments.',
      featured: true
    },
    {
      id: '2',
      parlorId: '2',
      parlorName: 'Black Rose Tattoo',
      parlorLocation: {
        city: 'Miami',
        state: 'FL',
        country: 'USA'
      },
      status: 'open',
      dateStart: '2025-06-01',
      dateEnd: '2025-06-15',
      description: 'Seeking color realism artist for a 2-week guest spot. Shop is located near South Beach with high tourist traffic. Perfect for building your portfolio.',
      featured: false
    },
    {
      id: '3',
      parlorId: '3',
      parlorName: 'Electric Needle Studio',
      artistId: '2',
      artistName: 'John Smith',
      parlorLocation: {
        city: 'Austin',
        state: 'TX',
        country: 'USA'
      },
      status: 'confirmed',
      dateStart: '2025-07-05',
      dateEnd: '2025-07-20',
      description: 'Japanese style artist John Smith will be joining us for a 2-week guest spot. Book your appointments now! Only a few slots left.',
      featured: false
    }
  ]);
});

// Root route should now be served from static index.html
// This is just a fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// All HTML pages are already served by express.static

// Enhanced status endpoint with more diagnostics
app.get('/status', (req, res) => {
  const status = {
    status: 'ok', 
    message: 'Ink Link server is running',
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      port: PORT,
      hostname: require('os').hostname(),
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    },
    endpoints: {
      api: '/api',
      artists: '/api/artists',
      shops: '/api/shops',
      guestspots: '/api/guestspots'
    }
  };
  res.json(status);
});

// Start the server with enhanced error handling and logging
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started and listening on port ${PORT}`);
  console.log(`📡 Server accessible at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  console.log(`🔍 Debug information:`);
  console.log(`   - Running on Node.js ${process.version}`);
  console.log(`   - Platform: ${process.platform}`);
  console.log(`   - Process ID: ${process.pid}`);
  console.log(`   - Working directory: ${process.cwd()}`);
  console.log(`   - Memory usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
  
  // Send more detailed health check messages
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      console.log(`[HEALTH CHECK #${i+1}] Server running healthy on port ${PORT} | ${new Date().toISOString()}`);
    }, i * 2000);
  }
});

// Add proper error handling for the server
server.on('error', (error) => {
  console.error('⚠️ Server error occurred:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`   Port ${PORT} is already in use. Please choose a different port.`);
  }
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});