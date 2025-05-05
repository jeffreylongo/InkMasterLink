/**
 * Schedule Controller
 * Handles the schedule and availability functionality
 */
// Import storage from our bridge module
const { storage } = require('../utils/storage-bridge');

/**
 * Get artist's schedule
 */
async function getArtistSchedule(req, res) {
  try {
    const artistId = parseInt(req.params.artistId);
    
    if (isNaN(artistId)) {
      return res.status(400).json({ success: false, message: 'Invalid artist ID' });
    }
    
    const schedules = await storage.getArtistSchedule(artistId);
    
    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Error getting artist schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get parlor's schedule
 */
async function getParlorSchedule(req, res) {
  try {
    const parlorId = parseInt(req.params.parlorId);
    
    if (isNaN(parlorId)) {
      return res.status(400).json({ success: false, message: 'Invalid parlor ID' });
    }
    
    const schedules = await storage.getParlorSchedule(parlorId);
    
    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Error getting parlor schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get artist's availability on a specific date
 */
async function getArtistAvailabilityOnDate(req, res) {
  try {
    const artistId = parseInt(req.params.artistId);
    const date = new Date(req.query.date);
    
    if (isNaN(artistId)) {
      return res.status(400).json({ success: false, message: 'Invalid artist ID' });
    }
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }
    
    const availability = await storage.getArtistAvailabilityOnDate(artistId, date);
    
    res.json({ success: true, data: availability });
  } catch (error) {
    console.error('Error getting artist availability:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Create a new schedule
 */
async function createSchedule(req, res) {
  try {
    const { artistId, parlorId, dayOfWeek, startTime, endTime, isAvailable, isRecurring, specificDate } = req.body;
    
    // Validate required fields
    if (!artistId || (startTime === undefined) || (endTime === undefined) || (dayOfWeek === undefined && !specificDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields. artistId, startTime, endTime, and either dayOfWeek or specificDate are required.' 
      });
    }
    
    const newSchedule = {
      artistId: parseInt(artistId),
      dayOfWeek: parseInt(dayOfWeek),
      startTime,
      endTime,
      isAvailable: isAvailable !== false, // default to true
      isRecurring: isRecurring !== false, // default to true
    };
    
    // Add optional fields if they exist
    if (parlorId) {
      newSchedule.parlorId = parseInt(parlorId);
    }
    
    if (specificDate) {
      newSchedule.specificDate = new Date(specificDate);
      
      if (isNaN(newSchedule.specificDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format for specificDate' });
      }
    }
    
    const schedule = await storage.createSchedule(newSchedule);
    
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Update a schedule
 */
async function updateSchedule(req, res) {
  try {
    const scheduleId = parseInt(req.params.id);
    
    if (isNaN(scheduleId)) {
      return res.status(400).json({ success: false, message: 'Invalid schedule ID' });
    }
    
    const updates = {};
    
    // Only add fields that were provided and make sure to convert to appropriate types
    if (req.body.artistId !== undefined) updates.artistId = parseInt(req.body.artistId);
    if (req.body.parlorId !== undefined) updates.parlorId = parseInt(req.body.parlorId);
    if (req.body.dayOfWeek !== undefined) updates.dayOfWeek = parseInt(req.body.dayOfWeek);
    if (req.body.startTime !== undefined) updates.startTime = req.body.startTime;
    if (req.body.endTime !== undefined) updates.endTime = req.body.endTime;
    if (req.body.isAvailable !== undefined) updates.isAvailable = req.body.isAvailable;
    if (req.body.isRecurring !== undefined) updates.isRecurring = req.body.isRecurring;
    
    if (req.body.specificDate !== undefined) {
      updates.specificDate = new Date(req.body.specificDate);
      
      if (isNaN(updates.specificDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format for specificDate' });
      }
    }
    
    const updated = await storage.updateSchedule(scheduleId, updates);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Delete a schedule
 */
async function deleteSchedule(req, res) {
  try {
    const scheduleId = parseInt(req.params.id);
    
    if (isNaN(scheduleId)) {
      return res.status(400).json({ success: false, message: 'Invalid schedule ID' });
    }
    
    const result = await storage.deleteSchedule(scheduleId);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  getArtistSchedule,
  getParlorSchedule,
  getArtistAvailabilityOnDate,
  createSchedule,
  updateSchedule,
  deleteSchedule
};