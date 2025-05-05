const Parlor = require('../models/parlor.model');
const User = require('../models/user.model');

/**
 * Get all parlors with optional filters
 */
exports.getParlors = async (req, res) => {
  try {
    const filter = {};
    
    // Extract filters from query parameters
    const { location, amenities } = req.query;
    
    if (location) {
      const [city, state, country] = location.split(',');
      
      if (city) filter['location.city'] = city.trim();
      if (state) filter['location.state'] = state.trim();
      if (country) filter['location.country'] = country.trim();
    }
    
    if (amenities) {
      filter.amenities = amenities.split(',').map(item => item.trim());
    }
    
    const parlors = await Parlor.findAll(filter);
    res.json(parlors);
  } catch (error) {
    console.error('Get parlors error:', error);
    res.status(500).json({ message: error.message || 'Failed to get parlors' });
  }
};

/**
 * Get parlor by ID
 */
exports.getParlorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const parlor = await Parlor.findById(id);
    if (!parlor) {
      return res.status(404).json({ message: 'Parlor not found' });
    }
    
    res.json(parlor);
  } catch (error) {
    console.error('Get parlor by ID error:', error);
    res.status(500).json({ message: error.message || 'Failed to get parlor' });
  }
};

/**
 * Get parlors by owner ID
 */
exports.getParlorsByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    const parlors = await Parlor.findByOwnerId(ownerId);
    res.json(parlors);
  } catch (error) {
    console.error('Get parlors by owner ID error:', error);
    res.status(500).json({ message: error.message || 'Failed to get parlors' });
  }
};

/**
 * Create a new parlor
 */
exports.createParlor = async (req, res) => {
  try {
    const { userId } = req;
    const parlorData = req.body;
    
    // Verify user ID is provided
    if (!parlorData.ownerId) {
      parlorData.ownerId = userId;
    } else if (parlorData.ownerId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Cannot create parlor for a different user' });
    }
    
    // Validate user exists
    const user = await User.findById(parlorData.ownerId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has parlor_owner role
    if (user.role !== 'parlor_owner' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'User must have parlor_owner role to create a parlor' });
    }
    
    // Set initial rating and review count
    parlorData.rating = 0;
    parlorData.reviewCount = 0;
    
    // Initialize artistIds array if not provided
    if (!parlorData.artistIds) {
      parlorData.artistIds = [];
    }
    
    // Create the parlor
    const newParlor = await Parlor.create(parlorData);
    res.status(201).json(newParlor);
  } catch (error) {
    console.error('Create parlor error:', error);
    res.status(500).json({ message: error.message || 'Failed to create parlor' });
  }
};

/**
 * Update a parlor
 */
exports.updateParlor = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req;
    const updates = req.body;
    
    // Get the parlor
    const parlor = await Parlor.findById(id);
    if (!parlor) {
      return res.status(404).json({ message: 'Parlor not found' });
    }
    
    // Check permissions - only the owner or an admin can update
    if (parlor.ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this parlor' });
    }
    
    // Don't allow updating ownerId, rating, or reviewCount
    if (updates.ownerId || updates.rating || updates.reviewCount) {
      return res.status(400).json({ message: 'Cannot update restricted fields' });
    }
    
    // Update the parlor
    const updatedParlor = await Parlor.update(id, updates);
    res.json(updatedParlor);
  } catch (error) {
    console.error('Update parlor error:', error);
    res.status(500).json({ message: error.message || 'Failed to update parlor' });
  }
};

/**
 * Delete a parlor
 */
exports.deleteParlor = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req;
    
    // Get the parlor
    const parlor = await Parlor.findById(id);
    if (!parlor) {
      return res.status(404).json({ message: 'Parlor not found' });
    }
    
    // Check permissions - only the owner or an admin can delete
    if (parlor.ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this parlor' });
    }
    
    // Delete the parlor
    await Parlor.delete(id);
    res.json({ message: 'Parlor deleted successfully' });
  } catch (error) {
    console.error('Delete parlor error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete parlor' });
  }
};

/**
 * Get featured parlors
 */
exports.getFeaturedParlors = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 6;
    
    const parlors = await Parlor.getFeatured(limit);
    res.json(parlors);
  } catch (error) {
    console.error('Get featured parlors error:', error);
    res.status(500).json({ message: error.message || 'Failed to get featured parlors' });
  }
};

/**
 * Get sponsored parlors
 */
exports.getSponsoredParlors = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 4;
    
    const parlors = await Parlor.getSponsored(limit);
    res.json(parlors);
  } catch (error) {
    console.error('Get sponsored parlors error:', error);
    res.status(500).json({ message: error.message || 'Failed to get sponsored parlors' });
  }
};

/**
 * Search parlors
 */
exports.searchParlors = async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const parlors = await Parlor.search(searchTerm, limit);
    res.json(parlors);
  } catch (error) {
    console.error('Search parlors error:', error);
    res.status(500).json({ message: error.message || 'Failed to search parlors' });
  }
};