const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { eq, like, or, and } = require('drizzle-orm');

// Schema imports must use CommonJS require syntax since we're in Node.js
const schema = require('../../shared/schema');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Interface adapter for our existing code
const dbPg = {
  // Create a record
  create: async (collection, record) => {
    try {
      if (!schema[collection]) {
        throw new Error(`Collection ${collection} does not exist in schema`);
      }
      
      // Map collection name to schema table
      const table = schema[collection];
      
      // Insert record
      const [insertedRecord] = await db.insert(table).values(record).returning();
      return insertedRecord;
    } catch (error) {
      console.error(`Error creating record in ${collection}:`, error);
      throw error;
    }
  },
  
  // Read all records
  findAll: async (collection, filter = {}) => {
    try {
      if (!schema[collection]) {
        throw new Error(`Collection ${collection} does not exist in schema`);
      }
      
      // Map collection name to schema table
      const table = schema[collection];
      
      // Build where conditions
      if (Object.keys(filter).length === 0) {
        return await db.select().from(table);
      }
      
      // Create filter conditions
      const conditions = Object.entries(filter).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // For JSON fields, we need to handle differently
          // This is simplified and may need enhancement for complex JSON queries
          return eq(table[key], JSON.stringify(value));
        }
        return eq(table[key], value);
      });
      
      // Query with conditions
      return await db.select().from(table).where(and(...conditions));
    } catch (error) {
      console.error(`Error finding records in ${collection}:`, error);
      throw error;
    }
  },
  
  // Read a single record by ID
  findById: async (collection, id) => {
    try {
      if (!schema[collection]) {
        throw new Error(`Collection ${collection} does not exist in schema`);
      }
      
      // Map collection name to schema table
      const table = schema[collection];
      
      // Query by ID
      const [record] = await db.select().from(table).where(eq(table.id, id));
      return record || null;
    } catch (error) {
      console.error(`Error finding record by ID in ${collection}:`, error);
      throw error;
    }
  },
  
  // Find one record by filter
  findOne: async (collection, filter) => {
    try {
      if (!schema[collection]) {
        throw new Error(`Collection ${collection} does not exist in schema`);
      }
      
      // Map collection name to schema table
      const table = schema[collection];
      
      // Create filter conditions
      const conditions = Object.entries(filter).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return eq(table[key], JSON.stringify(value));
        }
        return eq(table[key], value);
      });
      
      // Query with conditions, limit to 1
      const [record] = await db.select().from(table).where(and(...conditions)).limit(1);
      return record || null;
    } catch (error) {
      console.error(`Error finding record in ${collection}:`, error);
      throw error;
    }
  },
  
  // Update a record
  update: async (collection, id, updates) => {
    try {
      if (!schema[collection]) {
        throw new Error(`Collection ${collection} does not exist in schema`);
      }
      
      // Map collection name to schema table
      const table = schema[collection];
      
      // Update record
      const [updatedRecord] = await db
        .update(table)
        .set({ ...updates, updated: new Date() })
        .where(eq(table.id, id))
        .returning();
      
      return updatedRecord || null;
    } catch (error) {
      console.error(`Error updating record in ${collection}:`, error);
      throw error;
    }
  },
  
  // Delete a record
  delete: async (collection, id) => {
    try {
      if (!schema[collection]) {
        throw new Error(`Collection ${collection} does not exist in schema`);
      }
      
      // Map collection name to schema table
      const table = schema[collection];
      
      // Delete record
      const result = await db
        .delete(table)
        .where(eq(table.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting record in ${collection}:`, error);
      throw error;
    }
  },
  
  // Search functionality for parlors
  searchParlors: async (searchTerm, limit = 50, offset = 0) => {
    try {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const table = schema.parlors;
      
      // Search across multiple fields
      const searchCondition = or(
        like(table.name, `%${lowerSearchTerm}%`),
        like(table.description, `%${lowerSearchTerm}%`)
        // Note: For JSON fields like location, we'd need a different approach
        // This is a simplified search and would need enhancement for JSON fields
      );
      
      const results = await db
        .select()
        .from(table)
        .where(searchCondition)
        .limit(limit)
        .offset(offset);
      
      return results;
    } catch (error) {
      console.error('Error searching parlors:', error);
      throw error;
    }
  },
  
  // Get parlors with pagination
  getParlors: async (limit = 50, offset = 0, filter = {}) => {
    try {
      const table = schema.parlors;
      
      // Build filter conditions
      const conditions = Object.entries(filter).map(([key, value]) => {
        if (key === 'state' && value) {
          // Special handling for state which is inside location JSON
          return like(table.location, `%"state":"${value}"%`);
        }
        
        if (key === 'city' && value) {
          // Special handling for city which is inside location JSON
          return like(table.location, `%"city":"${value}"%`);
        }
        
        if (typeof value === 'object' && value !== null) {
          return eq(table[key], JSON.stringify(value));
        }
        
        return eq(table[key], value);
      });
      
      // If we have conditions, apply them
      let query = db.select().from(table);
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Apply pagination
      const results = await query.limit(limit).offset(offset);
      
      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(table);
      
      return {
        parlors: results,
        total: parseInt(count, 10),
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting parlors with pagination:', error);
      throw error;
    }
  }
};

module.exports = dbPg;