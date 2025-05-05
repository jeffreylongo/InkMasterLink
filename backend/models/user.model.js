const db = require('./db');

class User {
  static findById(id) {
    return db.findById('users', id);
  }
  
  static findByEmail(email) {
    return db.findOne('users', { email });
  }
  
  static findByUsername(username) {
    return db.findOne('users', { username });
  }
  
  static create(userData) {
    return db.create('users', userData);
  }
  
  static update(id, updates) {
    return db.update('users', id, updates);
  }
  
  static delete(id) {
    return db.delete('users', id);
  }
  
  static findAll(filter = {}) {
    return db.findAll('users', filter);
  }
  
  static findOne(filter) {
    return db.findOne('users', filter);
  }
}

module.exports = User;