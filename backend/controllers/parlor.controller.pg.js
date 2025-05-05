/**
 * Parlor Controller (PostgreSQL version)
 * Handles all parlor-related API endpoints
 */

// Import the PostgreSQL connection directly
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Get all parlors with optional filters
 */
async function getAllParlors(req, res) {
  try {
    const { limit = 100, offset = 0, state, city, search } = req.query;
    
    let query;
    let params = [];
    
    if (search) {
      query = `
        SELECT * FROM parlors 
        WHERE 
          name ILIKE $1 
          OR location->>'city' ILIKE $1 
          OR location->>'state' ILIKE $1 
          OR location->>'address' ILIKE $1
          OR location->>'postalCode' ILIKE $1
        ORDER BY rating DESC NULLS LAST, featured DESC, sponsored DESC, name 
        LIMIT $2
      `;
      params = [`%${search}%`, parseInt(limit)];
    } else if (state && city) {
      query = `
        SELECT * FROM parlors 
        WHERE 
          location->>'state' = $1 
          AND location->>'city' ILIKE $2
        ORDER BY rating DESC NULLS LAST, featured DESC, sponsored DESC, name 
        LIMIT $3 OFFSET $4
      `;
      params = [state, `%${city}%`, parseInt(limit), parseInt(offset)];
    } else if (state) {
      query = `
        SELECT * FROM parlors 
        WHERE location->>'state' = $1 
        ORDER BY rating DESC NULLS LAST, featured DESC, sponsored DESC, name 
        LIMIT $2 OFFSET $3
      `;
      params = [state, parseInt(limit), parseInt(offset)];
    } else {
      query = `
        SELECT * FROM parlors 
        ORDER BY rating DESC NULLS LAST, featured DESC, sponsored DESC, name 
        LIMIT $1 OFFSET $2
      `;
      params = [parseInt(limit), parseInt(offset)];
    }
    
    const { rows: parlors } = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery;
    let countParams = [];
    
    if (search) {
      countQuery = `
        SELECT COUNT(*) FROM parlors 
        WHERE 
          name ILIKE $1 
          OR location->>'city' ILIKE $1 
          OR location->>'state' ILIKE $1 
          OR location->>'address' ILIKE $1
          OR location->>'postalCode' ILIKE $1
      `;
      countParams = [`%${search}%`];
    } else if (state && city) {
      countQuery = `
        SELECT COUNT(*) FROM parlors 
        WHERE 
          location->>'state' = $1 
          AND location->>'city' ILIKE $2
      `;
      countParams = [state, `%${city}%`];
    } else if (state) {
      countQuery = `
        SELECT COUNT(*) FROM parlors 
        WHERE location->>'state' = $1
      `;
      countParams = [state];
    } else {
      countQuery = `SELECT COUNT(*) FROM parlors`;
      countParams = [];
    }
    
    const { rows: [{ count: totalCount }] } = await pool.query(countQuery, countParams);
    
    return res.json({ 
      success: true, 
      count: parlors.length,
      totalCount: parseInt(totalCount),
      data: parlors
    });
  } catch (error) {
    console.error('Error fetching parlors:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch parlors',
      error: error.message 
    });
  }
}

/**
 * Get parlor by ID
 */
async function getParlorById(req, res) {
  try {
    const { id } = req.params;
    
    const query = `SELECT * FROM parlors WHERE id = $1`;
    const { rows } = await pool.query(query, [parseInt(id)]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parlor not found' 
      });
    }
    
    const parlor = rows[0];
    
    return res.json({ 
      success: true, 
      data: parlor 
    });
  } catch (error) {
    console.error('Error fetching parlor:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch parlor',
      error: error.message 
    });
  }
}

/**
 * Get parlors by owner ID
 */
async function getParlorsByOwner(req, res) {
  try {
    const { ownerId } = req.params;
    
    const query = `SELECT * FROM parlors WHERE owner_id = $1 ORDER BY name`;
    const { rows: parlors } = await pool.query(query, [parseInt(ownerId)]);
    
    return res.json({ 
      success: true, 
      count: parlors.length,
      data: parlors 
    });
  } catch (error) {
    console.error('Error fetching owner parlors:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch owner parlors',
      error: error.message 
    });
  }
}

/**
 * Create a new parlor
 */
async function createParlor(req, res) {
  try {
    const parlorData = req.body;
    
    // Add timestamps
    const now = new Date();
    
    // Create string of column names
    const columns = Object.keys(parlorData).map(key => {
      // Convert camelCase to snake_case for database columns
      return key.replace(/([A-Z])/g, '_$1').toLowerCase();
    }).join(', ');
    
    // Create parameterized values
    const values = Object.values(parlorData);
    const valuePlaceholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    // Add created and updated timestamps
    const query = `
      INSERT INTO parlors (${columns}, created, updated)
      VALUES (${valuePlaceholders}, $${values.length + 1}, $${values.length + 2})
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [...values, now, now]);
    const newParlor = rows[0];
    
    return res.status(201).json({ 
      success: true, 
      message: 'Parlor created successfully',
      data: newParlor 
    });
  } catch (error) {
    console.error('Error creating parlor:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create parlor',
      error: error.message 
    });
  }
}

/**
 * Update a parlor
 */
async function updateParlor(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow updating the ID
    delete updates.id;
    
    // Add updated timestamp
    updates.updated = new Date();
    
    // Create SET clause for SQL
    const setClause = Object.keys(updates).map((key, index) => {
      // Convert camelCase to snake_case for database columns
      const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${columnName} = $${index + 1}`;
    }).join(', ');
    
    const values = Object.values(updates);
    
    // Add ID to parameters
    const query = `
      UPDATE parlors
      SET ${setClause}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [...values, parseInt(id)]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parlor not found' 
      });
    }
    
    const updatedParlor = rows[0];
    
    return res.json({ 
      success: true, 
      message: 'Parlor updated successfully',
      data: updatedParlor 
    });
  } catch (error) {
    console.error('Error updating parlor:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update parlor',
      error: error.message 
    });
  }
}

/**
 * Delete a parlor
 */
async function deleteParlor(req, res) {
  try {
    const { id } = req.params;
    
    const query = `DELETE FROM parlors WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [parseInt(id)]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parlor not found' 
      });
    }
    
    return res.json({ 
      success: true, 
      message: 'Parlor deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting parlor:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete parlor',
      error: error.message 
    });
  }
}

