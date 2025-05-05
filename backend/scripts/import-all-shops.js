const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Pool } = require('pg');

// Path to the CSV file
const csvFilePath = path.join(__dirname, '../../assets/outputshops.csv');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
    name: row.business_name,
    description: `Tattoo shop offering professional tattooing services in ${location.city || 'the area'}, ${location.state || ''}.`,
    originalId: row.id || '',
    images: JSON.stringify(images),
    featuredImage: featuredImage,
    featured: Math.random() < 0.1, // 10% chance of being featured
    sponsored: Math.random() < 0.05, // 5% chance of being sponsored
    location: JSON.stringify(location),
    contact: JSON.stringify({
      phone: row.phone || '',
      email: row.email || '',
      website: row.website || ''
    }),
    social: JSON.stringify({
      instagram: instagram || ''
    }),
    hours: JSON.stringify(generateHours()),
    amenities: JSON.stringify(generateAmenities()),
    rating: Math.round(parseFloat(rating.toFixed(1)) * 10), // Store as integer on 0-50 scale (4.5 -> 45, 5.0 -> 50)
    reviewCount: reviewCount,
    created: new Date(),
    updated: new Date()
  };
}

// Function to batch insert records
async function batchInsert(records, batchSize = 100) {
  const totalBatches = Math.ceil(records.length / batchSize);
  console.log(`Processing ${records.length} shops in ${totalBatches} batches of ${batchSize}...`);
  
  let insertedCount = 0;
  
  // Process in batches to avoid memory issues
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, records.length);
    const batch = records.slice(start, end);
    
    if (batch.length === 0) continue;
    
    // Create parameterized query for bulk insert
    const values = [];
    const placeholders = [];
    
    batch.forEach((record, index) => {
      // Each record has 14 fields, so each record needs 14 placeholders
      const offset = index * 14; 
      const rowPlaceholders = [];
      
      for (let j = 1; j <= 14; j++) {
        rowPlaceholders.push(`$${offset + j}`);
      }
      
      placeholders.push(`(${rowPlaceholders.join(', ')})`);
      
      values.push(
        record.name,
        record.description,
        record.originalId,
        record.images,
        record.featuredImage,
        record.featured,
        record.sponsored,
        record.location,
        record.contact,
        record.social,
        record.hours,
        record.amenities,
        record.rating,
        record.reviewCount
      );
    });
    
    // Create the query
    const query = `
      INSERT INTO parlors (
        name, description, original_id, images, featured_image, 
        featured, sponsored, location, contact, social, 
        hours, amenities, rating, review_count
      ) 
      VALUES ${placeholders.join(', ')}
      RETURNING id
    `;
    
    try {
      const result = await pool.query(query, values);
      insertedCount += result.rowCount;
      console.log(`Batch ${i+1}/${totalBatches}: Inserted ${result.rowCount} shops (total: ${insertedCount})`);
    } catch (error) {
      console.error(`Error inserting batch ${i+1}:`, error);
      throw error;
    }
  }
  
  return insertedCount;
}

// Main function to import shops
async function importAllShops(forceImport = false) {
  try {
    // Check if shops already exist in the database
    const { rows: [{ count: shopCount }] } = await pool.query('SELECT COUNT(*) FROM parlors');
    const existingShopCount = parseInt(shopCount);
    
    if (existingShopCount > 0 && !forceImport) {
      console.log(`Database already contains ${existingShopCount} shops. Skipping import.`);
      console.log('Use --force flag to force reimport all shops.');
      
      // Close the database connection
      await pool.end();
      return;
    }
    
    console.log('Reading CSV file...');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    console.log('Parsing CSV data...');
    // Parse CSV with headers
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Found ${records.length} records in CSV.`);
    
    // Clear existing data from parlors table with CASCADE to handle foreign keys
    console.log('Clearing existing parlor data...');
    await pool.query('TRUNCATE TABLE parlors RESTART IDENTITY CASCADE');
    
    // Process all records to create parlor objects
    console.log('Preparing shop data...');
    
    // Create map to track processed shops by state for reporting
    const shopsByState = {};
    
    // Process records into parlor objects
    const parlors = [];
    
    for (const record of records) {
      const location = parseAddress(record.address);
      const state = location.state;
      
      // Skip records without a valid state
      if (!state || state.length !== 2) continue;
      
      // Track shops by state for reporting
      if (!shopsByState[state]) {
        shopsByState[state] = 0;
      }
      shopsByState[state]++;
      
      // Create and add parlor object
      const parlor = createParlorFromRow(record);
      parlors.push(parlor);
    }
    
    console.log(`Prepared ${parlors.length} valid shop records...`);
    
    // Report shops by state
    console.log('Shops per state distribution:');
    const states = Object.keys(shopsByState).sort();
    for (const state of states) {
      console.log(`${state}: ${shopsByState[state]} shops`);
    }
    
    // Insert all shops
    console.log('Inserting shops into database...');
    const insertedCount = await batchInsert(parlors);
    
    console.log(`Successfully imported ${insertedCount} shops.`);
    
    // Get featured and sponsored counts
    const { rows: [featuredCount] } = await pool.query('SELECT COUNT(*) FROM parlors WHERE featured = true');
    const { rows: [sponsoredCount] } = await pool.query('SELECT COUNT(*) FROM parlors WHERE sponsored = true');
    
    console.log(`Featured shops: ${featuredCount.count}`);
    console.log(`Sponsored shops: ${sponsoredCount.count}`);
    
    console.log('Import completed successfully.');
    
    // Close the database connection
    await pool.end();
    
  } catch (error) {
    console.error('Error importing shops:', error);
    process.exit(1);
  }
}

// Check for command line args
const forceImport = process.argv.includes('--force');

// Run the import
importAllShops(forceImport);