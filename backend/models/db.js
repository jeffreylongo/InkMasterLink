// In-memory database for development
const { v4: uuidv4 } = require('uuid');

// Database collections with sample data for development
const data = {
  users: [
    {
      id: 'user1',
      email: 'john@example.com',
      username: 'johndoe',
      role: 'artist',
      created: new Date('2024-11-01'),
      profile: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
        bio: 'Tattoo artist with 10 years of experience specializing in traditional and neo-traditional styles.',
        location: {
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA'
        },
        social: {
          instagram: 'johndoetattoos',
          website: 'johndoetattoos.com'
        }
      }
    },
    {
      id: 'user2',
      email: 'sarah@example.com',
      username: 'sarahsmith',
      role: 'parlor_owner',
      created: new Date('2024-10-15'),
      profile: {
        name: 'Sarah Smith',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
        bio: 'Owner of Ink Haven, creating a welcoming space for artists and clients since 2015.',
        location: {
          city: 'New York',
          state: 'NY',
          country: 'USA'
        }
      }
    },
    {
      id: 'user3',
      email: 'alex@example.com',
      username: 'alextattoos',
      role: 'artist',
      created: new Date('2024-11-10'),
      profile: {
        name: 'Alex Johnson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
        bio: 'Specializing in black and gray realism with focus on portrait work.',
        location: {
          city: 'Chicago',
          state: 'IL',
          country: 'USA'
        },
        social: {
          instagram: 'alexjohnsontattoo'
        }
      }
    }
  ],
  artists: [
    {
      id: 'artist1',
      userId: 'user1',
      name: 'John Doe',
      bio: 'Tattoo artist with 10 years of experience specializing in traditional and neo-traditional styles.',
      specialty: ['Traditional', 'Neo-Traditional', 'Japanese'],
      experienceYears: 10,
      profileImage: 'https://images.unsplash.com/photo-1598271290633-b2f2283e2be3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGF0dG9vJTIwYXJ0aXN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      images: [
        'https://images.unsplash.com/photo-1598271290633-b2f2283e2be3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGF0dG9vJTIwYXJ0aXN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
        'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dGF0dG9vfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
      ],
      featured: true,
      sponsored: true,
      portfolio: [
        'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dGF0dG9vfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
        'https://images.unsplash.com/photo-1562962230-16e4623d36e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8dGF0dG9vfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
      ],
      location: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        parlorId: 'parlor1'
      },
      social: {
        instagram: 'johndoetattoos',
        website: 'johndoetattoos.com'
      },
      availability: {
        homeParlorId: 'parlor1',
        travelWilling: true,
        travelPreferences: {
          cities: ['New York', 'Miami', 'San Francisco'],
          states: ['CA', 'NY', 'FL'],
          distance: 500
        }
      },
      upcomingGuestspots: ['guestspot1'],
      rating: 4.8,
      reviewCount: 24,
      created: new Date('2024-11-01'),
      updated: new Date('2025-04-15')
    },
    {
      id: 'artist2',
      userId: 'user3',
      name: 'Alex Johnson',
      bio: 'Specializing in black and gray realism with focus on portrait work.',
      specialty: ['Realism', 'Black and Gray', 'Portraits'],
      experienceYears: 7,
      profileImage: 'https://images.unsplash.com/photo-1607868894064-2b6e7ed1b324?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHRhdHRvbyUyMGFydGlzdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
      images: [
        'https://images.unsplash.com/photo-1607868894064-2b6e7ed1b324?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHRhdHRvbyUyMGFydGlzdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
        'https://images.unsplash.com/photo-1612200716358-b23b8d1293c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dGF0dG9vJTIwYXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
      ],
      featured: true,
      sponsored: false,
      portfolio: [
        'https://images.unsplash.com/photo-1612200716358-b23b8d1293c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dGF0dG9vJTIwYXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
        'https://images.unsplash.com/photo-1541322564812-32d2c73d4a95?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRhdHRvb3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
      ],
      location: {
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        parlorId: 'parlor2'
      },
      social: {
        instagram: 'alexjohnsontattoo'
      },
      availability: {
        homeParlorId: 'parlor2',
        travelWilling: true
      },
      upcomingGuestspots: [],
      rating: 4.9,
      reviewCount: 18,
      created: new Date('2024-11-10'),
      updated: new Date('2025-04-10')
    }
  ],
  parlors: [
    {
      id: 'parlor1',
      name: 'Ink Haven',
      description: 'A premium tattoo studio featuring award-winning artists specializing in various styles.',
      ownerId: 'user2',
      images: [
        'https://images.unsplash.com/photo-1521488674203-62bf581664be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGF0dG9vJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
        'https://images.unsplash.com/photo-1624384562353-4aa1e08a7d1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dGF0dG9vJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
      ],
      featuredImage: 'https://images.unsplash.com/photo-1521488674203-62bf581664be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGF0dG9vJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
      featured: true,
      sponsored: true,
      location: {
        address: '123 Ink Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        }
      },
      contact: {
        phone: '212-555-1234',
        email: 'info@inkhaven.com',
        website: 'inkhaven.com'
      },
      social: {
        instagram: 'ink_haven_tattoos',
        facebook: 'inkhavennyc'
      },
      hours: {
        monday: '12:00 PM - 8:00 PM',
        tuesday: '12:00 PM - 8:00 PM',
        wednesday: '12:00 PM - 8:00 PM',
        thursday: '12:00 PM - 8:00 PM',
        friday: '12:00 PM - 9:00 PM',
        saturday: '12:00 PM - 9:00 PM',
        sunday: 'Closed'
      },
      amenities: ['WiFi', 'Private Rooms', 'Custom Designs', 'Walk-ins Welcome'],
      artistIds: ['artist1'],
      rating: 4.7,
      reviewCount: 35,
      created: new Date('2024-10-15'),
      updated: new Date('2025-03-20')
    },
    {
      id: 'parlor2',
      name: 'Black Lotus Tattoo',
      description: 'Specializing in black and gray realism, portraits, and custom designs in a comfortable atmosphere.',
      ownerId: 'user3',
      images: [
        'https://images.unsplash.com/photo-1598518619776-eae3f8a34edb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHRhdHRvbyUyMHNob3B8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
        'https://images.unsplash.com/photo-1553133816-ad237272b27d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRhdHRvbyUyMHNob3B8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
      ],
      featuredImage: 'https://images.unsplash.com/photo-1598518619776-eae3f8a34edb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHRhdHRvbyUyMHNob3B8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      featured: true,
      sponsored: false,
      location: {
        address: '456 Tattoo Ave',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postalCode: '60607',
        coordinates: {
          lat: 41.8781,
          lng: -87.6298
        }
      },
      contact: {
        phone: '312-555-6789',
        email: 'info@blacklotustattoo.com',
        website: 'blacklotustattoo.com'
      },
      social: {
        instagram: 'blacklotustattoo',
        facebook: 'blacklotustattoo'
      },
      hours: {
        monday: 'Closed',
        tuesday: '11:00 AM - 7:00 PM',
        wednesday: '11:00 AM - 7:00 PM',
        thursday: '11:00 AM - 7:00 PM',
        friday: '11:00 AM - 8:00 PM',
        saturday: '11:00 AM - 8:00 PM',
        sunday: '12:00 PM - 6:00 PM'
      },
      amenities: ['Custom Designs', 'Free Consultations', 'WiFi', 'Parking Available'],
      artistIds: ['artist2'],
      rating: 4.9,
      reviewCount: 28,
      created: new Date('2024-11-10'),
      updated: new Date('2025-04-01')
    }
  ],
  reviews: [
    {
      id: 'review1',
      userId: 'user1',
      targetId: 'parlor2',
      targetType: 'parlor',
      rating: 5,
      title: 'Incredible experience and talent!',
      content: 'I had an amazing session at Black Lotus. The studio is clean, professional, and the artists are incredibly talented.',
      created: new Date('2025-01-15'),
      updated: new Date('2025-01-15')
    },
    {
      id: 'review2',
      userId: 'user3',
      targetId: 'parlor1',
      targetType: 'parlor',
      rating: 4,
      title: 'Great atmosphere and professional service',
      content: 'Ink Haven provides a welcoming environment with very professional artists. Highly recommended!',
      created: new Date('2025-02-10'),
      updated: new Date('2025-02-10')
    },
    {
      id: 'review3',
      userId: 'user2',
      targetId: 'artist1',
      targetType: 'artist',
      rating: 5,
      title: 'John is a true master of his craft',
      content: 'John\'s attention to detail and artistic ability is phenomenal. The tattoo exceeded my expectations!',
      created: new Date('2025-03-05'),
      updated: new Date('2025-03-05')
    }
  ],
  guestspots: [
    {
      id: 'guestspot1',
      parlorId: 'parlor2',
      artistId: 'artist1',
      status: 'confirmed',
      dateStart: new Date('2025-05-15'),
      dateEnd: new Date('2025-05-25'),
      description: 'Excited to be visiting Black Lotus Tattoo in Chicago! Specializing in traditional and neo-traditional work during this visit.',
      requirements: 'Book in advance, deposit required',
      priceInfo: '$200/hr, minimum 2 hours',
      created: new Date('2025-03-10'),
      updated: new Date('2025-03-15')
    },
    {
      id: 'guestspot2',
      parlorId: 'parlor1',
      status: 'open',
      dateStart: new Date('2025-06-10'),
      dateEnd: new Date('2025-06-20'),
      description: 'Ink Haven is looking for talented guest artists for a two-week spot in June. Great opportunity in busy NYC studio.',
      requirements: 'Portfolio review required, minimum 3 years experience',
      priceInfo: '70/30 split in artist\'s favor',
      applicants: [],
      created: new Date('2025-04-01'),
      updated: new Date('2025-04-01')
    }
  ]
};

