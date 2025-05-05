const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

// Path to the CSV file
const csvFilePath = path.join(__dirname, '../../assets/outputshops.csv');

// Function to parse address into components
function parseAddress(address) {
  // Simple regex to extract state and zip
  const stateZipRegex = /([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/;
  const stateZipMatch = address.match(stateZipRegex);
  
  let state = '';
  let postalCode = '';
  let city = '';
  
  if (stateZipMatch) {
    state = stateZipMatch[1];
    postalCode = stateZipMatch[2];
  }
  
  // Try to extract city
  const cityRegex = /,\s*([^,]+),\s*[A-Z]{2}/;
  const cityMatch = address.match(cityRegex);
  if (cityMatch) {
    city = cityMatch[1];
  }
  
  // Remove the city, state, zip portion to get just the street address
  let streetAddress = address;
  if (city && state) {
    streetAddress = address.replace(new RegExp(`,\\s*${city},\\s*${state}\\s*${postalCode}`, 'i'), '');
  }
  
  // Clean up any trailing commas or whitespace
  streetAddress = streetAddress.replace(/,\s*$/, '').trim();
  
  return {
    address: streetAddress,
    city,
    state,
    country: 'USA',  // Assuming all shops are in the USA
    postalCode
  };
}

// Function to generate random amenities for each shop
function generateAmenities() {
  const allAmenities = [
    'Custom Designs', 'Walk-ins Welcome', 'WiFi', 'Private Rooms', 
    'Free Consultations', 'Parking Available', 'Credit Cards Accepted',
    'Aftercare Products', 'Wheelchair Accessible', 'Piercings Available',
    'CBD Pain Relief', 'Vegan Ink Options', 'Flash Designs'
  ];
  
  const count = Math.floor(Math.random() * 5) + 2; // 2-6 amenities
  const amenities = [];
  
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * allAmenities.length);
    if (!amenities.includes(allAmenities[index])) {
      amenities.push(allAmenities[index]);
    }
  }
  
  return amenities;
}

// Function to generate standard hours for a shop
function generateHours() {
  return {
    monday: '11:00 AM - 7:00 PM',
    tuesday: '11:00 AM - 7:00 PM',
    wednesday: '11:00 AM - 7:00 PM',
    thursday: '11:00 AM - 7:00 PM',
    friday: '11:00 AM - 8:00 PM',
    saturday: '11:00 AM - 8:00 PM',
    sunday: 'Closed'
  };
}

// Function to extract Instagram handle from website if it's an Instagram URL
function extractInstagram(website) {
  if (!website) return null;
  
  // Check if it's an Instagram URL
  if (website.includes('instagram.com')) {
    // Extract the handle
    const match = website.match(/instagram\.com\/([^\/\?]+)/);
    return match ? match[1] : null;
  }
  
  return null;
}

// Function to create a parlor object from CSV row
function createParlorFromRow(row) {
  const location = parseAddress(row.address);
  const instagram = extractInstagram(row.website);
  
  // Generate a rating if not provided
  const rating = row.rating ? parseFloat(row.rating) : (3.5 + Math.random() * 1.5);
  // Generate a random number of reviews
  const reviewCount = Math.floor(Math.random() * 50) + 5;
  
  // Choose a random featured image from Unsplash
  const featuredImages = [
    'https://images.unsplash.com/photo-1521488674203-62bf581664be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGF0dG9vJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1598518619776-eae3f8a34edb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHRhdHRvbyUyMHNob3B8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1624384562353-4aa1e08a7d1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dGF0dG9vJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1553133816-ad237272b27d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRhdHRvbyUyMHNob3B8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
  ];
  
  const featuredImage = featuredImages[Math.floor(Math.random() * featuredImages.length)];
  const images = [featuredImage];
  
  // Add 1-2 more images
  for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
    const img = featuredImages[Math.floor(Math.random() * featuredImages.length)];
    if (!images.includes(img)) {
      images.push(img);
    }
  }
  
  // Create parlor object
  return {
    id: uuidv4(),
    name: row.business_name,
    description: `Tattoo shop offering professional tattooing services in ${location.city}, ${location.state}.`,
    ownerId: null, // No real owner in imported data
    images: images,
    featuredImage: featuredImage,
    featured: Math.random() < 0.1, // 10% chance of being featured
    sponsored: Math.random() < 0.05, // 5% chance of being sponsored
    location: location,
    contact: {
      phone: row.phone || '',
      email: row.email || '',
      website: row.website || ''
    },
    social: {
      instagram: instagram || ''
    },
    hours: generateHours(),
    amenities: generateAmenities(),
    artistIds: [],
    rating: parseFloat(rating.toFixed(1)),
    reviewCount: reviewCount,
    created: new Date(),
    updated: new Date()
  };
}

