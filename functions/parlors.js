// Netlify serverless function to handle API requests
exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Get the path and query parameters from the event
    const path = event.path.replace('/.netlify/functions/parlors', '');
    const pathSegments = path.split('/').filter(Boolean);
    const queryParams = event.queryStringParameters || {};
    const limit = queryParams.limit ? parseInt(queryParams.limit) : 10;
    
    console.log(`API Request: ${event.httpMethod} ${path} with params:`, queryParams);
    
    // Check if this is a specific parlor ID request
    if (pathSegments.length === 1 && !isNaN(parseInt(pathSegments[0]))) {
      const parlorId = parseInt(pathSegments[0]);
      
      // Shop details endpoint
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parlorId,
          name: `Tattoo Shop ${parlorId}`,
          address: `${123 + parlorId} Ink Avenue`,
          city: "New York",
          state: "NY",
          zip: "10001",
          phone: "555-123-4567",
          email: "contact@tattooshop.com",
          website: "https://www.tattooshop.com",
          rating: 47,
          images: ["/images/shop.jpeg", "/images/shop.jpeg", "/images/shop.jpeg"],
          description: "A premier tattoo shop featuring talented artists specializing in various styles from traditional to modern designs.",
          hours: {
            monday: "10:00 AM - 8:00 PM",
            tuesday: "10:00 AM - 8:00 PM",
            wednesday: "10:00 AM - 8:00 PM",
            thursday: "10:00 AM - 8:00 PM",
            friday: "10:00 AM - 10:00 PM",
            saturday: "12:00 PM - 10:00 PM",
            sunday: "Closed"
          },
          artists: [
            {
              id: 1,
              name: "Jane Smith",
              specialties: ["Traditional", "Japanese"],
              image: "/images/artist.webp"
            },
            {
              id: 2, 
              name: "John Doe",
              specialties: ["Realism", "Portraits"],
              image: "/images/artist.webp"
            }
          ]
        })
      };
    }
    
    // Featured parlors endpoint
    if (pathSegments.length === 1 && pathSegments[0] === 'featured') {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parlors: [
            {
              id: 1,
              name: "Ink Master Studio",
              address: "123 Tattoo Ave",
              city: "New York",
              state: "NY",
              rating: 48,
              image: "/images/shop.jpeg"
            },
            {
              id: 4,
              name: "Color Canvas Tattoo",
              address: "567 Ink Blvd",
              city: "Chicago",
              state: "IL", 
              rating: 47,
              image: "/images/shop.jpeg"
            },
            {
              id: 7,
              name: "Precision Ink",
              address: "789 Needle St",
              city: "Boston",
              state: "MA",
              rating: 49,
              image: "/images/shop.jpeg"
            }
          ].slice(0, limit)
        })
      };
    }
    
    // Random parlors endpoint
    if (pathSegments.length === 1 && pathSegments[0] === 'random') {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parlors: [
            {
              id: 2,
              name: "Artistic Ink",
              address: "456 Design Blvd",
              city: "Los Angeles",
              state: "CA",
              rating: 45,
              image: "/images/shop.jpeg"
            },
            {
              id: 3,
              name: "Tattoo Paradise",
              address: "789 Color St",
              city: "Miami",
              state: "FL",
              rating: 47,
              image: "/images/shop.jpeg"
            },
            {
              id: 5,
              name: "Electric Needle",
              address: "321 Flash Dr",
              city: "Austin",
              state: "TX",
              rating: 46,
              image: "/images/shop.jpeg"
            },
            {
              id: 6,
              name: "Black Ink Gallery",
              address: "555 Tattoo Ln",
              city: "Portland",
              state: "OR",
              rating: 48,
              image: "/images/shop.jpeg"
            },
            {
              id: 8,
              name: "Inked Dreams",
              address: "111 Artist Way",
              city: "Seattle",
              state: "WA",
              rating: 43,
              image: "/images/shop.jpeg"
            },
            {
              id: 9,
              name: "Phoenix Tattoo",
              address: "222 Fire Rd",
              city: "Phoenix",
              state: "AZ",
              rating: 44,
              image: "/images/shop.jpeg"
            },
            {
              id: 10,
              name: "Steel City Ink",
              address: "333 Metal St",
              city: "Pittsburgh",
              state: "PA",
              rating: 42,
              image: "/images/shop.jpeg"
            },
            {
              id: 11,
              name: "Mile High Tattoo",
              address: "444 Mountain Rd",
              city: "Denver",
              state: "CO",
              rating: 46,
              image: "/images/shop.jpeg"
            },
            {
              id: 12,
              name: "Golden Gate Ink",
              address: "777 Bridge Blvd",
              city: "San Francisco",
              state: "CA",
              rating: 49,
              image: "/images/shop.jpeg"
            }
          ].slice(0, limit)
        })
      };
    }
    
    // Artists endpoint
    if (path.startsWith('/artists')) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: "Coming Soon - Artists functionality is under development" 
        })
      };
    }
    
    // Default response for unhandled paths
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'API endpoint not found' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal Server Error', error: error.toString() })
    };
  }
};