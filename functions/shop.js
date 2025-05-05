// Netlify serverless function to handle shop-specific API requests
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
    // Get the path from the event
    const path = event.path.replace('/.netlify/functions/shop', '');
    const shopId = path.split('/').filter(Boolean)[0];
    
    console.log(`Shop API Request for shop ID: ${shopId}`);
    
    // If no shop ID is provided
    if (!shopId) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Shop ID is required' })
      };
    }
    
    // Mock data for shop details
    const shopDetails = {
      id: parseInt(shopId),
      name: `Tattoo Shop ${shopId}`,
      address: `${123 + parseInt(shopId)} Ink Avenue`,
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
    };
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(shopDetails)
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