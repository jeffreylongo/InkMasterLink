const db = require('./db');

class Artist {
  static findById(id) {
    return db.findById('artists', id);
  }
  
  static findByUserId(userId) {
    return db.findOne('artists', { userId });
  }
  
  static findByParlorId(parlorId) {
    return db.findAll('artists', { 'location.parlorId': parlorId });
  }
  
  static create(artistData) {
    return db.create('artists', artistData);
  }
  
  static update(id, updates) {
    return db.update('artists', id, updates);
  }
  
  static delete(id) {
    return db.delete('artists', id);
  }
  
  static findAll(filter = {}) {
    return db.findAll('artists', filter);
  }
  
  static findOne(filter) {
    return db.findOne('artists', filter);
  }
  
  static getFeatured(limit = 6) {
    const artists = db.findAll('artists', { featured: true });
    return artists.slice(0, limit);
  }
  
  static getSponsored(limit = 4) {
    const artists = db.findAll('artists', { sponsored: true });
    return artists.slice(0, limit);
  }
  
  static getTraveling(limit = 8) {
    const artists = db.findAll('artists', { 'availability.travelWilling': true });
    return artists.slice(0, limit);
  }
  
  static search(searchTerm, limit = 10) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const artists = db.findAll('artists').filter(artist => {
      // Check name
      if (artist.name.toLowerCase().includes(lowerSearchTerm)) {
        return true;
      }
      
      // Check specialty
      if (artist.specialty && artist.specialty.some(s => s.toLowerCase().includes(lowerSearchTerm))) {
        return true;
      }
      
      // Check location
      if (artist.location) {
        const { city, state, country } = artist.location;
        if (
          (city && city.toLowerCase().includes(lowerSearchTerm)) ||
          (state && state.toLowerCase().includes(lowerSearchTerm)) ||
          (country && country.toLowerCase().includes(lowerSearchTerm))
        ) {
          return true;
        }
      }
      
      return false;
    });
    
    return artists.slice(0, limit);
  }
}

module.exports = Artist;