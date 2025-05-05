/**
 * Appointment Routes
 */
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get routes (public)
// Get artist's appointments
router.get('/artist/:artistId', appointmentController.getArtistAppointments);

// Get artist's appointments in date range
router.get('/artist/:artistId/daterange', appointmentController.getArtistAppointmentsInDateRange);

// Get parlor's appointments
router.get('/parlor/:parlorId', appointmentController.getParlorAppointments);

// Get parlor's appointments in date range
router.get('/parlor/:parlorId/daterange', appointmentController.getParlorAppointmentsInDateRange);

// Protected routes (require authentication)
// Get current client's appointments
router.get('/client/:clientId', authMiddleware.verifyToken, appointmentController.getClientAppointments);

// Create a new appointment
router.post('/', authMiddleware.verifyToken, appointmentController.createAppointment);

// Update an appointment
router.put('/:id', authMiddleware.verifyToken, appointmentController.updateAppointment);

// Delete an appointment
router.delete('/:id', authMiddleware.verifyToken, appointmentController.deleteAppointment);

// Change appointment status
router.patch('/:id/status', authMiddleware.verifyToken, appointmentController.changeAppointmentStatus);

module.exports = router;