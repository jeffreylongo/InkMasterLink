/**
 * Appointment Controller
 * Handles booking and managing appointments
 */
// Import storage from our bridge module
const { storage } = require('../utils/storage-bridge');

/**
 * Get all appointments for an artist
 */
async function getArtistAppointments(req, res) {
  try {
    const artistId = parseInt(req.params.artistId);
    
    if (isNaN(artistId)) {
      return res.status(400).json({ success: false, message: 'Invalid artist ID' });
    }
    
    const appointments = await storage.getAppointmentsByArtist(artistId);
    
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error getting artist appointments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get all appointments for a client/user
 */
async function getClientAppointments(req, res) {
  try {
    const clientId = parseInt(req.params.clientId);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ success: false, message: 'Invalid client ID' });
    }
    
    const appointments = await storage.getAppointmentsByClient(clientId);
    
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error getting client appointments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get all appointments for a parlor
 */
async function getParlorAppointments(req, res) {
  try {
    const parlorId = parseInt(req.params.parlorId);
    
    if (isNaN(parlorId)) {
      return res.status(400).json({ success: false, message: 'Invalid parlor ID' });
    }
    
    const appointments = await storage.getAppointmentsByParlor(parlorId);
    
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error getting parlor appointments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get artist appointments in date range
 */
async function getArtistAppointmentsInDateRange(req, res) {
  try {
    const artistId = parseInt(req.params.artistId);
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    
    if (isNaN(artistId)) {
      return res.status(400).json({ success: false, message: 'Invalid artist ID' });
    }
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }
    
    const appointments = await storage.getArtistAppointmentsInDateRange(artistId, startDate, endDate);
    
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error getting artist appointments in date range:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get parlor appointments in date range
 */
async function getParlorAppointmentsInDateRange(req, res) {
  try {
    const parlorId = parseInt(req.params.parlorId);
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    
    if (isNaN(parlorId)) {
      return res.status(400).json({ success: false, message: 'Invalid parlor ID' });
    }
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }
    
    const appointments = await storage.getParlorAppointmentsInDateRange(parlorId, startDate, endDate);
    
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error getting parlor appointments in date range:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Book a new appointment
 */
async function createAppointment(req, res) {
  try {
    const { clientId, artistId, parlorId, startTime, endTime, serviceType, description, notes, deposit, price, referenceImages } = req.body;
    
    // Validate required fields
    if (!clientId || !artistId || !parlorId || !startTime || !endTime || !serviceType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields. clientId, artistId, parlorId, startTime, endTime, and serviceType are required.' 
      });
    }
    
    const newAppointment = {
      clientId: parseInt(clientId),
      artistId: parseInt(artistId),
      parlorId: parseInt(parlorId),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      serviceType,
      status: 'pending' // Default status
    };
    
    // Validate dates
    if (isNaN(newAppointment.startTime.getTime()) || isNaN(newAppointment.endTime.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }
    
    // Add optional fields if they exist
    if (description) newAppointment.description = description;
    if (notes) newAppointment.notes = notes;
    if (deposit !== undefined) newAppointment.deposit = parseInt(deposit);
    if (price !== undefined) newAppointment.price = parseInt(price);
    if (referenceImages) newAppointment.referenceImages = referenceImages;
    
    const appointment = await storage.createAppointment(newAppointment);
    
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Update an appointment
 */
async function updateAppointment(req, res) {
  try {
    const appointmentId = parseInt(req.params.id);
    
    if (isNaN(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }
    
    const updates = {};
    
    // Only add fields that were provided and convert to appropriate types
    if (req.body.clientId !== undefined) updates.clientId = parseInt(req.body.clientId);
    if (req.body.artistId !== undefined) updates.artistId = parseInt(req.body.artistId);
    if (req.body.parlorId !== undefined) updates.parlorId = parseInt(req.body.parlorId);
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.serviceType !== undefined) updates.serviceType = req.body.serviceType;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.notes !== undefined) updates.notes = req.body.notes;
    if (req.body.deposit !== undefined) updates.deposit = parseInt(req.body.deposit);
    if (req.body.price !== undefined) updates.price = parseInt(req.body.price);
    if (req.body.referenceImages !== undefined) updates.referenceImages = req.body.referenceImages;
    
    if (req.body.startTime !== undefined) {
      updates.startTime = new Date(req.body.startTime);
      if (isNaN(updates.startTime.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format for startTime' });
      }
    }
    
    if (req.body.endTime !== undefined) {
      updates.endTime = new Date(req.body.endTime);
      if (isNaN(updates.endTime.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format for endTime' });
      }
    }
    
    const updated = await storage.updateAppointment(appointmentId, updates);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Delete an appointment
 */
async function deleteAppointment(req, res) {
  try {
    const appointmentId = parseInt(req.params.id);
    
    if (isNaN(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }
    
    const result = await storage.deleteAppointment(appointmentId);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Change appointment status
 */
async function changeAppointmentStatus(req, res) {
  try {
    const appointmentId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (isNaN(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const updated = await storage.changeAppointmentStatus(appointmentId, status);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error changing appointment status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  getArtistAppointments,
  getClientAppointments,
  getParlorAppointments,
  getArtistAppointmentsInDateRange,
  getParlorAppointmentsInDateRange,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  changeAppointmentStatus
};