// Generic CRUD operations
const db = {
  // Create a record
  create: (collection, record) => {
    if (!data[collection]) {
      throw new Error(`Collection ${collection} does not exist`);
    }
    
    const id = record.id || uuidv4();
    const newRecord = { ...record, id, created: new Date(), updated: new Date() };
    data[collection].push(newRecord);
    return newRecord;
  },
  
  // Read records
  findAll: (collection, filter = {}) => {
    if (!data[collection]) {
      throw new Error(`Collection ${collection} does not exist`);
    }
    
    if (Object.keys(filter).length === 0) {
      return [...data[collection]];
    }
    
    return data[collection].filter(record => {
      return Object.entries(filter).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(record[key]) === JSON.stringify(value);
        }
        return record[key] === value;
      });
    });
  },
  
  // Read a single record
  findById: (collection, id) => {
    if (!data[collection]) {
      throw new Error(`Collection ${collection} does not exist`);
    }
    
    return data[collection].find(record => record.id === id) || null;
  },
  
  // Read a single record by a field value
  findOne: (collection, filter) => {
    if (!data[collection]) {
      throw new Error(`Collection ${collection} does not exist`);
    }
    
    return data[collection].find(record => {
      return Object.entries(filter).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(record[key]) === JSON.stringify(value);
        }
        return record[key] === value;
      });
    }) || null;
  },
  
  // Update a record
  update: (collection, id, updates) => {
    if (!data[collection]) {
      throw new Error(`Collection ${collection} does not exist`);
    }
    
    const index = data[collection].findIndex(record => record.id === id);
    if (index === -1) {
      return null;
    }
    
    const record = data[collection][index];
    const updatedRecord = { 
      ...record, 
      ...updates, 
      id, // ensure id doesn't change
      updated: new Date() 
    };
    
    data[collection][index] = updatedRecord;
    return updatedRecord;
  },
  
  // Delete a record
  delete: (collection, id) => {
    if (!data[collection]) {
      throw new Error(`Collection ${collection} does not exist`);
    }
    
    const index = data[collection].findIndex(record => record.id === id);
    if (index === -1) {
      return false;
    }
    
    data[collection].splice(index, 1);
    return true;
  }
};

module.exports = db;