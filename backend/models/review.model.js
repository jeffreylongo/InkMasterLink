const db = require('./db');

class Review {
  static findById(id) {
    return db.findById('reviews', id);
  }
  
  static findByUser(userId) {
    return db.findAll('reviews', { userId });
  }
  
  static findByTarget(targetId, targetType) {
    return db.findAll('reviews', { targetId, targetType });
  }
  
  static create(reviewData) {
    return db.create('reviews', reviewData);
  }
  
  static update(id, updates) {
    return db.update('reviews', id, updates);
  }
  
  static delete(id) {
    return db.delete('reviews', id);
  }
  
  static findAll(filter = {}) {
    return db.findAll('reviews', filter);
  }
  
  static findOne(filter) {
    return db.findOne('reviews', filter);
  }
  
  static getAverageRating(targetId, targetType) {
    const reviews = db.findAll('reviews', { targetId, targetType });
    
    if (reviews.length === 0) {
      return { rating: 0, count: 0 };
    }
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    const average = sum / reviews.length;
    
    return { 
      rating: parseFloat(average.toFixed(1)), 
      count: reviews.length 
    };
  }
}

module.exports = Review;