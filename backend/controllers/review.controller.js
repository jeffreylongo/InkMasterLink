const Review = require('../models/review.model');
const Artist = require('../models/artist.model');
const Parlor = require('../models/parlor.model');
const User = require('../models/user.model');

/**
 * Get all reviews with optional filters
 */
exports.getReviews = async (req, res) => {
  try {
    const filter = {};
    
    // Extract filters from query parameters
    const { targetId, targetType, userId } = req.query;
    
    if (targetId && targetType) {
      filter.targetId = targetId;
      filter.targetType = targetType;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    const reviews = await Review.findAll(filter);
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: error.message || 'Failed to get reviews' });
  }
};

/**
 * Get review by ID
 */
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ message: error.message || 'Failed to get review' });
  }
};

/**
 * Get reviews by user
 */
exports.getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reviews = await Review.findByUser(userId);
    
    // Enhance reviews with target names
    const enhancedReviews = await Promise.all(reviews.map(async (review) => {
      let targetName = '';
      
      if (review.targetType === 'artist') {
        const artist = await Artist.findById(review.targetId);
        targetName = artist ? artist.name : 'Unknown Artist';
      } else if (review.targetType === 'parlor') {
        const parlor = await Parlor.findById(review.targetId);
        targetName = parlor ? parlor.name : 'Unknown Parlor';
      }
      
      return {
        ...review,
        targetName
      };
    }));
    
    res.json(enhancedReviews);
  } catch (error) {
    console.error('Get reviews by user error:', error);
    res.status(500).json({ message: error.message || 'Failed to get user reviews' });
  }
};

/**
 * Create a new review
 */
exports.createReview = async (req, res) => {
  try {
    const { userId } = req;
    const reviewData = req.body;
    
    // Validate required fields
    if (!reviewData.targetId || !reviewData.targetType || !reviewData.rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Set the user ID
    reviewData.userId = userId;
    
    // Validate the target exists
    let target;
    if (reviewData.targetType === 'artist') {
      target = await Artist.findById(reviewData.targetId);
      if (!target) {
        return res.status(404).json({ message: 'Artist not found' });
      }
    } else if (reviewData.targetType === 'parlor') {
      target = await Parlor.findById(reviewData.targetId);
      if (!target) {
        return res.status(404).json({ message: 'Parlor not found' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid target type' });
    }
    
    // Check if user already reviewed this target
    const existingReview = await Review.findOne({
      userId,
      targetId: reviewData.targetId,
      targetType: reviewData.targetType
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this target' });
    }
    
    // Create the review
    const newReview = await Review.create(reviewData);
    
    // Update target rating and review count
    await updateTargetRating(reviewData.targetId, reviewData.targetType);
    
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.message || 'Failed to create review' });
  }
};

/**
 * Update a review
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req;
    const updates = req.body;
    
    // Get the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check permissions - only the reviewer or an admin can update
    if (review.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this review' });
    }
    
    // Don't allow updating userId, targetId, or targetType
    if (updates.userId || updates.targetId || updates.targetType) {
      return res.status(400).json({ message: 'Cannot update restricted fields' });
    }
    
    // Validate rating if provided
    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Update the review
    const updatedReview = await Review.update(id, updates);
    
    // Update target rating
    await updateTargetRating(review.targetId, review.targetType);
    
    res.json(updatedReview);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: error.message || 'Failed to update review' });
  }
};

/**
 * Delete a review
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req;
    
    // Get the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check permissions - only the reviewer or an admin can delete
    if (review.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this review' });
    }
    
    // Store target info before deletion
    const { targetId, targetType } = review;
    
    // Delete the review
    await Review.delete(id);
    
    // Update target rating
    await updateTargetRating(targetId, targetType);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete review' });
  }
};

/**
 * Update target rating and review count
 * @param {string} targetId - Target ID
 * @param {string} targetType - Target type ('artist' or 'parlor')
 */
async function updateTargetRating(targetId, targetType) {
  try {
    const { rating, count } = await Review.getAverageRating(targetId, targetType);
    
    if (targetType === 'artist') {
      await Artist.update(targetId, { rating, reviewCount: count });
    } else if (targetType === 'parlor') {
      await Parlor.update(targetId, { rating, reviewCount: count });
    }
  } catch (error) {
    console.error('Update target rating error:', error);
    throw error;
  }
}