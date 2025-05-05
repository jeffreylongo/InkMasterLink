const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/auth.controller');
const artistController = require('../controllers/artist.controller');
// Use the PostgreSQL-based parlor controller
const parlorController = require('../controllers/parlor.controller.pg');
const reviewController = require('../controllers/review.controller');
const guestspotController = require('../controllers/guestspot.controller');
const instagramController = require('../controllers/instagram.controller');
const scheduleController = require('../controllers/schedule.controller');
const appointmentController = require('../controllers/appointment.controller');

// Import middleware
const authMiddleware = require('../middleware/auth.middleware');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Artist routes
router.get('/artists', artistController.getArtists);
router.get('/artists/:id', artistController.getArtistById);
router.get('/artists/user/:userId', artistController.getArtistByUserId);
router.get('/artists/parlor/:parlorId', artistController.getArtistsByParlorId);
router.post('/artists', authMiddleware.verifyToken, artistController.createArtist);
router.put('/artists/:id', authMiddleware.verifyToken, artistController.updateArtist);
router.delete('/artists/:id', authMiddleware.verifyToken, artistController.deleteArtist);
router.get('/artists/featured/:limit', artistController.getFeaturedArtists);
router.get('/artists/sponsored/:limit', artistController.getSponsoredArtists);
router.get('/artists/traveling/:limit', artistController.getTravelingArtists);
router.get('/artists/search/:searchTerm', artistController.searchArtists);

// Parlor routes
router.get('/parlors', parlorController.getAllParlors);
router.get('/parlors/featured', parlorController.getFeaturedParlors);
router.get('/parlors/sponsored', parlorController.getSponsoredParlors);
router.get('/parlors/random', parlorController.getRandomParlors);
router.get('/parlors/search', parlorController.searchParlors);
router.get('/parlors/states', parlorController.getAvailableStates);
router.get('/parlors/cities/:state', parlorController.getAvailableCities);
router.get('/parlors/owner/:ownerId', parlorController.getParlorsByOwner);
router.get('/parlors/:id', parlorController.getParlorById);
router.post('/parlors', authMiddleware.verifyToken, parlorController.createParlor);
router.put('/parlors/:id', authMiddleware.verifyToken, parlorController.updateParlor);
router.delete('/parlors/:id', authMiddleware.verifyToken, parlorController.deleteParlor);

// Review routes
router.get('/reviews', reviewController.getReviews);
router.get('/reviews/:id', reviewController.getReviewById);
router.get('/reviews/user/:userId', reviewController.getReviewsByUser);
router.post('/reviews', authMiddleware.verifyToken, reviewController.createReview);
router.put('/reviews/:id', authMiddleware.verifyToken, reviewController.updateReview);
router.delete('/reviews/:id', authMiddleware.verifyToken, reviewController.deleteReview);

// Guestspot routes
router.get('/guestspots', guestspotController.getGuestspots);
router.get('/guestspots/:id', guestspotController.getGuestspotById);
router.get('/guestspots/parlor/:parlorId', guestspotController.getGuestspotsByParlorId);
router.get('/guestspots/artist/:artistId', guestspotController.getGuestspotsByArtistId);
router.post('/guestspots', authMiddleware.verifyToken, guestspotController.createGuestspot);
router.put('/guestspots/:id', authMiddleware.verifyToken, guestspotController.updateGuestspot);
router.delete('/guestspots/:id', authMiddleware.verifyToken, guestspotController.deleteGuestspot);
router.post('/guestspots/apply', authMiddleware.verifyToken, guestspotController.applyForGuestspot);
router.post('/guestspots/:id/approve/:artistId', authMiddleware.verifyToken, guestspotController.approveApplication);
router.post('/guestspots/:id/reject/:artistId', authMiddleware.verifyToken, guestspotController.rejectApplication);
router.post('/guestspots/:id/cancel', authMiddleware.verifyToken, guestspotController.cancelGuestspot);
router.post('/guestspots/:id/complete', authMiddleware.verifyToken, guestspotController.completeGuestspot);
router.get('/guestspots/upcoming/:limit', guestspotController.getUpcomingGuestspots);
router.get('/guestspots/open/:limit', guestspotController.getOpenGuestspots);

// Instagram routes
router.get('/instagram/auth', instagramController.getAuthUrl);
router.get('/instagram/callback', instagramController.handleCallback);
router.post('/instagram/connect', authMiddleware.verifyToken, instagramController.connectInstagram);
router.delete('/instagram/disconnect/:userId', authMiddleware.verifyToken, instagramController.disconnectInstagram);
router.get('/instagram/user/:username', instagramController.getUserFeed);
router.get('/instagram/artist/:artistId', instagramController.getArtistFeed);
router.get('/instagram/parlor/:parlorId', instagramController.getParlorFeed);

// Schedule routes
router.get('/schedules/artist/:artistId', scheduleController.getArtistSchedule);
router.get('/schedules/parlor/:parlorId', scheduleController.getParlorSchedule);
router.get('/schedules/artist/:artistId/availability', scheduleController.getArtistAvailabilityOnDate);
router.post('/schedules', authMiddleware.verifyToken, scheduleController.createSchedule);
router.put('/schedules/:id', authMiddleware.verifyToken, scheduleController.updateSchedule);
router.delete('/schedules/:id', authMiddleware.verifyToken, scheduleController.deleteSchedule);

// Appointment routes
router.get('/appointments/artist/:artistId', appointmentController.getArtistAppointments);
router.get('/appointments/client/:clientId', authMiddleware.verifyToken, appointmentController.getClientAppointments);
router.get('/appointments/parlor/:parlorId', appointmentController.getParlorAppointments);
router.get('/appointments/artist/:artistId/daterange', appointmentController.getArtistAppointmentsInDateRange);
router.get('/appointments/parlor/:parlorId/daterange', appointmentController.getParlorAppointmentsInDateRange);
router.post('/appointments', authMiddleware.verifyToken, appointmentController.createAppointment);
router.put('/appointments/:id', authMiddleware.verifyToken, appointmentController.updateAppointment);
router.delete('/appointments/:id', authMiddleware.verifyToken, appointmentController.deleteAppointment);
router.patch('/appointments/:id/status', authMiddleware.verifyToken, appointmentController.changeAppointmentStatus);

module.exports = router;