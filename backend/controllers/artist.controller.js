const Artist = require('../models/artist.model');
const User = require('../models/user.model');

/**
 * Get all artists with optional filters
 */
exports.getArtists = async (req, res) => {
  try {
    const filter = {};
    
    // Extract filters from query parameters
    const { specialty, location, travelWilling } = req.query;
    
    if (specialty) {
      filter.specialty = specialty;
    }
    
    if (location) {
      const [city, state, country] = location.split(',');
      
      if (city) filter['location.city'] = city.trim();
      if (state) filter['location.state'] = state.trim();
      if (country) filter['location.country'] = country.trim();
    }
    
    if (travelWilling === 'true') {
      filter['availability.travelWilling'] = true;
    }
    
    const artists = await Artist.findAll(filter);
    res.json(artists);
  } catch (error) {
    console.error('Get artists error:', error);
    res.status(500).json({ message: error.message || 'Failed to get artists' });
  }
};

/**
 * Get artist by ID
 */
exports.getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    res.json(artist);
  } catch (error) {
    console.error('Get artist by ID error:', error);
    res.status(500).json({ message: error.message || 'Failed to get artist' });
  }
};

/**
 * Get artist by user ID
 */
exports.getArtistByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const artist = await Artist.findByUserId(userId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    res.json(artist);
  } catch (error) {
    console.error('Get artist by user ID error:', error);
    res.status(500).json({ message: error.message || 'Failed to get artist' });
  }
};

/**
 * Get artists by parlor ID
 */
exports.getArtistsByParlorId = async (req, res) => {
  try {
    const { parlorId } = req.params;
    
    const artists = await Artist.findByParlorId(parlorId);
    res.json(artists);
  } catch (error) {
    console.error('Get artists by parlor ID error:', error);
    res.status(500).json({ message: error.message || 'Failed to get artists' });
  }
};

/**
 * Create a new artist
 */
exports.createArtist = async (req, res) => {
  try {
    const { userId } = req;
    const artistData = req.body;
    
    // Verify user ID is provided
    if (!artistData.userId) {
      artistData.userId = userId;
    } else if (artistData.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Cannot create artist for a different user' });
    }
    
    // Check if artist already exists for this user
    const existingArtist = await Artist.findByUserId(artistData.userId);
    if (existingArtist) {
      return res.status(400).json({ message: 'Artist profile already exists for this user' });
    }
    
    // Validate user exists
    const user = await User.findById(artistData.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has artist role
    if (user.role !== 'artist' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'User must have artist role to create an artist profile' });
    }
    
    // Set initial rating and review count
    artistData.rating = 0;
    artistData.reviewCount = 0;
    
    // Create the artist
    const newArtist = await Artist.create(artistData);
    res.status(201).json(newArtist);
  } catch (error) {
    console.error('Create artist error:', error);
    res.status(500).json({ message: error.message || 'Failed to create artist' });
  }
};

/**
 * Update an artist
 */
exports.updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req;
    const updates = req.body;
    
    // Get the artist
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    // Check permissions - only the artist or an admin can update
    if (artist.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this artist' });
    }
    
    // Don't allow updating userId, rating, or reviewCount
    if (updates.userId || updates.rating || updates.reviewCount) {
      return res.status(400).json({ message: 'Cannot update restricted fields' });
    }
    
    // Update the artist
    const updatedArtist = await Artist.update(id, updates);
    res.json(updatedArtist);
  } catch (error) {
    console.error('Update artist error:', error);
    res.status(500).json({ message: error.message || 'Failed to update artist' });
  }
};

/**
 * Delete an artist
 */
exports.deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req;
    
    // Get the artist
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    // Check permissions - only the artist or an admin can delete
    if (artist.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this artist' });
    }
    
    // Delete the artist
    await Artist.delete(id);
    res.json({ message: 'Artist deleted successfully' });
  } catch (error) {
    console.error('Delete artist error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete artist' });
  }
};

/**
 * Get featured artists
 */
exports.getFeaturedArtists = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 6;
    
    const artists = await Artist.getFeatured(limit);
    res.json(artists);
  } catch (error) {
    console.error('Get featured artists error:', error);
    res.status(500).json({ message: error.message || 'Failed to get featured artists' });
  }
};

/**
 * Get sponsored artists
 */
exports.getSponsoredArtists = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 4;
    
    const artists = await Artist.getSponsored(limit);
    res.json(artists);
  } catch (error) {
    console.error('Get sponsored artists error:', error);
    res.status(500).json({ message: error.message || 'Failed to get sponsored artists' });
  }
};

/**
 * Get traveling artists
 */
exports.getTravelingArtists = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 8;
    
    const artists = await Artist.getTraveling(limit);
    res.json(artists);
  } catch (error) {
    console.error('Get traveling artists error:', error);
    res.status(500).json({ message: error.message || 'Failed to get traveling artists' });
  }
};

/**
 * Search artists
 */
exports.searchArtists = async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const artists = await Artist.search(searchTerm, limit);
    res.json(artists);
  } catch (error) {
    console.error('Search artists error:', error);
    res.status(500).json({ message: error.message || 'Failed to search artists' });
  }
};