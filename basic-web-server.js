const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Enable CORS and JSON handling
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Simple logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ----- Web Routes -----

// Handle root path explicitly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle specific HTML pages
app.get(['/artists', '/artists.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'artists.html'));
});

app.get(['/shops', '/shops.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shops.html'));
});

app.get(['/guestspots', '/guestspots.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'guestspots.html'));
});

// ----- API Routes -----

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Ink Master Link API',
    version: '1.0.0',
    status: 'online',
    endpoints: [
      '/api/artists',
      '/api/shops',
      '/api/guestspots'
    ]
  });
});

// Artist endpoint
app.get('/api/artists', (req, res) => {
  axios.get(`${BACKEND_URL}/api/artists`)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.error(`Error fetching artists: ${error.message}`);
      // Fallback to sample data if backend is unavailable
      res.json([
        {
          id: 'artist1',
          name: 'John Doe',
          specialty: ['Traditional', 'Japanese'],
          profileImage: 'https://images.unsplash.com/photo-1598271290633-b2f2283e2be3',
          location: { city: 'Los Angeles', state: 'CA', country: 'USA' },
          rating: 4.8,
          featured: true
        },
        {
          id: 'artist2',
          name: 'Alex Johnson',
          specialty: ['Realism', 'Portraits'],
          profileImage: 'https://images.unsplash.com/photo-1607868894064-2b6e7ed1b324',
          location: { city: 'Chicago', state: 'IL', country: 'USA' },
          rating: 4.9,
          featured: true
        }
      ]);
    });
});

// Shops endpoint
app.get('/api/shops', (req, res) => {
  axios.get(`${BACKEND_URL}/api/parlors`)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.error(`Error fetching shops: ${error.message}`);
      // Fallback to sample data if backend is unavailable
      res.json([
        {
          id: 'parlor1',
          name: 'Ink Haven',
          featuredImage: 'https://images.unsplash.com/photo-1521488674203-62bf581664be',
          location: { city: 'New York', state: 'NY', country: 'USA' },
          rating: 4.7,
          featured: true
        },
        {
          id: 'parlor2',
          name: 'Black Lotus Tattoo',
          featuredImage: 'https://images.unsplash.com/photo-1598518619776-eae3f8a34edb',
          location: { city: 'Chicago', state: 'IL', country: 'USA' },
          rating: 4.9,
          featured: true
        }
      ]);
    });
});

// Guestspots endpoint
app.get('/api/guestspots', (req, res) => {
  axios.get(`${BACKEND_URL}/api/guestspots`)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.error(`Error fetching guestspots: ${error.message}`);
      // Fallback to sample data if backend is unavailable
      res.json([
        {
          id: 'guestspot1',
          parlorName: 'Ink Haven',
          parlorLocation: { city: 'New York', state: 'NY', country: 'USA' },
          dateStart: '2025-05-15',
          dateEnd: '2025-06-10',
          status: 'open',
          featured: true
        },
        {
          id: 'guestspot2',
          parlorName: 'Black Lotus Tattoo',
          parlorLocation: { city: 'Chicago', state: 'IL', country: 'USA' },
          dateStart: '2025-06-01',
          dateEnd: '2025-06-15',
          status: 'open',
          featured: false
        }
      ]);
    });
});

// Catch-all route for other HTML pages
app.get('*.html', (req, res) => {
  const filePath = path.join(__dirname, 'public', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// Catch-all for other routes - return index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ink Master Link server running on port ${PORT}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Server time: ${new Date().toISOString()}`);
  console.log(`Server is accessible at http://localhost:${PORT}`);
  
  // Print Replit info if available
  try {
    const repl_owner = process.env.REPL_OWNER || 'unknown';
    const repl_slug = process.env.REPL_SLUG || 'unknown';
    console.log(`Replit public URL: https://${repl_slug}.${repl_owner}.repl.co`);
  } catch (err) {
    console.log('Unable to determine Replit public URL');
  }
});