const db = require('./db');

class Guestspot {
  static findById(id) {
    return db.findById('guestspots', id);
  }
  
  static findByParlorId(parlorId) {
    return db.findAll('guestspots', { parlorId });
  }
  
  static findByArtistId(artistId) {
    return db.findAll('guestspots', { artistId });
  }
  
  static create(guestspotData) {
    return db.create('guestspots', guestspotData);
  }
  
  static update(id, updates) {
    return db.update('guestspots', id, updates);
  }
  
  static delete(id) {
    return db.delete('guestspots', id);
  }
  
  static findAll(filter = {}) {
    return db.findAll('guestspots', filter);
  }
  
  static findOne(filter) {
    return db.findOne('guestspots', filter);
  }
  
  static getUpcoming(limit = 6) {
    const now = new Date();
    
    const guestspots = db.findAll('guestspots').filter(spot => {
      const startDate = new Date(spot.dateStart);
      return startDate > now;
    });
    
    // Sort by upcoming soonest first
    guestspots.sort((a, b) => {
      return new Date(a.dateStart) - new Date(b.dateStart);
    });
    
    return guestspots.slice(0, limit);
  }
  
  static getOpen(limit = 10) {
    const now = new Date();
    
    const guestspots = db.findAll('guestspots').filter(spot => {
      const startDate = new Date(spot.dateStart);
      return (
        startDate > now && 
        (!spot.artistId || spot.artistId === '') && 
        spot.status === 'open'
      );
    });
    
    // Sort by upcoming soonest first
    guestspots.sort((a, b) => {
      return new Date(a.dateStart) - new Date(b.dateStart);
    });
    
    return guestspots.slice(0, limit);
  }
  
  static applyToSpot(guestspotId, artistId, message, portfolio) {
    const guestspot = this.findById(guestspotId);
    
    if (!guestspot) {
      throw new Error('Guestspot not found');
    }
    
    if (guestspot.status !== 'open') {
      throw new Error('Guestspot is not open for applications');
    }
    
    // Create applicant data
    const applicantData = {
      artistId,
      message,
      portfolio,
      created: new Date()
    };
    
    // Add to applicants array or create it if doesn't exist
    const applicants = guestspot.applicants || [];
    applicants.push(applicantData);
    
    // Update guestspot with new applicants
    const updatedGuestspot = this.update(guestspotId, { 
      applicants,
      status: 'requested'
    });
    
    return updatedGuestspot;
  }
  
  static approveApplication(guestspotId, artistId) {
    const guestspot = this.findById(guestspotId);
    
    if (!guestspot) {
      throw new Error('Guestspot not found');
    }
    
    if (guestspot.status !== 'requested') {
      throw new Error('Guestspot is not in requested status');
    }
    
    if (!guestspot.applicants || !guestspot.applicants.some(a => a.artistId === artistId)) {
      throw new Error('Artist is not an applicant for this guestspot');
    }
    
    const updatedGuestspot = this.update(guestspotId, { 
      artistId,
      status: 'confirmed'
    });
    
    return updatedGuestspot;
  }
  
  static rejectApplication(guestspotId, artistId) {
    const guestspot = this.findById(guestspotId);
    
    if (!guestspot) {
      throw new Error('Guestspot not found');
    }
    
    if (!guestspot.applicants) {
      throw new Error('No applicants found');
    }
    
    // Filter out the rejected artist
    const updatedApplicants = guestspot.applicants.filter(
      applicant => applicant.artistId !== artistId
    );
    
    // If this was the last applicant, set status back to open
    const status = updatedApplicants.length === 0 ? 'open' : guestspot.status;
    
    const updatedGuestspot = this.update(guestspotId, { 
      applicants: updatedApplicants,
      status
    });
    
    return updatedGuestspot;
  }
  
  static cancelSpot(id) {
    const guestspot = this.findById(id);
    
    if (!guestspot) {
      throw new Error('Guestspot not found');
    }
    
    const updatedGuestspot = this.update(id, { status: 'cancelled' });
    return updatedGuestspot;
  }
  
  static completeSpot(id) {
    const guestspot = this.findById(id);
    
    if (!guestspot) {
      throw new Error('Guestspot not found');
    }
    
    if (guestspot.status !== 'confirmed') {
      throw new Error('Only confirmed guestspots can be completed');
    }
    
    const now = new Date();
    const endDate = new Date(guestspot.dateEnd);
    
    if (now < endDate) {
      throw new Error('Guestspot has not reached its end date yet');
    }
    
    const updatedGuestspot = this.update(id, { status: 'completed' });
    return updatedGuestspot;
  }
}

module.exports = Guestspot;