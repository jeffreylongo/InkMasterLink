/**
 * Parlor Routes (PostgreSQL version)
 */
const express = require('express');
const router = express.Router();
const parlorController = require('../controllers/parlor.controller.pg');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.get('/', parlorController.getAllParlors);
router.get('/featured', parlorController.getFeaturedParlors);
router.get('/sponsored', parlorController.getSponsoredParlors);
router.get('/search', parlorController.searchParlors);
router.get('/states', parlorController.getAvailableStates);
router.get('/cities/:state', parlorController.getAvailableCities);
router.get('/owner/:ownerId', parlorController.getParlorsByOwner);
// This must be the last route as it will match any ID
router.get('/:id', parlorController.getParlorById);

// Protected routes
router.post('/', authMiddleware.verifyToken, parlorController.createParlor);
router.put('/:id', authMiddleware.verifyToken, parlorController.updateParlor);
router.delete('/:id', authMiddleware.verifyToken, parlorController.deleteParlor);

module.exports = router;