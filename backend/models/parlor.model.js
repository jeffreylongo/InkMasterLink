const db = require('./db');

class Parlor {
  static findById(id) {
    return db.findById('parlors', id);
  }
  
  static findByOwnerId(ownerId) {
    return db.findAll('parlors', { ownerId });
  }
  
  static create(parlorData) {
    return db.create('parlors', parlorData);
  }
  
  static update(id, updates) {
    return db.update('parlors', id, updates);
  }
  
  static delete(id) {
    return db.delete('parlors', id);
  }
  
  static findAll(filter = {}) {
    return db.findAll('parlors', filter);
  }
  
  static findOne(filter) {
    return db.findOne('parlors', filter);
  }
  
  static getFeatured(limit = 6) {
    const parlors = db.findAll('parlors', { featured: true });
    return parlors.slice(0, limit);
  }
  
  static getSponsored(limit = 4) {
    const parlors = db.findAll('parlors', { sponsored: true });
    return parlors.slice(0, limit);
  }
  
  static search(searchTerm, limit = 10) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const parlors = db.findAll('parlors').filter(parlor => {
      // Check name
      if (parlor.name.toLowerCase().includes(lowerSearchTerm)) {
        return true;
      }
      
      // Check description
      if (parlor.description && parlor.description.toLowerCase().includes(lowerSearchTerm)) {
        return true;
      }
      
      // Check location
      if (parlor.location) {
        const { address, city, state, country, postalCode } = parlor.location;
        if (
          (address && address.toLowerCase().includes(lowerSearchTerm)) ||
          (city && city.toLowerCase().includes(lowerSearchTerm)) ||
          (state && state.toLowerCase().includes(lowerSearchTerm)) ||
          (country && country.toLowerCase().includes(lowerSearchTerm)) ||
          (postalCode && postalCode.toLowerCase().includes(lowerSearchTerm))
        ) {
          return true;
        }
      }
      
      // Check amenities
      if (parlor.amenities && parlor.amenities.some(a => a.toLowerCase().includes(lowerSearchTerm))) {
        return true;
      }
      
      return false;
    });
    
    return parlors.slice(0, limit);
  }
}

module.exports = Parlor;