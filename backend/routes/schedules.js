/**
 * Schedule Routes
 */
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get artist's schedule
router.get('/artist/:artistId', scheduleController.getArtistSchedule);

// Get parlor's schedule
router.get('/parlor/:parlorId', scheduleController.getParlorSchedule);

// Get artist's availability on a specific date
router.get('/artist/:artistId/availability', scheduleController.getArtistAvailabilityOnDate);

// Create a new schedule entry (requires authentication)
router.post('/', authMiddleware.verifyToken, scheduleController.createSchedule);

// Update a schedule (requires authentication)
router.put('/:id', authMiddleware.verifyToken, scheduleController.updateSchedule);

// Delete a schedule (requires authentication)
router.delete('/:id', authMiddleware.verifyToken, scheduleController.deleteSchedule);

module.exports = router;