const Guestspot = require('../models/guestspot.model');
const Parlor = require('../models/parlor.model');
const Artist = require('../models/artist.model');

/**
 * Get all guestspots with optional filters
 */
exports.getGuestspots = async (req, res) => {
  try {
    const filter = {};
    
    // Extract filters from query parameters
    const { status, parlorId, artistId, startDate, endDate } = req.query;
    
    if (status) {
      filter.status = status;
    }
    
    if (parlorId) {
      filter.parlorId = parlorId;
    }
    
    if (artistId) {
      filter.artistId = artistId;
    }
    
    const guestspots = await Guestspot.findAll(filter);
    
    // Filter by date range if provided
    let filteredGuestspots = guestspots;
    
    if (startDate || endDate) {
      filteredGuestspots = guestspots.filter(spot => {
        const spotStartDate = new Date(spot.dateStart);
        const spotEndDate = new Date(spot.dateEnd);
        
        if (startDate && endDate) {
          const filterStartDate = new Date(startDate);
          const filterEndDate = new Date(endDate);
          return spotStartDate >= filterStartDate && spotEndDate <= filterEndDate;
        } else if (startDate) {
          const filterStartDate = new Date(startDate);
          return spotStartDate >= filterStartDate;
        } else if (endDate) {
          const filterEndDate = new Date(endDate);
          return spotEndDate <= filterEndDate;
        }
        
        return true;
      });
    }
    
    res.json(filteredGuestspots);
  } catch (error) {
    console.error('Get guestspots error:', error);
    res.status(500).json({ message: error.message || 'Failed to get guestspots' });
  }
};

/**
 * Get guestspot by ID
 */
exports.getGuestspotById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const guestspot = await Guestspot.findById(id);
    if (!guestspot) {
      return res.status(404).json({ message: 'Guestspot not found' });
    }
    
    res.json(guestspot);
  } catch (error) {
    console.error('Get guestspot by ID error:', error);
    res.status(500).json({ message: error.message || 'Failed to get guestspot' });
  }
};

/**
 * Get guestspots by parlor ID
 */
exports.getGuestspotsByParlorId = async (req, res) => {
  try {
    const { parlorId } = req.params;
    
    const guestspots = await Guestspot.findByParlorId(parlorId);
    res.json(guestspots);
  } catch (error) {
    console.error('Get guestspots by parlor ID error:', error);
    res.status(500).json({ message: error.message || 'Failed to get guestspots' });
  }
};

/**
 * Get guestspots by artist ID
 */
exports.getGuestspotsByArtistId = async (req, res) => {
  try {
    const { artistId } = req.params;
    
    const guestspots = await Guestspot.findByArtistId(artistId);
    res.json(guestspots);
  } catch (error) {
    console.error('Get guestspots by artist ID error:', error);
    res.status(500).json({ message: error.message || 'Failed to get guestspots' });
  }
};

/**
 * Create a new guestspot
 */
exports.createGuestspot = async (req, res) => {
  try {
    const { userId, userRole } = req;
    const guestspotData = req.body;
    
    // Validate required fields
    if (!guestspotData.parlorId || !guestspotData.dateStart || !guestspotData.dateEnd) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate parlor exists
    const parlor = await Parlor.findById(guestspotData.parlorId);
    if (!parlor) {
      return res.status(404).json({ message: 'Parlor not found' });
    }
    
    // Check permissions - only the parlor owner or an admin can create a guestspot
    if (parlor.ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to create a guestspot for this parlor' });
    }
    
    // Set initial status
    guestspotData.status = guestspotData.status || 'open';
    
    // Initialize applicants array if not provided
    if (!guestspotData.applicants) {
      guestspotData.applicants = [];
    }
    
    // Create the guestspot
    const newGuestspot = await Guestspot.create(guestspotData);
    res.status(201).json(newGuestspot);
  } catch (error) {
    console.error('Create guestspot error:', error);
    res.status(500).json({ message: error.message || 'Failed to create guestspot' });
  }
};

/**
 * Update a guestspot
 */
exports.updateGuestspot = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req;
    const updates = req.body;
    
    // Get the guestspot
    const guestspot = await Guestspot.findById(id);
    if (!guestspot) {
      return res.status(404).json({ message: 'Guestspot not found' });
    }
    
    // Get the parlor
    const parlor = await Parlor.findById(guestspot.parlorId);
    if (!parlor) {
      return res.status(404).json({ message: 'Parlor not found' });
    }
    
    // Check permissions - only the parlor owner or an admin can update
    if (parlor.ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this guestspot' });
    }
    
    // Don't allow updating parlorId
    if (updates.parlorId && updates.parlorId !== guestspot.parlorId) {
      return res.status(400).json({ message: 'Cannot update parlor ID' });
    }
    
    // Update the guestspot
    const updatedGuestspot = await Guestspot.update(id, updates);
    res.json(updatedGuestspot);
  } catch (error) {
    console.error('Update guestspot error:', error);
    res.status(500).json({ message: error.message || 'Failed to update guestspot' });
  }
};

/**
 * Delete a guestspot
 */
exports.deleteGuestspot = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req;
    
    // Get the guestspot
    const guestspot = await Guestspot.findById(id);
    if (!guestspot) {
      return res.status(404).json({ message: 'Guestspot not found' });
    }
    
    // Get the parlor
    const parlor = await Parlor.findById(guestspot.parlorId);
    if (!parlor) {
      return res.status(404).json({ message: 'Parlor not found' });
    }
    
    // Check permissions - only the parlor owner or an admin can delete
    if (parlor.ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this guestspot' });
    }
    
    // Delete the guestspot
    await Guestspot.delete(id);
    res.json({ message: 'Guestspot deleted successfully' });
  } catch (error) {
    console.error('Delete guestspot error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete guestspot' });
  }
};