// Main function to import shops
async function importShops() {
  try {
    console.log('Reading CSV file...');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    console.log('Parsing CSV data...');
    // Parse CSV with headers
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Found ${records.length} records in CSV.`);
    
    // Clear existing parlors from db
    console.log('Clearing existing parlor data...');
    db.findAll('parlors').forEach(parlor => {
      db.delete('parlors', parlor.id);
    });
    
    // Get shops from a diverse set of states
    console.log('Selecting shops from diverse states...');
    
    // First, group shops by state
    const shopsByState = {};
    records.forEach(record => {
      const location = parseAddress(record.address);
      const state = location.state;
      
      if (state && state.length === 2) { // Ensure we have a valid state code
        if (!shopsByState[state]) {
          shopsByState[state] = [];
        }
        shopsByState[state].push(record);
      }
    });
    
    // Get all available states
    const availableStates = Object.keys(shopsByState);
    console.log(`Found shops in ${availableStates.length} states: ${availableStates.join(', ')}`);
    
    // Import more shops to provide a comprehensive directory
    // We'll aim for a larger number while ensuring a good geographic distribution
    const totalDesiredShops = 1500; // Increased from 500 to 1500
    const statesCount = availableStates.length;
    
    // Set a minimum of shops per state
    const minShopsPerState = 1;
    
    // Calculate the base number of shops per state to reach our total desired shops
    // We'll distribute shops more proportionally based on each state's data availability
    let shopsPerState = {};
    
    // First, assign minimum shops to each state
    let remainingShops = totalDesiredShops;
    availableStates.forEach(state => {
      shopsPerState[state] = minShopsPerState;
      remainingShops -= minShopsPerState;
    });
    
    // Sort states by how many shops they have in the dataset
    const populationOrder = availableStates.sort((a, b) => shopsByState[b].length - shopsByState[a].length);
    
    // Calculate total shops available across all states to determine proportions
    const totalAvailableShops = populationOrder.reduce((total, state) => total + shopsByState[state].length, 0);
    
    // Distribute remaining shops proportionally based on each state's data volume
    populationOrder.forEach(state => {
      const stateShopCount = shopsByState[state].length;
      const proportion = stateShopCount / totalAvailableShops;
      // Calculate how many additional shops this state should get
      const additionalShopsFloat = remainingShops * proportion;
      // Round to nearest integer
      const additionalShops = Math.round(additionalShopsFloat);
      
      // Assign shops, but don't exceed what's available in the state
      const maxAdditional = Math.min(additionalShops, stateShopCount - minShopsPerState);
      if (maxAdditional > 0) {
        shopsPerState[state] += maxAdditional;
        remainingShops -= maxAdditional;
      }
    });
    
    // Distribute any remaining shops among all states
    let i = 0;
    while (remainingShops > 0 && i < availableStates.length) {
      const state = availableStates[i % availableStates.length];
      shopsPerState[state] += 1;
      remainingShops -= 1;
      i++;
    }
    
    console.log('Shops per state distribution:');
    let totalShops = 0;
    for (const state in shopsPerState) {
      const count = Math.min(shopsPerState[state], shopsByState[state].length);
      console.log(`${state}: ${count} shops`);
      totalShops += count;
    }
    console.log(`Total shops to import: ${totalShops}`);
    
    // Now select shops from each state based on our calculated distribution
    let recordsToProcess = [];
    
    for (const state in shopsPerState) {
      const stateShops = shopsByState[state];
      // Determine how many shops to take, limited by available shops in that state
      const shopCount = Math.min(shopsPerState[state], stateShops.length);
      
      // Shuffle the state shops to get a random selection
      const shuffled = stateShops.sort(() => 0.5 - Math.random());
      
      // Take the calculated number of shops from this state
      const selected = shuffled.slice(0, shopCount);
      recordsToProcess = recordsToProcess.concat(selected);
    }
    
    console.log(`Processing ${recordsToProcess.length} shops from ${availableStates.length} states...`);
    
    // Process each record and create parlor objects
    recordsToProcess.forEach(record => {
      const parlor = createParlorFromRow(record);
      db.create('parlors', parlor);
    });
    
    const parlors = db.findAll('parlors');
    console.log(`Successfully imported ${parlors.length} shops.`);
    
    // Add random featured and sponsored shops if needed
    const featuredCount = parlors.filter(p => p.featured).length;
    const sponsoredCount = parlors.filter(p => p.sponsored).length;
    
    console.log(`Featured shops: ${featuredCount}`);
    console.log(`Sponsored shops: ${sponsoredCount}`);
    
    // Ensure we have at least 5 featured shops
    if (featuredCount < 5) {
      console.log('Adding more featured shops...');
      const nonFeatured = parlors.filter(p => !p.featured);
      for (let i = 0; i < Math.min(5 - featuredCount, nonFeatured.length); i++) {
        const index = Math.floor(Math.random() * nonFeatured.length);
        nonFeatured[index].featured = true;
        db.update('parlors', nonFeatured[index].id, { featured: true });
        console.log(`Made "${nonFeatured[index].name}" a featured shop.`);
      }
    }
    
    // Ensure we have at least 3 sponsored shops
    if (sponsoredCount < 3) {
      console.log('Adding more sponsored shops...');
      const nonSponsored = parlors.filter(p => !p.sponsored);
      for (let i = 0; i < Math.min(3 - sponsoredCount, nonSponsored.length); i++) {
        const index = Math.floor(Math.random() * nonSponsored.length);
        nonSponsored[index].sponsored = true;
        db.update('parlors', nonSponsored[index].id, { sponsored: true });
        console.log(`Made "${nonSponsored[index].name}" a sponsored shop.`);
      }
    }
    
    console.log('Import completed successfully.');
    
  } catch (error) {
    console.error('Error importing shops:', error);
  }
}

// Run the import
importShops();