/**
 * Get featured parlors
 */
async function getFeaturedParlors(req, res) {
  try {
    const { limit = 6 } = req.query;
    
    const query = `
      SELECT * FROM parlors 
      WHERE featured = true 
      ORDER BY rating DESC NULLS LAST 
      LIMIT $1
    `;
    const { rows: parlors } = await pool.query(query, [parseInt(limit)]);
    
    return res.json({ 
      success: true, 
      count: parlors.length,
      data: parlors 
    });
  } catch (error) {
    console.error('Error fetching featured parlors:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch featured parlors',
      error: error.message 
    });
  }
}

/**
 * Get sponsored parlors
 */
async function getSponsoredParlors(req, res) {
  try {
    const { limit = 4 } = req.query;
    
    const query = `
      SELECT * FROM parlors 
      WHERE sponsored = true 
      ORDER BY rating DESC NULLS LAST 
      LIMIT $1
    `;
    const { rows: parlors } = await pool.query(query, [parseInt(limit)]);
    
    return res.json({ 
      success: true, 
      count: parlors.length,
      data: parlors 
    });
  } catch (error) {
    console.error('Error fetching sponsored parlors:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch sponsored parlors',
      error: error.message 
    });
  }
}

/**
 * Search parlors
 */
async function searchParlors(req, res) {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }
    
    const query = `
      SELECT * FROM parlors 
      WHERE 
        name ILIKE $1 
        OR location->>'city' ILIKE $1 
        OR location->>'state' ILIKE $1 
        OR location->>'address' ILIKE $1
        OR location->>'postalCode' ILIKE $1
      ORDER BY rating DESC NULLS LAST, featured DESC, sponsored DESC, name 
      LIMIT $2
    `;
    const { rows: parlors } = await pool.query(query, [`%${q}%`, parseInt(limit)]);
    
    return res.json({ 
      success: true, 
      count: parlors.length,
      data: parlors 
    });
  } catch (error) {
    console.error('Error searching parlors:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to search parlors',
      error: error.message 
    });
  }
}

/**
 * Get available states for filtering
 */
async function getAvailableStates(req, res) {
  try {
    // Execute raw SQL to get distinct states
    const query = `
      SELECT DISTINCT location->>'state' AS state
      FROM parlors
      WHERE location->>'state' IS NOT NULL
      ORDER BY state
    `;
    const { rows } = await pool.query(query);
    
    const states = rows.map(row => row.state);
    
    return res.json({ 
      success: true, 
      count: states.length,
      data: states 
    });
  } catch (error) {
    console.error('Error fetching available states:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch available states',
      error: error.message 
    });
  }
}

/**
 * Get available cities for a state
 */
async function getAvailableCities(req, res) {
  try {
    const { state } = req.params;
    
    if (!state) {
      return res.status(400).json({ 
        success: false, 
        message: 'State is required' 
      });
    }
    
    // Execute raw SQL to get distinct cities for a state
    const query = `
      SELECT DISTINCT location->>'city' AS city
      FROM parlors
      WHERE location->>'state' = $1
      AND location->>'city' IS NOT NULL
      ORDER BY city
    `;
    const { rows } = await pool.query(query, [state]);
    
    const cities = rows.map(row => row.city);
    
    return res.json({ 
      success: true, 
      count: cities.length,
      data: cities 
    });
  } catch (error) {
    console.error('Error fetching available cities:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch available cities',
      error: error.message 
    });
  }
}

/**
 * Get random parlors
 */
async function getRandomParlors(req, res) {
  try {
    const { limit = 10 } = req.query;
    
    const query = `
      SELECT * FROM parlors 
      ORDER BY RANDOM() 
      LIMIT $1
    `;
    const { rows: parlors } = await pool.query(query, [parseInt(limit)]);
    
    return res.json({ 
      success: true, 
      count: parlors.length,
      data: parlors 
    });
  } catch (error) {
    console.error('Error fetching random parlors:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch random parlors',
      error: error.message 
    });
  }
}

module.exports = {
  getAllParlors,
  getParlorById,
  getParlorsByOwner,
  createParlor,
  updateParlor,
  deleteParlor,
  getFeaturedParlors,
  getSponsoredParlors,
  searchParlors,
  getAvailableStates,
  getAvailableCities,
  getRandomParlors
};