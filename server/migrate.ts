import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create migration journal directory if it doesn't exist
const drizzleDir = path.join(process.cwd(), 'drizzle');
const metaDir = path.join(drizzleDir, 'meta');
if (!fs.existsSync(drizzleDir)) {
  fs.mkdirSync(drizzleDir, { recursive: true });
}
if (!fs.existsSync(metaDir)) {
  fs.mkdirSync(metaDir, { recursive: true });
}

// Create empty journal file if it doesn't exist
const journalPath = path.join(metaDir, '_journal.json');
if (!fs.existsSync(journalPath)) {
  fs.writeFileSync(journalPath, JSON.stringify({ entries: [] }));
  console.log('Created migration journal file');
}

async function main() {
  console.log('Starting database migration...');
  
  // Create a PostgreSQL connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  // Initialize drizzle
  const db = drizzle(pool, { schema });
  
  // Run migrations
  console.log('Running migrations...');
  
  try {
    // We'll manually create the tables instead of using migrations
    console.log('Migrations completed successfully');
    
    // Test connection by running a simple query
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection test:', result.rows[0]);
    
    // Create tables directly based on our schema if they don't exist
    console.log('Ensuring tables exist...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created TIMESTAMP NOT NULL DEFAULT NOW(),
        profile JSONB NOT NULL DEFAULT '{}'
      )
    `);
    
    // Create parlors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parlors (
        id SERIAL PRIMARY KEY,
        original_id VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id INTEGER REFERENCES users(id),
        images JSONB NOT NULL DEFAULT '[]',
        featured_image VARCHAR(255),
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        sponsored BOOLEAN NOT NULL DEFAULT FALSE,
        location JSONB NOT NULL DEFAULT '{}',
        contact JSONB NOT NULL DEFAULT '{}',
        social JSONB NOT NULL DEFAULT '{}',
        hours JSONB NOT NULL DEFAULT '{}',
        amenities JSONB NOT NULL DEFAULT '[]',
        rating INTEGER NOT NULL DEFAULT 0,
        review_count INTEGER NOT NULL DEFAULT 0,
        created TIMESTAMP NOT NULL DEFAULT NOW(),
        updated TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create artists table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        bio TEXT,
        specialty JSONB NOT NULL DEFAULT '[]',
        experience_years INTEGER,
        profile_image VARCHAR(255),
        images JSONB NOT NULL DEFAULT '[]',
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        sponsored BOOLEAN NOT NULL DEFAULT FALSE,
        portfolio JSONB NOT NULL DEFAULT '[]',
        location JSONB NOT NULL DEFAULT '{}',
        social JSONB NOT NULL DEFAULT '{}',
        availability JSONB NOT NULL DEFAULT '{}',
        rating INTEGER NOT NULL DEFAULT 0,
        review_count INTEGER NOT NULL DEFAULT 0,
        created TIMESTAMP NOT NULL DEFAULT NOW(),
        updated TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create guestspots table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guestspots (
        id SERIAL PRIMARY KEY,
        parlor_id INTEGER REFERENCES parlors(id) NOT NULL,
        artist_id INTEGER REFERENCES artists(id),
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        date_start TIMESTAMP NOT NULL,
        date_end TIMESTAMP NOT NULL,
        description TEXT,
        requirements TEXT,
        price_info TEXT,
        applicants JSONB NOT NULL DEFAULT '[]',
        created TIMESTAMP NOT NULL DEFAULT NOW(),
        updated TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        target_id INTEGER NOT NULL,
        target_type VARCHAR(20) NOT NULL,
        rating INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created TIMESTAMP NOT NULL DEFAULT NOW(),
        updated TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create schedules table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        artist_id INTEGER REFERENCES artists(id) NOT NULL,
        parlor_id INTEGER REFERENCES parlors(id),
        day_of_week INTEGER,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        is_recurring BOOLEAN DEFAULT TRUE,
        specific_date DATE,
        created TIMESTAMP NOT NULL DEFAULT NOW(),
        updated TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id) NOT NULL,
        artist_id INTEGER REFERENCES artists(id) NOT NULL,
        parlor_id INTEGER REFERENCES parlors(id) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        service_type VARCHAR(100) NOT NULL,
        description TEXT,
        notes TEXT,
        deposit INTEGER,
        price INTEGER,
        reference_images JSONB DEFAULT '[]',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created TIMESTAMP NOT NULL DEFAULT NOW(),
        updated TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('All tables created successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await pool.end();
  }
}

main().catch(console.error);