/**
 * Apply for a guestspot
 */
exports.applyForGuestspot = async (req, res) => {
  try {
    const { userId, userRole } = req;
    const { guestspotId, message, portfolio } = req.body;
    
    if (!guestspotId || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get the artist
    const artist = await Artist.findByUserId(userId);
    if (!artist && userRole !== 'admin') {
      return res.status(404).json({ message: 'You must be an artist to apply for a guestspot' });
    }
    
    const artistId = artist ? artist.id : req.body.artistId;
    
    if (!artistId) {
      return res.status(400).json({ message: 'Artist ID is required' });
    }
    
    // Apply for the guestspot
    const updatedGuestspot = await Guestspot.applyToSpot(
      guestspotId,
      artistId,
      message,
      portfolio || []
    );
    
    res.json(updatedGuestspot);
  } catch (error) {
    console.error('Apply for guestspot error:', error);
    res.status(500).json({ message: error.message || 'Failed to apply for guestspot' });
  }
};

/**
 * Approve an application
 */
exports.approveApplication = async (req, res) => {
  try {
    const { id, artistId } = req.params;
    const { userId, userRole } = req;
    
    // Get the guestspot
    const guestspot = await Guestspot.findById(id);
    if (!guestspot) {
      return res.status(404).json({ message: 'Guestspot not found' });
    }
    
    // Get the parlor
    const parlor = await Parlor.findById(guestspot.parlorId);
    if (!parlor) {
      return res.status(404).json({ message: 'Parlor not found' });
    }
    
    // Check permissions - only the parlor owner or an admin can approve
    if (parlor.ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to approve applications for this guestspot' });
    }
    
    // Approve the application
    const updatedGuestspot = await Guestspot.approveApplication(id, artistId);
    res.json(updatedGuestspot);
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ message: error.message || 'Failed to approve application' });
  }
};

/**
 * Reject an application
 */
exports.rejectApplication = async (req, res) => {
  try {
    const { id, artistId } = req.params;
    const { userId, userRole } = req;
    
    // Get the guestspot
    const guestspot = await Guestspot.findById(id);
    if (!guestspot) {
      return res.status(404).json({ message: 'Guestspot not found' });
    }
    
    // Get the parlor
    const parlor = await Parlor.findById(guestspot.parlorId);
    if (!parlor) {
      return res.status(404).json({ message: 'Parlor not found' });
    }
    
    // Check permissions - only the parlor owner or an admin can reject
    if (parlor.ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to reject applications for this guestspot' });
    }
    
    // Reject the application
    const updatedGuestspot = await Guestspot.rejectApplication(id, artistId);
    res.json(updatedGuestspot);
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ message: error.message || 'Failed to reject application' });
  }
};

/**
 * Cancel a guestspot
 */
exports.cancelGuestspot = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req;
    
    // Get the guestspot
    const guestspot = await Guestspot.findById(id);
    if (!guestspot) {
      return res.status(404).json({ message: 'Guestspot not found' });
    }
    
    // Get the parlor
    const parlor = await Parlor.findById(guestspot.parlorId);
    if (!parlor) {
      return res.status(404).json({ message: 'Parlor not found' });
    }
    
    // Check if user is the parlor owner
    const isParlorOwner = parlor.ownerId === userId;
    
    // Check if user is the artist
    let isArtist = false;
    if (guestspot.artistId) {
      const artist = await Artist.findById(guestspot.artistId);
      isArtist = artist && artist.userId === userId;
    }
    
    // Check permissions - only the parlor owner, the artist, or an admin can cancel
    if (!isParlorOwner && !isArtist && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to cancel this guestspot' });
    }
    
    // Cancel the guestspot
    const updatedGuestspot = await Guestspot.cancelSpot(id);
    res.json(updatedGuestspot);
  } catch (error) {
    console.error('Cancel guestspot error:', error);
    res.status(500).json({ message: error.message || 'Failed to cancel guestspot' });
  }
};

/**
 * Complete a guestspot
 */
exports.completeGuestspot = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req;
    
    // Get the guestspot
    const guestspot = await Guestspot.findById(id);
    if (!guestspot) {
      return res.status(404).json({ message: 'Guestspot not found' });
    }
    
    // Get the parlor
    const parlor = await Parlor.findById(guestspot.parlorId);
    if (!parlor) {
      return res.status(404).json({ message: 'Parlor not found' });
    }
    
    // Check permissions - only the parlor owner or an admin can complete
    if (parlor.ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to complete this guestspot' });
    }
    
    // Complete the guestspot
    const updatedGuestspot = await Guestspot.completeSpot(id);
    res.json(updatedGuestspot);
  } catch (error) {
    console.error('Complete guestspot error:', error);
    res.status(500).json({ message: error.message || 'Failed to complete guestspot' });
  }
};

/**
 * Get upcoming guestspots
 */
exports.getUpcomingGuestspots = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 6;
    
    const guestspots = await Guestspot.getUpcoming(limit);
    res.json(guestspots);
  } catch (error) {
    console.error('Get upcoming guestspots error:', error);
    res.status(500).json({ message: error.message || 'Failed to get upcoming guestspots' });
  }
};

/**
 * Get open guestspots
 */
exports.getOpenGuestspots = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    
    const guestspots = await Guestspot.getOpen(limit);
    res.json(guestspots);
  } catch (error) {
    console.error('Get open guestspots error:', error);
    res.status(500).json({ message: error.message || 'Failed to get open guestspots' });
  }
};